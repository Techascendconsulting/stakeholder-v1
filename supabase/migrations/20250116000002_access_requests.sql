-- ========================================
-- ACCESS REQUESTS SYSTEM
-- For invite-only platform management
-- ========================================

-- Create access_requests table
CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  current_role text,
  company text,
  referral_source text,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON public.access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON public.access_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON public.access_requests(email);

-- Enable Row Level Security
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can read/manage access requests
DROP POLICY IF EXISTS "admins_can_read_access_requests" ON public.access_requests;
CREATE POLICY "admins_can_read_access_requests" ON public.access_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (is_admin = true OR is_senior_admin = true OR is_super_admin = true)
  )
);

DROP POLICY IF EXISTS "admins_can_update_access_requests" ON public.access_requests;
CREATE POLICY "admins_can_update_access_requests" ON public.access_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (is_admin = true OR is_senior_admin = true OR is_super_admin = true)
  )
);

-- Function to approve an access request and create user
CREATE OR REPLACE FUNCTION public.approve_access_request(
  request_id uuid,
  user_type_param text DEFAULT 'existing',
  subscription_tier_param text DEFAULT 'free',
  max_projects_param integer DEFAULT 1
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record record;
  is_admin boolean;
  result json;
BEGIN
  -- Check if caller is admin
  SELECT COALESCE(is_admin, false) OR COALESCE(is_senior_admin, false) OR COALESCE(is_super_admin, false)
  INTO is_admin
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can approve access requests';
  END IF;
  
  -- Get the access request
  SELECT * INTO request_record
  FROM public.access_requests
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  -- Mark request as approved
  UPDATE public.access_requests
  SET 
    status = 'approved',
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = request_id;
  
  -- Return the request data for admin to create the user manually
  -- (User creation happens in Supabase Auth via admin panel)
  result := json_build_object(
    'success', true,
    'email', request_record.email,
    'full_name', request_record.full_name,
    'user_type', user_type_param,
    'subscription_tier', subscription_tier_param,
    'max_projects', max_projects_param
  );
  
  RETURN result;
END;
$$;

-- Function to reject an access request
CREATE OR REPLACE FUNCTION public.reject_access_request(
  request_id uuid,
  rejection_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT COALESCE(is_admin, false) OR COALESCE(is_senior_admin, false) OR COALESCE(is_super_admin, false)
  INTO is_admin
  FROM public.user_profiles
  WHERE user_id = auth.uid();
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can reject access requests';
  END IF;
  
  -- Mark request as rejected
  UPDATE public.access_requests
  SET 
    status = 'rejected',
    admin_notes = rejection_reason,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Access request not found or already processed';
  END IF;
  
  RETURN true;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_access_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_access_requests_updated_at_trigger ON public.access_requests;
CREATE TRIGGER update_access_requests_updated_at_trigger
  BEFORE UPDATE ON public.access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_access_requests_updated_at();

COMMENT ON TABLE public.access_requests IS 'Stores access requests from potential users for invite-only platform';
COMMENT ON COLUMN public.access_requests.status IS 'pending, approved, rejected, or withdrawn';
COMMENT ON COLUMN public.access_requests.reviewed_by IS 'Admin user who reviewed the request';










