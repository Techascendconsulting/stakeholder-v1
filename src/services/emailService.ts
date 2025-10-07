import emailjs from '@emailjs/browser';

/**
 * Email Service for Verity Help Requests
 * 
 * Sends email notifications to techascendconsulting@gmail.com
 * when users submit help requests
 * 
 * Setup required:
 * 1. Sign up at emailjs.com
 * 2. Create email template
 * 3. Add credentials to .env.local:
 *    VITE_EMAILJS_SERVICE_ID=your_service_id
 *    VITE_EMAILJS_TEMPLATE_ID=your_template_id
 *    VITE_EMAILJS_PUBLIC_KEY=your_public_key
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
  private static SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  private static TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  private static PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  /**
   * Send help request notification email
   */
  static async sendHelpRequestEmail(data: HelpRequestEmailData): Promise<boolean> {
    // Check if EmailJS is configured
    if (!this.SERVICE_ID || !this.TEMPLATE_ID || !this.PUBLIC_KEY) {
      console.warn('⚠️ EmailJS not configured - email will not be sent');
      console.log('💡 To enable emails, add to .env.local:');
      console.log('   VITE_EMAILJS_SERVICE_ID=your_service_id');
      console.log('   VITE_EMAILJS_TEMPLATE_ID=your_template_id');
      console.log('   VITE_EMAILJS_PUBLIC_KEY=your_public_key');
      return false;
    }

    try {
      // Initialize EmailJS
      emailjs.init(this.PUBLIC_KEY);

      // Prepare email parameters
      const templateParams = {
        to_email: 'techascendconsulting@gmail.com',
        from_email: data.userEmail,
        from_name: data.userName || data.userEmail,
        page_title: data.pageTitle,
        page_context: data.pageContext,
        issue_type: data.issueType,
        question: data.question,
        timestamp: data.timestamp,
        subject: `🆘 ${data.issueType === 'technical' ? 'Technical Issue' : 'Help Request'}: ${data.pageTitle}`
      };

      // Send email
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Email sent successfully:', response);
      return true;

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }
}

export default EmailService;
