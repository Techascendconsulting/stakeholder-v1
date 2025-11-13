import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Generate password reset link
    const { data: resetData, 
        error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://baworkxp.co.uk/set-password'
      }
    })

    if (resetError || !resetData?.properties?.action_link) {
      console.error('Error generating reset link:', resetError)
      return new Response(
        JSON.stringify({ error: resetError?.message || 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use Supabase's action_link which will verify and redirect to /set-password
    const resetLink = resetData.properties.action_link
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's name for personalization
    let userName = ''
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserByEmail(email)
      if (userData?.user?.id) {
        const { data: profile } = await supabaseAdmin
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', userData.user.id)
          .single()
        userName = profile?.display_name || userData.user.email?.split('@')[0] || 'there'
      } else {
        userName = email.split('@')[0] || 'there'
      }
    } catch (nameError) {
      console.warn('Could not fetch user name, using email:', nameError)
      userName = email.split('@')[0] || 'there'
    }

    // Send email via Resend
    // Premium branded reset password email template
    const emailTemplate = (params: { name: string; resetLink: string }) => {
      return `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Reset Your Password - BA WorkXP</title>
  </head>
  <body style="margin:0; padding:0; background:#f7f7fb; font-family:Arial, Helvetica, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f7f7fb; padding:32px 0;">
      <tr>
        <td align="center">
          <!-- Main card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 16px rgba(15,23,42,0.08);">
            <!-- Gradient header with brand -->
            <tr>
              <td align="center" style="padding:24px 28px; background:linear-gradient(90deg,#7c3aed,#4f46e5);">
                <span style="font-size:20px; font-weight:700; letter-spacing:0.05em; text-transform:uppercase; color:#f9fafb;">
                  BA WorkXP
                </span>
              </td>
            </tr>
            <!-- Content wrapper -->
            <tr>
              <td style="padding:40px 32px;">
                <!-- Icon/Visual element -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td align="center" style="padding-bottom:20px;">
                      <div style="width:64px; height:64px; background:linear-gradient(135deg,#7c3aed,#4f46e5); border-radius:16px; display:inline-block; text-align:center; line-height:64px;">
                        <span style="font-size:32px; color:#ffffff;">🔐</span>
                      </div>
                    </td>
                  </tr>
                </table>
                <!-- Title -->
                <h1 style="margin:0 0 16px 0; font-size:28px; line-height:1.3; color:#111827; font-weight:700; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  Reset Your Password
                </h1>
                <!-- Greeting -->
                <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#4b5563; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  Hi ${params.name},
                </p>
                <p style="margin:0 0 32px 0; font-size:15px; line-height:1.7; color:#4b5563; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  You requested to reset your password for your BA WorkXP account. Click the button below to create a new secure password.
                </p>
                <!-- CTA Button -->
                <table border="0" cellspacing="0" cellpadding="0" style="margin:0 auto 28px auto; width:100%; max-width:280px;">
                  <tr>
                    <td align="center">
                      <a href="${params.resetLink}" style="
                        background:linear-gradient(90deg,#7c3aed,#4f46e5);
                        color:#ffffff;
                        padding:16px 32px;
                        border-radius:10px;
                        text-decoration:none;
                        font-size:16px;
                        font-weight:600;
                        display:inline-block;
                        font-family:Arial, Helvetica, sans-serif;
                        box-shadow:0 4px 12px rgba(124,58,237,0.3);
                        transition:all 0.2s;
                      ">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
                <!-- Expiry Note -->
                <div style="background:#f9fafb; border-left:4px solid #7c3aed; padding:16px 20px; border-radius:8px; margin-bottom:24px;">
                  <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280; font-family:Arial, Helvetica, sans-serif;">
                    <strong style="color:#111827;">⏰ Security Note:</strong> This link will expire in <strong style="color:#7c3aed;">2 hours</strong> for your security. If it stops working, you can request another reset link from the login page.
                  </p>
                </div>
                <!-- Divider -->
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0 24px 0;" />
                <!-- Security Message -->
                <p style="margin:0 0 8px 0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  If you didn't request this password reset, please ignore this email.
                </p>
                <p style="margin:0; font-size:13px; line-height:1.6; color:#6b7280; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  Your account will remain unchanged and secure.
                </p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px; background:#f9fafb; border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 8px 0; font-size:12px; line-height:1.6; color:#6b7280; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  <strong style="color:#111827;">BA WorkXP</strong> · Empowering Career-Changers to Gain Real BA Experience
                </p>
                <p style="margin:0; font-size:12px; line-height:1.6; color:#6b7280; text-align:center; font-family:Arial, Helvetica, sans-serif;">
                  Need help? Email us at 
                  <a href="mailto:support@baworkxp.com" style="color:#7c3aed; text-decoration:none; font-weight:600;">
                    support@baworkxp.com
                  </a>
                </p>
              </td>
            </tr>
          </table>
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
      console.error('Resend API error:', emailData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Password reset email sent' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in reset-password function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

