import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { userEmail, userName, pageTitle, pageContext, issueType, question, timestamp } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'BA WorkXP Support <support@baworkxp.com>',
        to: ['techascendconsulting@gmail.com'],
        subject: `🆘 ${issueType === 'technical' ? 'Technical Issue' : 'Help Request'}: ${pageTitle}`,
        html: (() => {
          // Branded email template for help requests (no button)
          const emailTemplate = (params: { title: string; body: string }) => {
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
          <tr><td height="30"></td></tr>
          <tr>
            <td style="border-bottom:1px solid #e5e7eb;"></td>
          </tr>
          <tr><td height="20"></td></tr>
          <tr>
            <td style="font-size:13px; line-height:1.6; color:#6b7280; text-align:center;">
              This email was sent automatically by the BA WorkXP Help System.
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

          const requestDetails = `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <p style="margin: 8px 0;"><strong style="color: #111827;">From:</strong> <span style="color: #4b5563;">${userName || 'Unknown User'} (${userEmail})</span></p>
              <p style="margin: 8px 0;"><strong style="color: #111827;">Page:</strong> <span style="color: #4b5563;">${pageTitle}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #111827;">Context:</strong> <span style="color: #4b5563;">${pageContext}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #111827;">Issue Type:</strong> <span style="color: #4b5563;">${issueType}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #111827;">Time:</strong> <span style="color: #4b5563;">${timestamp}</span></p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #111827; margin-top: 0; margin-bottom: 12px; font-size: 18px;">Question/Issue:</h3>
              <p style="white-space: pre-wrap; color: #4b5563; margin: 0; line-height: 1.6;">${question}</p>
            </div>
          `

          return emailTemplate({
            title: 'New Help Request',
            body: requestDetails
          })
        })()
      })
    })

    const data = await res.json()

    return new Response(JSON.stringify({ success: res.ok, data }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: res.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      status: 400,
    })
  }
})









