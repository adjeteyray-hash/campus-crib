-- Add profile picture support to profiles table
-- Migration: 005_add_profile_picture.sql

-- Add profile_picture_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for profile pictures
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND
    auth.uid() IS NOT NULL AND
    name LIKE (auth.uid()::text || '/%')
  );

CREATE POLICY "Users can update own profile picture" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid() IS NOT NULL AND
    name LIKE (auth.uid()::text || '/%')
  );

CREATE POLICY "Users can delete own profile picture" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND
    auth.uid() IS NOT NULL AND
    name LIKE (auth.uid()::text || '/%')
  );

-- Add comment to document the new column
COMMENT ON COLUMN profiles.profile_picture_url IS 'URL to the user profile picture stored in Supabase Storage';
