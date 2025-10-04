import { supabase } from '../lib/supabase';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  /**
   * Send device reset notification email
   */
  async sendDeviceResetNotification(userEmail: string, userName?: string): Promise<boolean> {
    try {
      const template = this.createDeviceResetTemplate(userEmail, userName);
      
      // For now, we'll use a placeholder email service
      // In production, you'd integrate with SendGrid, AWS SES, etc.
      console.log('📧 EMAIL: Sending device reset notification to:', userEmail);
      console.log('📧 EMAIL: Subject:', template.subject);
      console.log('📧 EMAIL: Content:', template.text);
      
      // TODO: Replace with actual email service integration
      // await this.sendEmail(template);
      
      // For now, we'll store the notification in the database for tracking
      await this.logEmailNotification(userEmail, 'device_reset', template);
      
      return true;
    } catch (error) {
      console.error('📧 EMAIL: Failed to send device reset notification:', error);
      return false;
    }
  }

  /**
   * Send admin invitation email
   */
  async sendAdminInvitation(inviteEmail: string, inviteRole: string, token: string): Promise<boolean> {
    try {
      const template = this.createAdminInvitationTemplate(inviteEmail, inviteRole, token);
      
      console.log('📧 EMAIL: Sending admin invitation to:', inviteEmail);
      console.log('📧 EMAIL: Subject:', template.subject);
      console.log('📧 EMAIL: Content:', template.text);
      
      // TODO: Replace with actual email service integration
      // await this.sendEmail(template);
      
      // For now, we'll store the notification in the database for tracking
      await this.logEmailNotification(inviteEmail, 'admin_invitation', template);
      
      return true;
    } catch (error) {
      console.error('📧 EMAIL: Failed to send admin invitation:', error);
      return false;
    }
  }

  /**
   * Create device reset email template
   */
  private createDeviceResetTemplate(userEmail: string, userName?: string): EmailTemplate {
    const displayName = userName || userEmail.split('@')[0];
    
    return {
      to: userEmail,
      subject: 'Device Access Reset - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Device Access Reset</h2>
          <p>Hello ${displayName},</p>
          <p>Your device access has been reset by an administrator. To continue using your account, please follow these steps:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Next Steps:</h3>
            <ol style="color: #4b5563;">
              <li>Go to the login page</li>
              <li>Enter your email and password</li>
              <li>When prompted, register your current device</li>
              <li>You'll be able to access your account normally</li>
            </ol>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this reset or have any questions, please contact support immediately.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Device Access Reset
        
        Hello ${displayName},
        
        Your device access has been reset by an administrator. To continue using your account, please follow these steps:
        
        1. Go to the login page
        2. Enter your email and password
        3. When prompted, register your current device
        4. You'll be able to access your account normally
        
        If you didn't request this reset or have any questions, please contact support immediately.
        
        This is an automated message. Please do not reply to this email.
      `
    };
  }

  /**
   * Create admin invitation email template
   */
  private createAdminInvitationTemplate(inviteEmail: string, inviteRole: string, token: string): EmailTemplate {
    const roleDisplay = inviteRole.replace(/_/g, ' ').toUpperCase();
    
    return {
      to: inviteEmail,
      subject: `Admin Invitation - ${roleDisplay} Role`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Admin Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited to join as a <strong>${roleDisplay}</strong> administrator.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">To accept this invitation:</h3>
            <ol style="color: #4b5563;">
              <li>Click the link below to set up your account</li>
              <li>Create a secure password</li>
              <li>Complete your admin profile setup</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${window.location.origin}/admin/setup?token=${token}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This invitation will expire in 7 days. If you didn't expect this invitation, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #9ca3af; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `,
      text: `
        Admin Invitation - ${roleDisplay} Role
        
        Hello,
        
        You have been invited to join as a ${roleDisplay} administrator.
        
        To accept this invitation:
        1. Click the link below to set up your account
        2. Create a secure password
        3. Complete your admin profile setup
        
        Accept Invitation: ${window.location.origin}/admin/setup?token=${token}
        
        This invitation will expire in 7 days. If you didn't expect this invitation, please ignore this email.
        
        This is an automated message. Please do not reply to this email.
      `
    };
  }

  /**
   * Log email notification for tracking
   */
  private async logEmailNotification(email: string, type: string, template: EmailTemplate): Promise<void> {
    try {
      // Store in a notifications table for tracking
      const { error } = await supabase
        .from('email_notifications')
        .insert({
          email: email,
          type: type,
          subject: template.subject,
          sent_at: new Date().toISOString(),
          status: 'sent' // In production, this would be updated based on actual email service response
        });

      if (error) {
        console.error('📧 EMAIL: Failed to log notification:', error);
      } else {
        console.log('📧 EMAIL: Notification logged successfully');
      }
    } catch (error) {
      console.error('📧 EMAIL: Error logging notification:', error);
    }
  }

  /**
   * Send email using external service (placeholder)
   */
  private async sendEmail(template: EmailTemplate): Promise<void> {
    // TODO: Integrate with actual email service
    // Examples:
    // - SendGrid: await sgMail.send(template)
    // - AWS SES: await ses.sendEmail(template)
    // - Nodemailer: await transporter.sendMail(template)
    
    console.log('📧 EMAIL: Would send email to:', template.to);
    console.log('📧 EMAIL: Subject:', template.subject);
  }
}

// Export singleton instance
export const emailService = new EmailService();


