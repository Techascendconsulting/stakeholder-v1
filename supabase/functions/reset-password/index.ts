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
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email
    })

    if (resetError || !resetData?.properties?.action_link) {
      console.error('Error generating reset link:', resetError)
      return new Response(
        JSON.stringify({ error: resetError?.message || 'Failed to generate reset link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
    // Branded email template
    const emailTemplate = (params: { title: string; body: string; buttonUrl?: string; buttonText?: string }) => {
      const buttonHtml = params.buttonUrl && params.buttonText
        ? `
          <tr><td height="25"></td></tr>
          <tr>
            <td align="center">
              <a href="${params.buttonUrl}" style="
                background:#7c3aed;
                color:#ffffff;
                padding:14px 28px;
                border-radius:8px;
                text-decoration:none;
                font-size:15px;
                font-weight:600;
                display:inline-block;
              ">
                ${params.buttonText}
              </a>
            </td>
          </tr>
          <tr><td height="30"></td></tr>
        `
        : ''

      return `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>BA WorkXP</title>
</head>
<body style="margin:0; padding:0; background:#f7f7f7; font-family:Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f7f7f7; padding:30px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="
          max-width:550px;
          background:#ffffff;
          border-radius:14px;
          padding:40px 32px;
          box-shadow:0 4px 12px rgba(0,0,0,0.08);
        ">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <div style="
                background: linear-gradient(90deg, #7c3aed, #4f46e5);
                width:100%;
                height:6px;
                border-radius:6px;
                margin-bottom:28px;
              "></div>
            </td>
          </tr>
          <tr>
            <td style="font-size:24px; font-weight:700; color:#111827; padding-bottom:10px;">
              ${params.title}
            </td>
          </tr>
          <tr>
            <td style="font-size:15px; line-height:1.7; color:#4b5563;">
              ${params.body}
            </td>
          </tr>
          ${buttonHtml}
          <tr>
            <td style="border-bottom:1px solid #e5e7eb;"></td>
          </tr>
          <tr><td height="20"></td></tr>
          <tr>
            <td style="font-size:13px; line-height:1.6; color:#6b7280; text-align:center;">
              If you didn't request this email, please ignore it.
              <br/>
              Need help? Contact 
              <a href="mailto:support@baworkxp.com" style="color:#7c3aed; text-decoration:none;">
                support@baworkxp.com
              </a>
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
          body: 'You requested to reset your password. Click the button below to continue.<br/><br/>This link will expire in 24 hours.',
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

