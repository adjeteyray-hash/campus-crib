# CampusCrib Mobile App

CampusCrib is a React Native mobile application that connects students with available hostels in Ghana. The app provides robust search functionality, booking history tracking, and direct landlord contact features.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials and API endpoints.

4. Start the development server:
   ```bash
   npm start
   ```

## 📱 Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (LoadingSpinner, ErrorBoundary)
│   ├── hostel/          # Hostel-specific components
│   └── forms/           # Form components and validation
├── screens/             # Screen components organized by user role
│   ├── auth/            # Authentication screens
│   ├── student/         # Student screens
│   ├── landlord/        # Landlord screens
│   └── shared/          # Shared screens
├── navigation/          # Navigation configuration
├── services/            # API and external service integrations
├── contexts/            # React Context providers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
└── hooks/               # Custom React hooks
```

## 🛠️ Technology Stack

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript (strict mode)
- **Navigation**: React Navigation v6
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with RLS
- **Storage**: Supabase Storage
- **External API**: Hostel API UCC
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest + React Native Testing Library

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_HOSTEL_API_BASE_URL=https://api.hostel-ucc.com/v1
```

### Supabase Setup

1. Create a new Supabase project
2. Set up the database schema (see design document)
3. Configure Row Level Security (RLS) policies
4. Set up Storage bucket for hostel images

## 👥 User Roles

### Students
- Browse and search hostels
- View detailed hostel information
- Contact landlords directly
- Track booking history

### Landlords
- Add and manage hostel listings
- View analytics and performance metrics
- Update hostel information and images
- Manage contact information

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📝 Code Quality

The project uses ESLint and Prettier for code quality and formatting:

```bash
npm run lint    # Check and fix linting issues
npm run format  # Format code with Prettier
```

## 🚀 Deployment

The app is built with Expo and can be deployed to:

- **iOS App Store** via Expo Application Services (EAS)
- **Google Play Store** via EAS
- **Over-the-air updates** via Expo Updates

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.