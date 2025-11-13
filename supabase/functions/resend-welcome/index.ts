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
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://baworkxp.co.uk/set-password'
      }
    })
    if (resetError || !resetData?.properties?.action_link) {
      return new Response(JSON.stringify({ success: false, error: resetError?.message || 'Failed to generate reset link' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Use Supabase's action_link which will verify and redirect to /set-password
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
          // Branded welcome email template with image
          html: (() => {
            const emailTemplate = (params: { firstName: string; buttonUrl: string; buttonText: string }) => {
              return `
<!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>Welcome to BA WorkXP</title>
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
                <h1 style="margin:0 0 10px 0; font-size:24px; line-height:1.3; color:#111827;">
                  Welcome to BA WorkXP, ${params.firstName} 👋
                </h1>
                <!-- Intro copy -->
                <p style="margin:0 0 14px 0; font-size:14px; line-height:1.7; color:#4b5563;">
                  Your BA WorkXP account has been created.
                  This is where you start learning the <strong>actual work</strong> of a Business Analyst — the kind of work you'd be doing on the job:
                  talking to stakeholders, understanding problems, mapping processes, and documenting what needs to be built.
                </p>
                <p style="margin:0 0 18px 0; font-size:14px; line-height:1.7; color:#4b5563;">
                  Think of this as learning <strong>on the job</strong>, but in a guided, safe space where you can practice, repeat, and build confidence.
                  First step: set your password so you can access your workspace.
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
                      ">
                        ${params.buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
                <!-- Small note under CTA -->
                <p style="margin:0 0 22px 0; font-size:12px; line-height:1.6; color:#6b7280;">
                  This link will expire after a short time for security. If it stops working, you can always request a new password reset from the login page.
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
                           width="100%"
                           style="display:block; border:0; max-width:100%; height:auto;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <!-- What you'll be doing -->
            <tr>
              <td style="padding:16px 26px 8px 26px;">
                <h2 style="margin:0 0 8px 0; font-size:16px; color:#111827;">
                  What you'll be doing inside BA WorkXP
                </h2>
                <p style="margin:0 0 12px 0; font-size:13px; line-height:1.7; color:#4b5563;">
                  Once you've set your password and signed in, you'll be guided step-by-step through core BA activities, just like you're already on a real team:
                </p>
                <ul style="margin:0 0 14px 18px; padding:0; font-size:13px; line-height:1.7; color:#4b5563;">
                  <li>Learning how to talk to stakeholders and ask the right questions.</li>
                  <li>Breaking down business problems and mapping current vs future processes.</li>
                  <li>Practicing how to document requirements in a clear, structured way.</li>
                  <li>Writing user stories and acceptance criteria that developers can actually use.</li>
                </ul>
                <p style="margin:0 0 18px 0; font-size:13px; line-height:1.7; color:#4b5563;">
                  It's not theory. It's practice — so when someone asks you to "talk about the work you've done as a BA", you'll finally have something real to say.
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
                <p style="margin:0 0 6px 0; font-size:12px; line-height:1.6; color:#6b7280;">
                  If you didn't expect this email, you can safely ignore it.
                </p>
                <p style="margin:0 0 0 0; font-size:12px; line-height:1.6; color:#6b7280;">
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

            return emailTemplate({
              firstName: name || 'there',
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






