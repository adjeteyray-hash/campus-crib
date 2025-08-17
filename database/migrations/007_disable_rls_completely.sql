-- Migration 007: Disable RLS completely for unrestricted database access
-- This migration removes all Row Level Security policies and disables RLS
-- WARNING: This provides UNRESTRICTED access to your database

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE hostels DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing RLS policies for profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_landlords_public" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view landlord profiles" ON profiles;

-- Drop ALL existing RLS policies for hostels table
DROP POLICY IF EXISTS "Anyone can view active hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can view own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can insert own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can update own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can delete own hostels" ON hostels;

-- Drop ALL existing RLS policies for booking_history table
DROP POLICY IF EXISTS "Students can view own booking history" ON booking_history;
DROP POLICY IF EXISTS "Students can insert own booking history" ON booking_history;
DROP POLICY IF EXISTS "Landlords can view booking history for their hostels" ON booking_history;

-- Create storage bucket for profile pictures (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Make hostel-images bucket public too (if it exists)
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('hostel-images', 'profile-pictures');

-- Drop ALL existing storage policies to allow unrestricted access
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_select_all" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_update_own" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_delete_own" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile picture" ON storage.objects;
DROP POLICY IF EXISTS "profile_pictures_upload" ON storage.objects;

-- Drop hostel image policies too
DROP POLICY IF EXISTS "Anyone can view hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own hostel images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own hostel images" ON storage.objects;

-- Create completely open storage policies for unrestricted access
CREATE POLICY "unrestricted_storage_select" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "unrestricted_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "unrestricted_storage_update" ON storage.objects
  FOR UPDATE USING (true);

CREATE POLICY "unrestricted_storage_delete" ON storage.objects
  FOR DELETE USING (true);

-- Add profile_picture_url column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Grant all permissions to authenticated and anonymous users
GRANT ALL ON profiles TO authenticated, anon;
GRANT ALL ON hostels TO authenticated, anon;
GRANT ALL ON booking_history TO authenticated, anon;

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated, anon;
GRANT ALL ON storage.buckets TO authenticated, anon;

-- Log the completion
DO $$ 
BEGIN 
  RAISE NOTICE 'Migration 007 completed: RLS completely disabled - UNRESTRICTED database access enabled';
  RAISE NOTICE 'WARNING: Your database now has NO access restrictions!';
END $$;
