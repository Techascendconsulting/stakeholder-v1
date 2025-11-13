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

    // Send email via Resend
    // Branded email template matching welcome email style
    const emailTemplate = (params: { title: string; body: string; buttonUrl: string; buttonText: string }) => {
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
  <body style="margin:0; padding:0; background:#f7f7fb; font-family:Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f7f7fb; padding:24px 0;">
      <tr>
        <td align="center">
          <!-- Main card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 4px 12px rgba(15,23,42,0.12);">
            <!-- Gradient header with brand -->
            <tr>
              <td align="center" style="padding:18px 24px; background:linear-gradient(90deg,#7c3aed,#4f46e5);">
                <span style="font-size:18px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; color:#f9fafb;">
                  BA WorkXP
                </span>
              </td>
            </tr>
            <!-- Content wrapper -->
            <tr>
              <td style="padding:28px 26px 6px 26px;">
                <!-- Title -->
                <h1 style="margin:0 0 10px 0; font-size:24px; line-height:1.3; color:#111827; font-family:Arial, sans-serif;">
                  ${params.title}
                </h1>
                <!-- Intro copy -->
                <p style="margin:0 0 14px 0; font-size:14px; line-height:1.7; color:#4b5563; font-family:Arial, sans-serif;">
                  ${params.body}
                </p>
                <!-- CTA button - CENTERED -->
                <table border="0" cellspacing="0" cellpadding="0" style="margin:0 0 20px 0; width:100%;">
                  <tr>
                    <td align="center">
                      <a href="${params.buttonUrl}" style="
                        background:#7c3aed;
                        color:#ffffff;
                        padding:12px 24px;
                        border-radius:999px;
                        text-decoration:none;
                        font-size:14px;
                        font-weight:600;
                        display:inline-block;
                        font-family:Arial, sans-serif;
                      ">
                        ${params.buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
                <!-- Small note under CTA -->
                <p style="margin:0 0 22px 0; font-size:12px; line-height:1.6; color:#6b7280; font-family:Arial, sans-serif;">
                  This link will expire in 2 hours for security. If it stops working, you can request a new password reset link from the login page.
                </p>
              </td>
            </tr>
            <!-- Hero image section -->
            <tr>
              <td style="padding:0 26px 8px 26px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="
                  border-radius:12px;
                  overflow:hidden;
                  background:#0f172a;
                ">
                  <tr>
                    <td>
                      <img src="https://ckppwcsnkbrgekxtwccq.supabase.co/storage/v1/object/public/community-files/email.jpg"
                           alt="Practicing stakeholder meetings inside BA WorkXP"
                           width="600"
                           style="display:block; border:0; max-width:100%; width:100%; height:auto; background:#0f172a;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- Security note -->
            <tr>
              <td style="padding:16px 26px 8px 26px;">
                <p style="margin:0 0 12px 0; font-size:14px; line-height:1.7; color:#4b5563; font-family:Arial, sans-serif;">
                  If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </td>
            </tr>
            <!-- Divider -->
            <tr>
              <td style="padding:0 26px;">
                <hr style="border:none; border-top:1px solid #e5e7eb; margin:8px 0 12px 0;" />
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:0 26px 22px 26px; text-align:left;">
                <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#6b7280; font-family:Arial, sans-serif;">
                  If you didn't expect this email, you can safely ignore it.
                </p>
                <p style="margin:0 0 0 0; font-size:12px; line-height:1.6; color:#6b7280; font-family:Arial, sans-serif;">
                  For help, reply to this email or contact
                  <a href="mailto:support@baworkxp.com" style="color:#7c3aed; text-decoration:none;">
                    support@baworkxp.com
                  </a>.
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
        subject: 'Reset Your Password - BA WorkXP',
        html: emailTemplate({
          title: 'Reset Your Password',
          body: 'You requested to reset your password for your BA WorkXP account. Click the button below to set a new password.',
          buttonUrl: resetLink,
          buttonText: 'Reset Password'
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

