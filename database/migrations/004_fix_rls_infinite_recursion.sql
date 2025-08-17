-- Migration: Fix RLS infinite recursion
-- Description: Fix infinite recursion in RLS policies by simplifying profile policies
-- Date: 2025-08-13

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Landlords can view own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can insert own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can update own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can delete own hostels" ON hostels;
DROP POLICY IF EXISTS "Students can view own booking history" ON booking_history;
DROP POLICY IF EXISTS "Students can insert own booking history" ON booking_history;
DROP POLICY IF EXISTS "Landlords can view booking history for their hostels" ON booking_history;
DROP POLICY IF EXISTS "Landlords can upload hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can update own hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Landlords can delete own hostel images" ON storage.objects;

-- Create simplified hostels policies without role checking
CREATE POLICY "Landlords can view own hostels" ON hostels
  FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert own hostels" ON hostels
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update own hostels" ON hostels
  FOR UPDATE USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete own hostels" ON hostels
  FOR DELETE USING (auth.uid() = landlord_id);

-- Create simplified booking history policies without role checking
CREATE POLICY "Students can view own booking history" ON booking_history
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own booking history" ON booking_history
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Landlords can view booking history for their hostels" ON booking_history
  FOR SELECT USING (
    hostel_id IN (
      SELECT id::text FROM hostels WHERE landlord_id = auth.uid()
    )
  );

-- Create simplified storage policies without role checking
CREATE POLICY "Authenticated users can upload hostel images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hostel-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update own hostel images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'hostel-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete own hostel images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hostel-images' AND
    auth.uid() IS NOT NULL
  );

-- Add a function to safely get user role without RLS recursion
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use security definer to bypass RLS for this specific query
  SELECT role INTO user_role FROM profiles WHERE id = user_id;
  RETURN COALESCE(user_role, 'student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;