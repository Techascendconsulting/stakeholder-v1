import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: adminUser }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !adminUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin - verify admin role
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin, is_senior_admin, is_super_admin')
      .eq('user_id', adminUser.id)
      .single()

    if (!profile || (!profile.is_admin && !profile.is_senior_admin && !profile.is_super_admin)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { targetUserId } = await req.json()

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify target user exists
    const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(targetUserId)

    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if target user is a higher-level admin
    const { data: targetProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin, is_senior_admin, is_super_admin')
      .eq('user_id', targetUserId)
      .single()

    // Prevent impersonation of higher-level admins
    if (targetProfile?.is_super_admin && !profile.is_super_admin) {
      return new Response(
        JSON.stringify({ error: 'Cannot impersonate super admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (targetProfile?.is_senior_admin && !profile.is_super_admin) {
      return new Response(
        JSON.stringify({ error: 'Cannot impersonate senior admin' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a session for the target user (2-hour expiry = 7200 seconds)
    const expiresIn = 7200 // 2 hours in seconds

    // Use Admin API to generate magic link - this creates tokens embedded in the URL
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.email!,
      options: {
        redirectTo: `${supabaseUrl}/auth/callback`
      }
    })

    if (linkError || !linkData?.properties?.action_link) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate impersonation session',
          details: linkError?.message || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract tokens from the action_link URL
    // Magic links contain tokens in the URL hash: #access_token=...&refresh_token=...
    const actionLink = linkData.properties.action_link
    let accessToken: string | null = null
    let refreshToken: string | null = null

    try {
      const urlObj = new URL(actionLink)
      const hash = urlObj.hash.substring(1) // Remove # from hash
      const hashParams = new URLSearchParams(hash)
      accessToken = hashParams.get('access_token')
      refreshToken = hashParams.get('refresh_token')
    } catch (parseError) {
      // If URL parsing fails, try alternative approaches
      // Check if tokens are in query params instead of hash
      try {
        const urlObj = new URL(actionLink)
        accessToken = urlObj.searchParams.get('access_token')
        refreshToken = urlObj.searchParams.get('refresh_token')
      } catch (e) {
        // Ignore parse errors
      }
    }

    // If tokens still not found, try recovery link approach
    if (!accessToken) {
      const { data: recoveryData, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: targetUser.email!,
      })

      if (!recoveryError && recoveryData?.properties?.action_link) {
        const recoveryLink = recoveryData.properties.action_link
        try {
          const urlObj = new URL(recoveryLink)
          const hash = urlObj.hash.substring(1)
          const hashParams = new URLSearchParams(hash)
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    if (!accessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to extract tokens from magic link',
          details: 'Tokens could not be extracted from generated link'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log admin activity (NEVER log tokens - security requirement)
    try {
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: adminUser.id,
          action_type: 'user_impersonation',
          target_user_id: targetUserId,
          metadata: { 
            target_email: targetUser.email,
            expires_in: expiresIn
            // DO NOT include tokens in metadata
          },
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      // Silently fail logging - don't expose errors
    }

    // Return session tokens with 2-hour expiry indication
    // Note: Actual JWT expiry is set by Supabase when generating the link
    // The expires_in value indicates the intended session duration
    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken || '',
        expires_in: expiresIn,
        targetUserId,
        targetEmail: targetUser.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    // Do not log tokens, service role key, or any sensitive data
    console.error('Error in admin-login-as-user function')
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
