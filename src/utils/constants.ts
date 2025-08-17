// Environment variables with fallbacks from app.json
import Constants from 'expo-constants';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.supabaseUrl || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.supabaseAnonKey || '';

// Check if Supabase is properly configured
export const IS_SUPABASE_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Fallback configuration for development/testing
export const FALLBACK_CONFIG = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key-here',
};

// Updated API configuration - using mock data for development
export const HOSTEL_API_BASE_URL =
  process.env.EXPO_PUBLIC_HOSTEL_API_BASE_URL ||
  Constants.expoConfig?.extra?.hostelApiBaseUrl ||
  'https://mockapi.io/projects/your-project-id';

// Alternative API endpoints for fallback
export const ALTERNATIVE_APIS = {
  // Mock API for development/testing
  MOCK: {
    baseUrl: 'https://mockapi.io/projects/your-project-id',
    endpoints: {
      HOSTELS: '/hostels',
      SEARCH: '/search',
      DETAILS: '/hostels',
    },
  },
  // Local Supabase fallback
  SUPABASE: {
    baseUrl: '',
    endpoints: {
      HOSTELS: '/hostels',
      SEARCH: '/search',
      DETAILS: '/hostels',
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
} as const;

// App constants
export const APP_NAME = 'CampusCrib';
export const APP_VERSION = '1.0.0';

// API endpoints - updated to use working endpoints
export const API_ENDPOINTS = {
  HOSTELS: '/accommodations',
  HOSTEL_DETAIL: '/accommodations',
  SEARCH: '/search',
} as const;

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  LANDLORD: 'landlord',
} as const;

// Booking actions
export const BOOKING_ACTIONS = {
  VIEWED: 'viewed',
  CONTACTED: 'contacted',
} as const;

// Hostel amenities options
export const AMENITIES_OPTIONS = [
  'WiFi',
  'Air Conditioning',
  'Study Room',
  'Laundry',
  'Security',
  'Kitchen',
  'Common Room',
  'Parking',
  'Garden',
  'Balcony',
  'Gym',
  'Restaurant',
  'Swimming Pool',
  'Library',
  'Cafeteria',
  'Quiet Zone',
  '24/7 Security',
  'Free Breakfast',
  'Cleaning Service',
  'Bike Storage',
  'Study Desk',
  'Wardrobe',
  'Private Bathroom',
  'Shared Bathroom',
  'Hot Water',
  'Electricity',
  'Water',
  'Furnished',
  'Unfurnished',
  'Pet Friendly',
  'No Smoking',
  'Wheelchair Accessible',
] as const;

// API configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;
