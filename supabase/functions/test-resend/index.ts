import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    console.log('🔍 [TEST-RESEND] Function invoked')
    console.log('🔍 [TEST-RESEND] Method:', req.method)
    
    // No authentication required for testing - this is a simple test function

    // Get RESEND_API_KEY from environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    console.log('🔍 [TEST-RESEND] RESEND_API_KEY exists:', !!RESEND_API_KEY)
    console.log('🔍 [TEST-RESEND] RESEND_API_KEY length:', RESEND_API_KEY ? RESEND_API_KEY.length : 0)
    console.log('🔍 [TEST-RESEND] RESEND_API_KEY prefix:', RESEND_API_KEY ? RESEND_API_KEY.substring(0, 10) + '...' : 'N/A')

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RESEND_API_KEY not found in environment variables',
          message: 'Please set RESEND_API_KEY in Supabase Edge Functions secrets'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body for custom test email (optional)
    let testEmail = 'testuser+baworkxp@gmail.com'
    try {
      const body = await req.json().catch(() => ({}))
      if (body.email) {
        testEmail = body.email
      }
    } catch {
      // Use default if no body provided
    }

    console.log('🔍 [TEST-RESEND] Sending test email to:', testEmail)

    // Prepare email payload
    const emailPayload = {
      from: 'BA WorkXP Notifications <notifications@baworkxp.com>',
      to: [testEmail],
      subject: 'Resend Test from Edge Functions',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Test Email from BA WorkXP Edge Functions</h2>
          <p>This is a test email to verify Resend API integration.</p>
          <p>If you receive this, the Resend API key is working correctly!</p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Sent at: ${new Date().toISOString()}
          </p>
        </div>
      `
    }

    console.log('🔍 [TEST-RESEND] Email payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject
    })

    // Send email via Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify(emailPayload)
    })

    console.log('🔍 [TEST-RESEND] Resend API response status:', emailResponse.status)
    console.log('🔍 [TEST-RESEND] Resend API response ok:', emailResponse.ok)

    let emailResult: any = {}
    try {
      emailResult = await emailResponse.json()
      console.log('🔍 [TEST-RESEND] Resend API response body:', JSON.stringify(emailResult, null, 2))
    } catch (parseError) {
      const textResult = await emailResponse.text()
      console.error('❌ [TEST-RESEND] Failed to parse response as JSON:', textResult)
      emailResult = { 
        error: 'Failed to parse response', 
        raw: textResult,
        parseError: parseError.message 
      }
    }

    if (emailResponse.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          emailId: emailResult.id,
          to: testEmail,
          from: emailPayload.from,
          resendResponse: emailResult
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to send test email',
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          resendError: emailResult,
          message: emailResult.message || emailResult.error?.message || `Resend API returned ${emailResponse.status}`
        }),
        {
          status: emailResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('❌ [TEST-RESEND] Exception:', error)
    console.error('❌ [TEST-RESEND] Exception details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal error in test function',
        message: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

