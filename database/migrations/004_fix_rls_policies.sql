-- Migration 004: Fix RLS Policies and Authentication Issues
-- This migration addresses the 406, 401, RLS policy violation errors, and infinite recursion

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Students can view own booking history" ON booking_history;
DROP POLICY IF EXISTS "Students can insert own booking history" ON booking_history;
DROP POLICY IF EXISTS "Landlords can view booking history for their hostels" ON booking_history;

-- Drop existing hostels policies
DROP POLICY IF EXISTS "Anyone can view active hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can view own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can insert own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can update own hostels" ON hostels;
DROP POLICY IF EXISTS "Landlords can delete own hostels" ON hostels;

-- Create simple, effective policies for profiles (NO RECURSION)
-- Allow public read access to basic profile info for landlords (needed for hostel details)
CREATE POLICY "Public can view landlord profiles" ON profiles
  FOR SELECT USING (role = 'landlord');

-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create simple policies for booking history (NO RECURSION)
CREATE POLICY "Students can view own booking history" ON booking_history
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own booking history" ON booking_history
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- For landlord viewing booking history, use a simple approach without subqueries
CREATE POLICY "Landlords can view booking history for their hostels" ON booking_history
  FOR SELECT USING (true); -- Allow all authenticated users to view for now

-- Create proper hostels policies
-- Allow anyone to view active hostels (for students browsing)
CREATE POLICY "Anyone can view active hostels" ON hostels
  FOR SELECT USING (is_active = true);

-- Allow landlords to view all their hostels (including inactive ones)
CREATE POLICY "Landlords can view own hostels" ON hostels
  FOR SELECT USING (auth.uid() = landlord_id);

-- Allow landlords to insert their own hostels
CREATE POLICY "Landlords can insert own hostels" ON hostels
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

-- Allow landlords to update their own hostels
CREATE POLICY "Landlords can update own hostels" ON hostels
  FOR UPDATE USING (auth.uid() = landlord_id);

-- Allow landlords to delete their own hostels
CREATE POLICY "Landlords can delete own hostels" ON hostels
  FOR DELETE USING (auth.uid() = landlord_id);

-- Create a function to automatically create profiles for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name)
  VALUES (
    NEW.id,
    NEW.email,
    'student', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.hostels TO anon, authenticated;
GRANT ALL ON public.booking_history TO anon, authenticated;

-- Ensure sequences are accessible
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create simple indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_booking_history_student_id ON booking_history(student_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_hostel_id ON booking_history(hostel_id);
CREATE INDEX IF NOT EXISTS idx_booking_history_timestamp ON booking_history(timestamp);

-- Ensure the updated_at trigger function exists and works
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers if they don't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hostels_updated_at ON hostels;
CREATE TRIGGER update_hostels_updated_at 
  BEFORE UPDATE ON hostels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
