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
          // Branded email template
          html: (() => {
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

            return emailTemplate({
              title: `Welcome${name ? `, ${name}` : ''}!`,
              body: 'Please set your password using the secure link below.<br/><br/>Link expires in 24 hours.',
              buttonUrl: resetLink,
              buttonText: 'Set Your Password'
            })
          })()
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




