import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  userType: 'new' | 'existing';
  sendEmail: boolean;
  accessRequestId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verify the caller is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin, is_senior_admin, is_super_admin')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || (!profile.is_admin && !profile.is_senior_admin && !profile.is_super_admin)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: CreateUserRequest = await req.json()

    if (!body.email || !body.name || !body.password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, name, password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm email so they can sign in immediately
      user_metadata: {
        full_name: body.name
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)
      return new Response(
        JSON.stringify({ error: authError?.message || 'Failed to create auth user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Create/Update user profile with ALL necessary fields (only columns that exist)
    const { error: profileUpsertError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: authData.user.id,
        display_name: body.name,
        user_type: body.userType || 'existing',
        // Security fields (default to false/null for regular users)
        blocked: false,
        locked: false,
        registered_device: null,
        is_admin: false,
        is_super_admin: false,
        is_senior_admin: false,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (profileUpsertError) {
      console.error('Error creating user profile:', profileUpsertError)
      // Don't fail completely - auth user is created, profile can be fixed later
    }

    // Step 3: If this was from an access request, mark it as approved
    if (body.accessRequestId) {
      await supabaseAdmin
        .from('access_requests')
        .update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', body.accessRequestId)
    }

    // Step 4: Log admin activity
    try {
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: user.id,
          action_type: 'user_created',
          target_user_id: authData.user.id,
          metadata: {
            email: body.email,
            name: body.name,
            userType: body.userType,
            sendEmail: body.sendEmail
          },
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.warn('Failed to log admin activity:', logError)
      // Don't fail the request if logging fails
    }

    // Step 5: Send welcome email if requested
    let emailSent = false
    let emailError = null
    
    if (body.sendEmail) {
      try {
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
        if (!RESEND_API_KEY) {
          console.warn('⚠️ RESEND_API_KEY not configured. Email will not be sent.')
          emailError = 'RESEND_API_KEY not configured in Supabase Edge Functions'
        } else {
          // Generate password reset link so user can set their own password
          const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: body.email
          })

          if (resetError) {
            console.error('Error generating password reset link:', resetError)
            emailError = resetError.message
          } else if (resetData?.properties?.action_link) {
            const resetLink = resetData.properties.action_link

            const emailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
              },
              body: JSON.stringify({
                from: 'BA WorkXP <onboarding@resend.dev>',
                to: [body.email],
                subject: 'Welcome to BA WorkXP - Set Your Password',
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7c3aed;">Welcome to BA WorkXP!</h2>
                    
                    <p>Hi ${body.name},</p>
                    
                    <p>Your account has been created. To get started, please set your password by clicking the link below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        Set Your Password
                      </a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px;">
                      Or use these temporary credentials to sign in:<br>
                      Email: ${body.email}<br>
                      Password: ${body.password}
                    </p>
                    
                    <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                      This link will expire in 24 hours. If you need help, contact support.
                    </p>
                  </div>
                `
              })
            })

            const emailResult = await emailResponse.json()
            
            if (emailResponse.ok) {
              console.log('✅ Welcome email sent successfully to:', body.email)
              emailSent = true
            } else {
              console.error('❌ Failed to send email:', emailResult)
              emailError = emailResult.message || 'Failed to send email'
            }
          } else {
            emailError = 'Failed to generate password reset link'
          }
        }
      } catch (err) {
        console.error('Exception while sending email:', err)
        emailError = err.message || 'Email sending failed'
      }
    }

    // Return success with email status
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: body.name
        },
        message: 'User created successfully',
        emailSent: emailSent,
        emailError: emailError || undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

