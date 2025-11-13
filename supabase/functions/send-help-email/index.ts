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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">New Help Request from Verity</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>From:</strong> ${userName || 'Unknown User'} (${userEmail})</p>
              <p><strong>Page:</strong> ${pageTitle}</p>
              <p><strong>Context:</strong> ${pageContext}</p>
              <p><strong>Issue Type:</strong> ${issueType}</p>
              <p><strong>Time:</strong> ${timestamp}</p>
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3>Question/Issue:</h3>
              <p style="white-space: pre-wrap;">${question}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
              This email was sent automatically by the Verity Help System.
            </p>
          </div>
        `
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









