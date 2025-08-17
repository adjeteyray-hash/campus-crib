-- Migration: Add profile_picture_url to reviews table
-- This migration adds profile picture support to reviews

-- Add profile_picture_url column to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Update existing reviews to have a default profile picture URL (optional)
-- This is just for demonstration - in production you might want to leave this NULL
-- UPDATE reviews SET profile_picture_url = NULL WHERE profile_picture_url IS NULL;

-- Create index for profile picture lookups (optional)
CREATE INDEX IF NOT EXISTS idx_reviews_profile_picture ON reviews(profile_picture_url);

-- Grant permissions (already done in previous migration, but ensuring consistency)
GRANT ALL ON reviews TO authenticated, anon;
