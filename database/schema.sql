-- CampusCrib Database Schema
-- This file contains the complete database schema for the CampusCrib mobile app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'landlord')) NOT NULL,
  name TEXT,
  phone TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create hostels table
CREATE TABLE IF NOT EXISTS hostels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  amenities JSONB DEFAULT '[]',
  images TEXT[] DEFAULT '{}',
  contact_phone TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_history table
CREATE TABLE IF NOT EXISTS booking_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hostel_id TEXT NOT NULL, -- Can reference external API hostels (text) or internal hostels (uuid as text)
  hostel_name TEXT NOT NULL,
  action TEXT CHECK (action IN ('viewed', 'contacted')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_hostels_landlord_id ON hostels(landlord_id);
CREATE INDEX IF NOT EXISTS idx_hostels_is_active ON hostels(is_active);
CREATE INDEX IF NOT EXISTS idx_hostels_price ON hostels(price);
CREATE INDEX IF NOT EXISTS idx_booking_history_student_id ON booking_history(student_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_hostel_id ON booking_history(hostel_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_timestamp ON booking_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_booking_history_action ON booking_history(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostels_updated_at 
  BEFORE UPDATE ON hostels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to safely get user role without RLS recursion
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

-- Row Level Security (RLS) - DISABLED for unrestricted access
-- WARNING: RLS is completely disabled for unrestricted database access

-- RLS is DISABLED on all tables for unrestricted access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE hostels DISABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated and anonymous users
GRANT ALL ON profiles TO authenticated, anon;
GRANT ALL ON hostels TO authenticated, anon;
GRANT ALL ON booking_history TO authenticated, anon;

-- Storage buckets for images (public access)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies - UNRESTRICTED ACCESS (no RLS)
-- WARNING: These policies allow unrestricted access to all storage
CREATE POLICY "unrestricted_storage_select" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "unrestricted_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (true);

CREATE POLICY "unrestricted_storage_update" ON storage.objects
  FOR UPDATE USING (true);

CREATE POLICY "unrestricted_storage_delete" ON storage.objects
  FOR DELETE USING (true);

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated, anon;
GRANT ALL ON storage.buckets TO authenticated, anon;