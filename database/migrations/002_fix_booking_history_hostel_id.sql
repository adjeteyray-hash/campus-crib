-- Migration: 002_fix_booking_history_hostel_id
-- Description: Fix hostel_id column type in booking_history table
-- Date: 2025-01-09

-- This migration fixes the hostel_id column type from UUID to TEXT
-- to support both internal hostel UUIDs and external API hostel IDs

-- Drop the existing RLS policy that might cause issues
DROP POLICY IF EXISTS "Landlords can view booking history for their hostels" ON booking_history;

-- Alter the column type from UUID to TEXT
-- This will automatically convert existing UUID values to text
ALTER TABLE booking_history 
ALTER COLUMN hostel_id TYPE TEXT USING hostel_id::text;

-- Recreate the RLS policy with correct type handling
CREATE POLICY "Landlords can view booking history for their hostels" ON booking_history
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord' AND
    hostel_id IN (
      SELECT id::text FROM hostels WHERE landlord_id = auth.uid()
    )
  );

-- Update the index to work with TEXT type
DROP INDEX IF EXISTS idx_booking_history_hostel_id;
CREATE INDEX idx_booking_history_hostel_id ON booking_history(hostel_id);