-- Create email notifications table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  type TEXT NOT NULL, -- 'device_reset', 'admin_invitation', etc.
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'failed', 'bounced'
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_email ON email_notifications(email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);

-- Enable Row Level Security
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can view all email notifications
CREATE POLICY "Admins can view all email notifications" ON email_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
    )
  );

-- System can insert email notifications
CREATE POLICY "System can insert email notifications" ON email_notifications
  FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE email_notifications IS 'Tracks all email notifications sent to users including device resets and admin invitations';
COMMENT ON COLUMN email_notifications.type IS 'Type of notification: device_reset, admin_invitation, etc.';
COMMENT ON COLUMN email_notifications.status IS 'Delivery status: sent, delivered, failed, bounced';
COMMENT ON COLUMN email_notifications.metadata IS 'Additional notification data in JSON format';



















