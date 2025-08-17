-- Migration: 001_initial_schema
-- Description: Initial database schema for CampusCrib
-- Date: 2025-01-09

-- This migration creates the initial database schema
-- Run this migration first when setting up a new database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('student', 'landlord')) NOT NULL,
  name TEXT,
  phone TEXT,
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

-- Create indexes
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
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hostels_updated_at 
  BEFORE UPDATE ON hostels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active hostels" ON hostels
  FOR SELECT USING (is_active = true);

CREATE POLICY "Landlords can view own hostels" ON hostels
  FOR SELECT USING (
    auth.uid() = landlord_id OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );

CREATE POLICY "Landlords can insert own hostels" ON hostels
  FOR INSERT WITH CHECK (
    auth.uid() = landlord_id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );

CREATE POLICY "Landlords can update own hostels" ON hostels
  FOR UPDATE USING (
    auth.uid() = landlord_id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );

CREATE POLICY "Landlords can delete own hostels" ON hostels
  FOR DELETE USING (
    auth.uid() = landlord_id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );

CREATE POLICY "Students can view own booking history" ON booking_history
  FOR SELECT USING (
    auth.uid() = student_id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
  );

CREATE POLICY "Students can insert own booking history" ON booking_history
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
  );

CREATE POLICY "Landlords can view booking history for their hostels" ON booking_history
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord' AND
    hostel_id IN (
      SELECT id::text FROM hostels WHERE landlord_id = auth.uid()
    )
  );

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hostel-images', 'hostel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view hostel images" ON storage.objects
  FOR SELECT USING (bucket_id = 'hostel-images');

CREATE POLICY "Landlords can upload hostel images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'hostel-images' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );

CREATE POLICY "Landlords can update own hostel images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'hostel-images' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );

CREATE POLICY "Landlords can delete own hostel images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'hostel-images' AND
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  );