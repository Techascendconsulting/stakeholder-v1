import { supabase } from '../lib/supabase';

export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status?: 'new' | 'in_progress' | 'resolved' | 'archived';
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Hidden email configuration
const NOTIFICATION_EMAIL = 'support@baworkxp.com';

/**
 * Submit a contact form and send notification email
 */
export async function submitContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Save to database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'new'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error saving contact submission:', dbError);
      return { success: false, error: 'Failed to submit form. Please try again.' };
    }

    // 2. Send email notification to admin (hidden email)
    try {
      await sendContactNotificationEmail(data);
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Don't fail the submission if email fails
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in submitContactForm:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

/**
 * Send email notification to admin (internal use only)
 */
async function sendContactNotificationEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  // Use Supabase Edge Function or direct email service
  const emailBody = `
    New Contact Form Submission
    
    From: ${data.name}
    Email: ${data.email}
    Subject: ${data.subject}
    
    Message:
    ${data.message}
    
    ---
    Submitted via BA WorkXP™
    Date: ${new Date().toISOString()}
  `;

  // Call the Supabase Edge Function for sending emails
  try {
    const { error } = await supabase.functions.invoke('send-contact-email', {
      body: {
        to: NOTIFICATION_EMAIL,
        from: data.email,
        replyTo: data.email,
        subject: `[Contact Form] ${data.subject}`,
        text: emailBody,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #9333ea, #4f46e5); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
                <p style="margin: 10px 0;"><strong>Name:</strong> ${data.name}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                <p style="margin: 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 10px;">
                <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
                <p style="line-height: 1.6; color: #4b5563;">${data.message}</p>
              </div>
              <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
                <p>Submitted via BA WorkXP™</p>
                <p>${new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        `
      }
    });

    if (error) {
      console.error('Edge function error:', error);
    }
  } catch (error) {
    console.error('Failed to invoke edge function:', error);
    // Email sending is non-critical, so we don't throw
  }
}

/**
 * Get all contact submissions (admin only)
 */
export async function getAllContactSubmissions(): Promise<ContactSubmission[]> {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching contact submissions:', error);
    return [];
  }

  return data || [];
}

/**
 * Update contact submission status (admin only)
 */
export async function updateContactSubmissionStatus(
  id: string,
  status: 'new' | 'in_progress' | 'resolved' | 'archived',
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    if (status === 'resolved' && user) {
      updateData.resolved_by = user.id;
      updateData.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('contact_submissions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating contact submission:', error);
      return { success: false, error: 'Failed to update status' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating contact submission:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete contact submission (admin only)
 */
export async function deleteContactSubmission(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact submission:', error);
      return { success: false, error: 'Failed to delete submission' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error deleting contact submission:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}


