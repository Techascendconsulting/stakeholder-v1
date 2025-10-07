/**
 * Email Service for Verity Help Requests
 * 
 * Uses FormSubmit.co - a free email service that requires NO SETUP!
 * Sends email notifications to techascendconsulting@gmail.com
 * when users submit help requests
 * 
 * How it works:
 * 1. POST form data to https://formsubmit.co/your-email@example.com
 * 2. FormSubmit sends email to that address
 * 3. No API keys, no signup, no config needed!
 * 
 * First time only: FormSubmit sends confirmation email to verify address
 */

interface HelpRequestEmailData {
  userEmail: string;
  userName?: string;
  pageTitle: string;
  pageContext: string;
  issueType: 'learning' | 'technical';
  question: string;
  timestamp: string;
}

export class EmailService {
  private static RECIPIENT_EMAIL = 'techascendconsulting@gmail.com';

  /**
   * Send help request notification email via FormSubmit.co
   * No configuration needed - just works!
   */
  static async sendHelpRequestEmail(data: HelpRequestEmailData): Promise<boolean> {
    try {
      const formData = new FormData();
      
      // FormSubmit.co special fields (start with _)
      formData.append('_subject', `🆘 ${data.issueType === 'technical' ? 'Technical Issue' : 'Help Request'}: ${data.pageTitle}`);
      formData.append('_template', 'box'); // Use FormSubmit's nice HTML template
      formData.append('_captcha', 'false'); // Disable captcha for automated requests
      
      // Custom data fields (will appear in the email)
      formData.append('User Email', data.userEmail);
      formData.append('User Name', data.userName || data.userEmail);
      formData.append('Page Title', data.pageTitle);
      formData.append('Page Context', data.pageContext);
      formData.append('Issue Type', data.issueType);
      formData.append('Question/Issue', data.question);
      formData.append('Timestamp', data.timestamp);

      // Send to FormSubmit.co
      const response = await fetch(`https://formsubmit.co/${this.RECIPIENT_EMAIL}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json' // Get JSON response instead of redirect
        }
      });

      if (!response.ok) {
        throw new Error(`FormSubmit.co returned status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Email sent successfully via FormSubmit.co:', result);
      return true;

    } catch (error) {
      console.error('❌ Failed to send email via FormSubmit.co:', error);
      return false;
    }
  }
}

export default EmailService;
