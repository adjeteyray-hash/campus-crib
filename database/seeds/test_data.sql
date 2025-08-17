-- Test data for CampusCrib app
-- This file contains sample data for development and testing

-- Temporarily disable foreign key constraints for local development
-- This allows us to insert test data without auth.users table
SET session_replication_role = replica;

-- Insert test profiles (using UUIDs that would come from auth.users)
INSERT INTO profiles (id, email, role, name, phone, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'landlord1@example.com', 'landlord', 'John Landlord', '+233 20 123 4567', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'landlord2@example.com', 'landlord', 'Sarah Property', '+233 20 234 5678', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'student1@example.com', 'student', 'Alice Student', '+233 20 345 6789', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'student2@example.com', 'student', 'Bob Learner', '+233 20 456 7890', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test hostels
INSERT INTO hostels (id, landlord_id, name, description, address, price, amenities, images, contact_phone, contact_email, is_active, created_at, updated_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    'University Heights',
    'Modern student accommodation with all amenities. Located close to campus with 24/7 security and high-speed WiFi. Each room comes with a study desk, wardrobe, and en-suite bathroom.',
    '123 University Street, Accra',
    2500.00,
    '["WiFi", "Kitchen", "Laundry", "Security", "Parking"]',
    '{"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}',
    '+233 20 123 4567',
    'landlord1@example.com',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    'Campus View Residences',
    'Premium student housing with study areas and gym facilities. Perfect for serious students who want a quiet environment to focus on their studies.',
    '456 Campus Road, Accra',
    3000.00,
    '["WiFi", "Study Room", "Gym", "Security", "24/7 Support"]',
    '{"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", "https://images.unsplash.com/photo-1560448075-bb485b067938?w=400"}',
    '+233 20 123 4567',
    'landlord1@example.com',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440002',
    'Student Haven',
    'Affordable student accommodation in a friendly neighborhood. Basic amenities with a focus on community and affordability.',
    '789 Student Lane, Accra',
    2000.00,
    '["WiFi", "Kitchen", "Security"]',
    '{"https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400"}',
    '+233 20 234 5678',
    'landlord2@example.com',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440002',
    'Academic Gardens',
    'Peaceful environment for focused studying. Located in a quiet area with beautiful gardens and study rooms.',
    '321 Academic Way, Accra',
    2800.00,
    '["WiFi", "Garden", "Study Room", "Security", "Quiet Zone"]',
    '{"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}',
    '+233 20 234 5678',
    'landlord2@example.com',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440001',
    'Metro Student Living',
    'Urban student accommodation with city access. Modern facilities in the heart of the city with easy access to public transport.',
    '654 Metro Street, Accra',
    3200.00,
    '["WiFi", "Kitchen", "Laundry", "Security", "Transport Access"]',
    '{"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400"}',
    '+233 20 123 4567',
    'landlord1@example.com',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test booking history
INSERT INTO booking_history (id, student_id, hostel_id, hostel_name, action, timestamp, metadata) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440010',
    'University Heights',
    'viewed',
    NOW() - INTERVAL '2 hours',
    '{"source": "home_screen"}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440011',
    'Campus View Residences',
    'viewed',
    NOW() - INTERVAL '1 hour',
    '{"source": "search_screen"}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440012',
    'Student Haven',
    'contacted',
    NOW() - INTERVAL '30 minutes',
    '{"method": "phone", "duration": "5 minutes"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert test reviews
INSERT INTO reviews (id, hostel_id, user_id, user_name, rating, comment, created_at, updated_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440003',
    'Alice Student',
    5,
    'Amazing place! The WiFi is super fast and the security is top-notch. Highly recommend for students!',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440004',
    'Bob Learner',
    4,
    'Great location near campus. The amenities are good and the landlord is very responsive.',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440003',
    'Alice Student',
    5,
    'Premium accommodation with excellent study facilities. The gym is a great bonus!',
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440033',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440004',
    'Bob Learner',
    3,
    'Basic but affordable. Good for students on a budget. The neighborhood is friendly.',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440034',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440003',
    'Alice Student',
    4,
    'Peaceful environment perfect for studying. The gardens are beautiful and the quiet zone is very helpful.',
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '2 months'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440035',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440004',
    'Bob Learner',
    5,
    'Perfect for city life! Easy access to public transport and all the urban amenities. Modern facilities!',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440036',
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440003',
    'Alice Student',
    4,
    'Great community feel here. Met lots of other students and the study groups are really helpful.',
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440037',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440004',
    'Bob Learner',
    5,
    'The study rooms are amazing! Perfect for exam preparation. Landlord is super helpful too.',
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '3 weeks'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440038',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440003',
    'Alice Student',
    4,
    'Affordable and clean. Basic amenities but everything works well. Great for budget-conscious students.',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440039',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440004',
    'Bob Learner',
    5,
    'The quiet zone is perfect for my studies. Beautiful gardens and very peaceful environment.',
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '2 months'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440040',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440003',
    'Alice Student',
    4,
    'Love the urban location! Easy to get to shops, restaurants, and campus. Modern building with great security.',
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '3 weeks'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert additional test profiles for more variety
INSERT INTO profiles (id, email, role, name, phone, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', 'landlord3@example.com', 'landlord', 'Michael Properties', '+233 20 567 8901', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'student3@example.com', 'student', 'Carol Scholar', '+233 20 678 9012', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'student4@example.com', 'student', 'David Academic', '+233 20 789 0123', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert additional test hostels for more variety
INSERT INTO hostels (id, landlord_id, name, description, address, price, amenities, images, contact_phone, contact_email, is_active, created_at, updated_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440005',
    'Green Campus Living',
    'Eco-friendly student accommodation with solar panels and sustainable features. Perfect for environmentally conscious students who want modern amenities with a green touch.',
    '987 Green Street, Accra',
    2700.00,
    '["WiFi", "Solar Power", "Garden", "Study Room", "Security", "Recycling"]',
    '{"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"}',
    '+233 20 567 8901',
    'landlord3@example.com',
    true,
    NOW(),
    NOW()
  ),
  (
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440005',
    'Tech Hub Residences',
    'Modern accommodation designed for tech students. High-speed internet, coding spaces, and tech meetup areas. Perfect for computer science and engineering students.',
    '654 Tech Avenue, Accra',
    3500.00,
    '["WiFi", "High-Speed Internet", "Coding Space", "Tech Meetup Area", "Security", "24/7 Support"]',
    '{"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", "https://images.unsplash.com/photo-1560448075-bb485b067938?w=400"}',
    '+233 20 567 8901',
    'landlord3@example.com',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert additional reviews for new hostels
INSERT INTO reviews (id, hostel_id, user_id, user_name, rating, comment, created_at, updated_at) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440006',
    'Carol Scholar',
    5,
    'Love the eco-friendly approach! Solar power works great and the garden is beautiful. Perfect for nature lovers!',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440042',
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440007',
    'David Academic',
    4,
    'Great sustainable living option. The recycling system is well organized and the study room is very peaceful.',
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440043',
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440006',
    'Carol Scholar',
    5,
    'Perfect for tech students! The coding space is amazing and the internet speed is incredible. Met so many like-minded students here!',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440044',
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440007',
    'David Academic',
    5,
    'Tech Hub is exactly what I needed! The meetup areas are great for networking and the facilities are top-notch.',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week'
  )
ON CONFLICT (id) DO NOTHING;

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;