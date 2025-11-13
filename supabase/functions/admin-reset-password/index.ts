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
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin, is_senior_admin, is_super_admin')
      .eq('user_id', user.id)
      .single()

    if (!profile || (!profile.is_admin && !profile.is_senior_admin && !profile.is_super_admin)) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate password reset link
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://baworkxp.co.uk/set-password'
      }
    })

    if (resetError || !resetData?.properties?.action_link) {
      return new Response(
        JSON.stringify({ error: resetError?.message || 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use Supabase's action_link which will verify and redirect to /set-password
    const resetLink = resetData.properties.action_link
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's display name
    const { data: userProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('display_name')
      .eq('user_id', resetData.user.id)
      .single()

    const userName = userProfile?.display_name || resetData.user.email?.split('@')[0] || 'there'

    // Send password reset email via Resend
    // New branded reset password email template
    const emailTemplate = (params: { name: string; resetLink: string }) => {
      return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password – BA WorkXP</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #f7f7fc;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <!-- Header -->
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #7c3aed; padding: 24px 0; text-align: center;"
    >
      <tr>
        <td>
          <span
            style="
              color: #ffffff;
              font-size: 22px;
              font-weight: bold;
              letter-spacing: 0.5px;
            "
          >
            BA WORKXP
          </span>
        </td>
      </tr>
    </table>
    <!-- Body Container -->
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding: 32px 16px;"
    >
      <tr>
        <td align="center">
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 560px;
              background: #ffffff;
              border-radius: 12px;
              padding: 32px;
              text-align: left;
            "
          >
            <!-- Title -->
            <tr>
              <td
                style="
                  font-size: 26px;
                  font-weight: 700;
                  color: #1f2937;
                  padding-bottom: 12px;
                "
              >
                Reset Your Password
              </td>
            </tr>
            <!-- Greeting -->
            <tr>
              <td
                style="
                  font-size: 15px;
                  line-height: 22px;
                  color: #4b5563;
                  padding-bottom: 20px;
                "
              >
                Hi ${params.name},
                <br /><br />
                You requested to reset the password for your BA WorkXP account.
                Click the button below to create a new password.
              </td>
            </tr>
            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding: 16px 0;">
                <a
                  href="${params.resetLink}"
                  style="
                    display: inline-block;
                    background-color: #7c3aed;
                    color: #ffffff;
                    padding: 14px 28px;
                    font-size: 16px;
                    font-weight: bold;
                    text-decoration: none;
                    border-radius: 8px;
                  "
                >
                  Reset Password
                </a>
              </td>
            </tr>
            <!-- Expiry Note -->
            <tr>
              <td
                style="
                  font-size: 13px;
                  color: #6b7280;
                  padding-top: 12px;
                  line-height: 20px;
                "
              >
                This link will expire in <strong>2 hours</strong> for security.
                If it stops working, you can request another reset link anytime from the login page.
              </td>
            </tr>
            <!-- Fallback Link -->
            <tr>
              <td
                style="
                  font-size: 13px;
                  color: #6b7280;
                  padding-top: 24px;
                  word-break: break-all;
                "
              >
                If the button doesn't work, paste this into your browser:<br />
                <a href="${params.resetLink}" style="color: #7c3aed;">
                  ${params.resetLink}
                </a>
              </td>
            </tr>
            <!-- Divider -->
            <tr>
              <td
                style="
                  border-top: 1px solid #e5e7eb;
                  margin-top: 32px;
                  padding-top: 24px;
                "
              ></td>
            </tr>
            <!-- Security Message -->
            <tr>
              <td
                style="
                  font-size: 13px;
                  line-height: 20px;
                  color: #6b7280;
                "
              >
                If you didn't request this password reset, please ignore this email.
                Your account will remain unchanged.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!-- Footer -->
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        padding: 24px 0;
        background-color: #ffffff;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
      "
    >
      <tr>
        <td>
          BA WorkXP · Empowering Career-Changers to Gain Real BA Experience  
          <br /><br />
          Need help? Email us at: 
          <a href="mailto:support@baworkxp.com" style="color: #7c3aed;">
            support@baworkxp.com
          </a>
        </td>
      </tr>
    </table>
  </body>
</html>
      `
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'BA WorkXP <no-reply@baworkxp.com>',
        to: [email],
        subject: 'Reset Your Password – BA WorkXP',
        html: emailTemplate({
          name: userName,
          resetLink: resetLink
        })
      })
    })

    const emailData = await emailResponse.json().catch(() => ({}))

    if (!emailResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log admin activity
    try {
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: user.id,
          action_type: 'password_reset_sent',
          target_user_id: resetData.user.id,
          metadata: { email },
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.warn('Failed to log admin activity:', logError)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-reset-password function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

