// Quick test to verify Resend API key works
import { Resend } from 'resend';

const resend = new Resend('re_9nSy9s5h_9AJT93peQoqaDPmDxbvEn8ff');

(async () => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'techascendconsulting@gmail.com',
      subject: '✅ Resend Test - Verity Email System',
      html: '<h2>Success!</h2><p>Your Resend API key is working correctly. Verity email notifications are now active! 🎉</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Email ID:', data.id);
    console.log('Check techascendconsulting@gmail.com for the test email.');
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
  }
})();

