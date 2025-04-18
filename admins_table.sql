-- Create the admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy to allow read access to all users (can be restricted further if needed)
CREATE POLICY admin_select ON public.admins 
  FOR SELECT 
  USING (true);

-- Policy to allow only admins to create other admins
CREATE POLICY admin_insert ON public.admins
  FOR INSERT
  WITH CHECK (
    -- Only allow if the user has the isAdmin flag or is from a service role
    (SELECT auth.jwt() ->> 'role' = 'service_role') OR
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Policy to allow only admins to update admin records
CREATE POLICY admin_update ON public.admins
  FOR UPDATE
  USING (
    -- Only allow if the user has the isAdmin flag or is from a service role
    (SELECT auth.jwt() ->> 'role' = 'service_role') OR
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Policy to allow only admins to delete admin records
CREATE POLICY admin_delete ON public.admins
  FOR DELETE
  USING (
    -- Only allow if the user has the isAdmin flag or is from a service role
    (SELECT auth.jwt() ->> 'role' = 'service_role') OR
    (SELECT (auth.jwt() ->> 'user_metadata')::jsonb ->> 'isAdmin')::boolean = true
  );

-- Create RLS trigger to automatically set created_at and updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 