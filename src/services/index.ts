// Export all services with specific names to avoid conflicts
export * from './auth';
export * from './hostelAPI';
export * from './mockData';
export * from './unifiedHostelAPI';
export * from './localHostelService';
export * from './analytics';
export * from './supabase';
export * from './storage';
export * from './reviews';

// Export database services with specific names to avoid conflicts
export { 
  userService,
  hostelManagementService,
  analyticsService as databaseAnalyticsService
} from './database';

// Main hostel service - now uses local database instead of external API
export { localHostelService as hostelService } from './localHostelService';

// Legacy exports for backward compatibility (with renamed exports to avoid conflicts)
export { hostelAPIService as legacyHostelAPIService } from './hostelAPI';
export { mockDataService as legacyMockHostelAPIService } from './mockData';
export { unifiedHostelAPIService as legacyUnifiedHostelAPIService } from './unifiedHostelAPI';

// Export specific services from supabase to avoid naming conflicts
export { 
  profileService as supabaseProfileService,
  hostelService as supabaseHostelService,
  bookingHistoryService as supabaseBookingHistoryService,
  storageService as supabaseStorageService
} from './supabase';

// Export booking history service with specific name to avoid conflicts
export { BookingHistoryService, bookingHistoryService } from './bookingHistory';