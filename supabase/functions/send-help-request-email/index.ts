// Supabase Edge Function: send-help-request-email
// Triggered by database webhook when new help_requests are inserted
// Sends email notification to techascendconsulting@gmail.com

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TO_EMAIL = 'techascendconsulting@gmail.com';

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log('📧 Webhook received:', payload);

    // Extract the new record from webhook payload
    const record = payload.record;

    if (!record) {
      return new Response(
        JSON.stringify({ error: 'No record in payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build email content
    const emailSubject = `🆘 New Help Request: ${record.issue_type || 'General'} - ${record.page_title || 'Unknown Page'}`;
    
    const emailBody = `
<h2>New Help Request from BA WorkXP</h2>

<p><strong>User:</strong> ${record.email || 'Anonymous'}</p>
<p><strong>Page:</strong> ${record.page_title || 'Unknown'} (${record.page_context || 'N/A'})</p>
<p><strong>Issue Type:</strong> ${record.issue_type || 'General'}</p>
<p><strong>Date:</strong> ${new Date(record.created_at).toLocaleString()}</p>

<hr>

<h3>Question/Issue:</h3>
<p>${record.question}</p>

<hr>

<p><a href="https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor/help_requests?filter=id%3Deq%3D${record.id}" style="background: #9333ea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">View in Supabase Dashboard</a></p>
    `.trim();

    // Send email using Resend API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Verity <verity@baworkxp.com>', // Change to your verified domain
        to: [TO_EMAIL],
        subject: emailSubject,
        html: emailBody
      })
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('❌ Resend API error:', error);
      throw new Error(`Resend API error: ${error}`);
    }

    const emailData = await emailResponse.json();
    console.log('✅ Email sent successfully:', emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in send-help-request-email function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

