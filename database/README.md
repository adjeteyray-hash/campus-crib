# Database Setup Guide

This directory contains the database schema and setup instructions for the CampusCrib mobile app.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Schema

Execute the SQL commands in `schema.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the SQL commands

This will create:
- All necessary tables (`profiles`, `hostels`, `booking_history`)
- Indexes for optimal performance
- Row Level Security (RLS) policies
- Storage bucket for hostel images
- Triggers for automatic `updated_at` timestamps

### 3. Verify Setup

After running the schema, verify that the following tables exist:
- `profiles`
- `hostels` 
- `booking_history`

And the storage bucket:
- `hostel-images`

## Database Schema Overview

### Tables

#### `profiles`
Stores user profile information for both students and landlords.
- Links to Supabase Auth users
- Contains role-based information
- Protected by RLS policies

#### `hostels`
Stores hostel listings created by landlords.
- References landlord profiles
- Contains hostel details, pricing, and amenities
- Supports image storage via URLs
- Protected by RLS policies

#### `booking_history`
Tracks student interactions with hostels.
- Records views and contact attempts
- Supports analytics for landlords
- Protected by RLS policies

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Students can view active hostels and manage their booking history
- Landlords can manage their hostels and view related analytics
- Proper role-based access control

### Storage

The `hostel-images` bucket stores hostel photos with:
- Public read access for all users
- Write access restricted to landlords
- Automatic cleanup when hostels are deleted

## Service Layer

The app provides several service layers for database operations:

### Core Services (`src/services/supabase.ts`)
- `profileService`: User profile CRUD operations
- `hostelService`: Hostel management operations
- `bookingHistoryService`: Booking history tracking
- `storageService`: Image upload and management

### High-Level Services (`src/services/database.ts`)
- `userService`: User management with type transformations
- `hostelManagementService`: Hostel operations with business logic
- `analyticsService`: Analytics and reporting functions
- `maintenanceService`: Database maintenance utilities

### Database Manager (`src/config/database.ts`)
- Connection management and health checks
- User profile setup automation
- Real-time listeners and event handling
- Database validation utilities

## Usage Examples

### Initialize Database Connection
```typescript
import { databaseManager } from '../config/database';

// Initialize connection
const isConnected = await databaseManager.initialize();
if (!isConnected) {
  console.error('Failed to connect to database');
}
```

### Create User Profile
```typescript
import { userService } from '../services/database';

const user = await userService.createUserProfile(
  'user-id',
  'user@example.com',
  'student',
  'John Doe',
  '+233123456789'
);
```

### Record Hostel Interaction
```typescript
import { analyticsService } from '../services/database';

// Record a hostel view
await analyticsService.recordHostelView(
  'student-id',
  'hostel-id',
  'Hostel Name'
);

// Record a contact attempt
await analyticsService.recordHostelContact(
  'student-id',
  'hostel-id',
  'Hostel Name',
  'phone'
);
```

### Get Analytics Data
```typescript
import { analyticsService } from '../services/database';

const analytics = await analyticsService.getLandlordAnalytics('landlord-id');
console.log('Hostel performance:', analytics);
```

## Development Tips

1. Use the provided service functions instead of direct Supabase calls
2. All database operations include proper error handling
3. RLS policies are automatically enforced
4. Use the TypeScript types in `src/types/database.ts` for type safety
5. Test database operations using the test utilities in `src/services/__tests__/database.test.ts`

## Testing

### Run Database Tests
```bash
npm test src/services/__tests__/database.test.ts
```

### Generate Test Data
1. Create users through the app authentication
2. Run the test data seeder:
```sql
SELECT generate_sample_data();
```

### Validate Setup
```typescript
import { databaseUtils } from '../config/database';

// Test connection
const isConnected = await databaseUtils.testConnection();

// Get table counts
const counts = await databaseUtils.getTableCounts();

// Validate RLS policies
const rlsValidation = await databaseUtils.validateRLSPolicies();
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Ensure users have proper roles set in their profiles
2. **Storage Upload Errors**: Check that the `hostel-images` bucket exists and has correct policies
3. **Foreign Key Errors**: Ensure profiles are created before creating hostels or booking history
4. **Connection Issues**: Verify environment variables are set correctly

### Testing RLS Policies

You can test RLS policies in the Supabase SQL editor by using:

```sql
-- Test as a specific user
SELECT auth.uid(); -- Check current user
SET request.jwt.claims TO '{"sub": "user-uuid-here"}';
```

### Debug Database Operations

Enable debug logging by setting:
```typescript
// In your app initialization
console.log('Database operations will be logged to console');
```

## Migration Management

### Apply Migrations
1. Navigate to `database/migrations/`
2. Run migrations in order (001, 002, etc.)
3. Each migration file contains the complete SQL for that version

#### Available Migrations
- `001_initial_schema.sql`: Creates the initial database schema
- `002_fix_booking_history_hostel_id.sql`: Fixes hostel_id column type to support external API IDs

### Create New Migration
1. Create a new file: `database/migrations/00X_description.sql`
2. Include both forward and rollback SQL
3. Update the migration documentation

### Important Notes
- The `booking_history.hostel_id` field is TEXT type to support both internal hostel UUIDs (stored as text) and external API hostel IDs
- When recording booking history for internal hostels, convert the UUID to string
- When recording booking history for external API hostels, use the API's hostel ID directly