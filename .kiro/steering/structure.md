# Project Structure & Organization

## Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (LoadingSpinner, ErrorBoundary)
│   ├── hostel/          # Hostel-specific components (HostelCard, ImageCarousel)
│   └── forms/           # Form components and validation
├── screens/             # Screen components organized by user role
│   ├── auth/            # Authentication screens (Login, SignUp)
│   ├── student/         # Student screens (Home, Search, History, Profile)
│   ├── landlord/        # Landlord screens (MyHostels, AddHostel, Analytics, Profile)
│   └── shared/          # Shared screens (HostelDetail)
├── navigation/          # Navigation configuration
│   ├── AuthStack.tsx
│   ├── StudentTabNavigator.tsx
│   ├── LandlordTabNavigator.tsx
│   └── RoleDetector.tsx
├── services/            # API and external service integrations
│   ├── supabase.ts      # Supabase client configuration
│   ├── hostelAPI.ts     # Hostel API UCC integration
│   ├── auth.ts          # Authentication service
│   └── analytics.ts     # Analytics data aggregation
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state management
│   └── AppContext.tsx   # Global app state
├── types/               # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── hostel.ts        # Hostel and booking types
│   └── navigation.ts    # Navigation parameter types
├── utils/               # Utility functions and helpers
│   ├── validation.ts    # Form validation utilities
│   ├── formatting.ts    # Data formatting helpers
│   └── constants.ts     # App constants and configuration
└── hooks/               # Custom React hooks
    ├── useAuth.ts       # Authentication hook
    ├── useHostels.ts    # Hostel data management
    └── useAnalytics.ts  # Analytics data hook
```

## Component Organization

- **Role-based separation**: Student and landlord screens in separate folders
- **Shared components**: Reusable UI components in common folder
- **Feature grouping**: Related components grouped by functionality
- **Type safety**: Comprehensive TypeScript interfaces for all data structures

## Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: Descriptive names indicating purpose (StudentTabNavigator, HostelCard)
- **Services**: Lowercase with descriptive suffixes (hostelAPI.ts, auth.ts)
- **Types**: Interface names matching domain objects (User, Hostel, BookingHistoryEntry)

## Code Organization Principles

- **Single responsibility**: Each component/service has one clear purpose
- **Separation of concerns**: UI, business logic, and data access separated
- **Reusability**: Common patterns extracted into shared components/hooks
- **Type safety**: All data structures and API responses typed
