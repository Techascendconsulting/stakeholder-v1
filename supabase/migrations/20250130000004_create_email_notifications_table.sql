-- Create email_notifications table for tracking email notifications
CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient ON public.email_notifications(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON public.email_notifications(created_at);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all email notifications" ON public.email_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
        )
    );

CREATE POLICY "Admins can insert email notifications" ON public.email_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
        )
    );

CREATE POLICY "Admins can update email notifications" ON public.email_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND (is_admin = true OR is_super_admin = true OR is_senior_admin = true)
        )
    );
