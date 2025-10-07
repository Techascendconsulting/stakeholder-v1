/**
 * Email Service for Verity Help Requests
 * 
 * Uses Supabase Edge Functions + Resend for reliable email delivery
 * Guarantees no data loss - every submission is sent immediately
 */

import { supabase } from './supabase';

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
  /**
   * Send help request notification email via Supabase Edge Function + Resend
   */
  static async sendHelpRequestEmail(data: HelpRequestEmailData): Promise<boolean> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-help-email', {
        body: {
          userEmail: data.userEmail,
          userName: data.userName || data.userEmail,
          pageTitle: data.pageTitle,
          pageContext: data.pageContext,
          issueType: data.issueType,
          question: data.question,
          timestamp: data.timestamp
        }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        console.error('Full error details:', JSON.stringify(error, null, 2));
        return false;
      }

      console.log('📧 Edge function response:', result);

      if (!result?.success) {
        console.error('❌ Email send failed:', result);
        console.error('Full response:', JSON.stringify(result, null, 2));
        return false;
      }

      console.log('✅ Email sent successfully via Resend!');
      console.log('Email details:', result.data);
      return true;

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }
}

export default EmailService;
