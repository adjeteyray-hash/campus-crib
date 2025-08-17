# Technology Stack & Development Guidelines

## Core Technologies

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v6 with Bottom Tab Navigator
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage for images
- **External API**: Hostel API UCC (free tier)

## Development Tools

- **Code Quality**: ESLint + Prettier (configured)
- **State Management**: React Context API
- **Testing**: Jest + React Native Testing Library
- **Maps**: React Native Maps (optional)
- **Notifications**: Expo Push Notifications

## Common Commands

```bash
# Development
npx expo start
npx expo start --ios
npx expo start --android

# Code Quality
npm run lint
npm run format
npm run type-check

# Testing
npm test
npm run test:watch
npm run test:coverage

# Build
npx expo build:ios
npx expo build:android
```

## Architecture Patterns

- **Authentication Flow**: Supabase Auth → Role Detection → Route to Stack
- **Data Flow**: API/Supabase → Context → Components
- **Error Handling**: ErrorBoundary + exponential backoff retries
- **Performance**: Lazy loading, image caching, FlatList optimization

## Database Schema

- `profiles`: User data with role-based access
- `hostels`: Landlord-managed listings
- `booking_history`: Student interaction tracking

## Security Requirements

- HTTPS only for all communications
- Row Level Security (RLS) policies
- Secure token storage with Expo SecureStore
- Input validation and sanitization
