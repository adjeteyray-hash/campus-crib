-- Migration 006: Fix RLS infinite recursion and add profile picture support
-- This migration resolves the infinite recursion error in RLS policies
-- and adds profile picture support

-- CRITICAL: Fix infinite recursion in RLS policies
-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles; 
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view landlord profiles" ON profiles;

-- Add profile_picture_url column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create SIMPLE RLS policies WITHOUT recursion
-- The key is to use auth.uid() directly without complex subqueries

-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (
    auth.uid() = id
  );

-- Allow users to update their own profile  
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
  );

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id
  );

-- Allow public to view basic landlord info (needed for hostel listings)
CREATE POLICY "profiles_select_landlords_public" ON profiles
  FOR SELECT USING (
    role = 'landlord' AND 
    id IS NOT NULL
  );

-- Storage policies for profile pictures (SIMPLE - no recursion)
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile picture" ON storage.objects;

-- Profile pictures storage policies (simple and safe)
CREATE POLICY "profile_pictures_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "profile_pictures_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_pictures_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_pictures_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add comment to document the new column
COMMENT ON COLUMN profiles.profile_picture_url IS 'URL to the user profile picture stored in Supabase Storage';

-- Verify no functions are causing recursion
DROP FUNCTION IF EXISTS get_user_role(UUID);

-- Create a safe helper function if needed (without RLS issues)
CREATE OR REPLACE FUNCTION get_user_role_safe(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Direct query without RLS to avoid recursion
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_role_safe(UUID) TO authenticated;

-- Add helpful debug function to check RLS status
CREATE OR REPLACE FUNCTION debug_rls_policies()
RETURNS TABLE(table_name text, policy_name text, policy_cmd text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    policyname as policy_name,
    cmd as policy_cmd
  FROM pg_policies 
  WHERE schemaname = 'public'
  ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION debug_rls_policies() TO authenticated;

-- Final verification: Ensure RLS is enabled but policies are simple
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Log the completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Migration 006 completed: Fixed RLS recursion and added profile picture support';
END $$;
