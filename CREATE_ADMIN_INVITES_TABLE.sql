-- Create admin invites table for email-based admin invitations

-- Create the admin_invites table
CREATE TABLE IF NOT EXISTS admin_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'senior_admin', 'super_admin')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites(email);
CREATE INDEX IF NOT EXISTS idx_admin_invites_token ON admin_invites(token);
CREATE INDEX IF NOT EXISTS idx_admin_invites_expires_at ON admin_invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_invites_used_at ON admin_invites(used_at);

-- Add comments to document the table
COMMENT ON TABLE admin_invites IS 'Stores admin invitations sent via email';
COMMENT ON COLUMN admin_invites.email IS 'Email address of the invited user';
COMMENT ON COLUMN admin_invites.invited_by IS 'User ID of the admin who sent the invitation';
COMMENT ON COLUMN admin_invites.role IS 'Admin role to be assigned (admin, senior_admin, super_admin)';
COMMENT ON COLUMN admin_invites.token IS 'Unique token for the invitation link';
COMMENT ON COLUMN admin_invites.expires_at IS 'When the invitation expires (default 7 days)';
COMMENT ON COLUMN admin_invites.used_at IS 'When the invitation was used (NULL if unused)';

-- Create a function to generate secure tokens
CREATE OR REPLACE FUNCTION generate_admin_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Create a function to create admin invites
CREATE OR REPLACE FUNCTION create_admin_invite(
  invite_email TEXT,
  inviter_id UUID,
  admin_role TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_token TEXT;
BEGIN
  -- Generate a secure token
  invite_token := generate_admin_invite_token();
  
  -- Insert the invitation
  INSERT INTO admin_invites (email, invited_by, role, token)
  VALUES (invite_email, inviter_id, admin_role, invite_token);
  
  RETURN invite_token;
END;
$$;

-- Create a function to use an admin invite
CREATE OR REPLACE FUNCTION use_admin_invite(
  invite_token TEXT,
  user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Get the invitation
  SELECT * INTO invite_record
  FROM admin_invites
  WHERE token = invite_token
    AND expires_at > NOW()
    AND used_at IS NULL;
  
  -- Check if invitation exists and is valid
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark invitation as used
  UPDATE admin_invites
  SET used_at = NOW()
  WHERE token = invite_token;
  
  -- Create or update user profile with admin role
  INSERT INTO user_profiles (user_id, is_admin, is_senior_admin, is_super_admin, blocked, locked)
  VALUES (
    user_id,
    CASE WHEN invite_record.role = 'admin' THEN TRUE ELSE FALSE END,
    CASE WHEN invite_record.role = 'senior_admin' THEN TRUE ELSE FALSE END,
    CASE WHEN invite_record.role = 'super_admin' THEN TRUE ELSE FALSE END,
    FALSE,
    FALSE
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    is_admin = CASE WHEN invite_record.role = 'admin' THEN TRUE ELSE FALSE END,
    is_senior_admin = CASE WHEN invite_record.role = 'senior_admin' THEN TRUE ELSE FALSE END,
    is_super_admin = CASE WHEN invite_record.role = 'super_admin' THEN TRUE ELSE FALSE END,
    blocked = FALSE,
    locked = FALSE;
  
  RETURN TRUE;
END;
$$;

