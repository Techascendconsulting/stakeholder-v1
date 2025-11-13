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
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Only admins can trigger
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin, is_senior_admin, is_super_admin')
      .eq('user_id', user.id)
      .single()

    if (!profile || (!profile.is_admin && !profile.is_senior_admin && !profile.is_super_admin)) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { email, name } = await req.json()
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    // Generate recovery link (always)
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email })
    if (resetError || !resetData?.properties?.action_link) {
      return new Response(JSON.stringify({ success: false, error: resetError?.message || 'Failed to generate reset link' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const resetLink = resetData.properties.action_link

    let emailSent = false
    let emailData: any = null

    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from: 'BA WorkXP Notifications <notifications@baworkxp.com>',
          to: [email],
          subject: 'BA WorkXP – Set Your Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Welcome${name ? `, ${name}` : ''}!</h2>
              <p>Please set your password using the secure link below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Set Your Password
                </a>
              </div>
              <p style="color: #6b7280; font-size: 12px;">Link expires in 24 hours.</p>
            </div>
          `
        })
      })
      emailSent = emailResponse.ok
      emailData = await emailResponse.json().catch(() => ({}))
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, resetLink, data: emailData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})




