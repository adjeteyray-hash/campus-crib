# Requirements Document

## Introduction

CampusCrib is a React Native mobile application that connects students with available hostels in Ghana. The app provides robust search functionality, booking history tracking, and direct landlord contact features. Landlords can onboard their hostels directly through the app. The application uses Supabase for authentication and database services, integrates with the free Hostel API UCC for hostel data, and supports both iOS and Android platforms through Expo.

## Requirements

### Requirement 1

**User Story:** As a student, I want to register and login with email and password, so that I can access the app's hostel search and booking features.

#### Acceptance Criteria

1. WHEN a new user opens the app THEN the system SHALL display authentication screens (login/signup)
2. WHEN a user provides valid email and password for signup THEN the system SHALL create a student account using Supabase Auth
3. WHEN a user provides valid credentials for login THEN the system SHALL authenticate and redirect to the student navigation stack
4. IF authentication fails THEN the system SHALL display appropriate error messages
5. WHEN a user successfully authenticates THEN the system SHALL store their role as 'student' in the profiles table

### Requirement 2

**User Story:** As a landlord, I want to create an account and login, so that I can onboard and manage my hostel listings.

#### Acceptance Criteria

1. WHEN a landlord selects the landlord role during signup THEN the system SHALL create an account with role 'landlord'
2. WHEN a landlord logs in successfully THEN the system SHALL redirect to the landlord navigation stack with bottom tab navigation
3. WHEN a landlord account is created THEN the system SHALL store their profile with role 'landlord' in Supabase profiles table

### Requirement 3

**User Story:** As a student, I want to see a list of available hostels on the home screen, so that I can browse accommodation options.

#### Acceptance Criteria

1. WHEN a student opens the home screen THEN the system SHALL fetch hostels from the Hostel API UCC GET /hostels endpoint
2. WHEN hostel data is received THEN the system SHALL display hostel cards showing image, name, price, and location
3. IF the API request fails THEN the system SHALL display user-friendly error messages with retry options
4. WHEN the home screen loads THEN the system SHALL complete loading within 2 seconds on 3G connection

### Requirement 4

**User Story:** As a student, I want to search for hostels by name, location, or price, so that I can find accommodation that meets my specific needs.

#### Acceptance Criteria

1. WHEN a student enters search terms THEN the system SHALL query the Hostel API UCC GET /search?query={keyword} endpoint
2. WHEN search input is provided THEN the system SHALL debounce user input to optimize API calls
3. WHEN search results are returned THEN the system SHALL display live filtered results
4. WHEN a student taps on a search result THEN the system SHALL navigate to the hostel detail screen

### Requirement 5

**User Story:** As a student, I want to view detailed information about a hostel and contact the landlord, so that I can make informed accommodation decisions.

#### Acceptance Criteria

1. WHEN a student taps on a hostel card THEN the system SHALL fetch detailed information using GET /hostels/{id}
2. WHEN hostel details load THEN the system SHALL display image gallery, amenities, description, and landlord contact information
3. WHEN a student taps the contact button THEN the system SHALL open email client or phone dialer with landlord contact details
4. WHEN a student views hostel details THEN the system SHALL record this action in the booking_history table with action 'viewed'

### Requirement 6

**User Story:** As a student, I want to see my booking and inquiry history, so that I can track hostels I've previously viewed or contacted.

#### Acceptance Criteria

1. WHEN a student accesses the history tab THEN the system SHALL display a paginated list of their booking history
2. WHEN a student views or contacts a hostel THEN the system SHALL record the action in Supabase booking_history table
3. WHEN a student taps on a history item THEN the system SHALL navigate back to the hostel detail screen
4. WHEN displaying history THEN the system SHALL show timestamp and action type ('viewed' or 'contacted')

### Requirement 7

**User Story:** As a landlord, I want to add and manage my hostel listings, so that I can attract potential student tenants.

#### Acceptance Criteria

1. WHEN a landlord accesses the dashboard THEN the system SHALL display their onboarded hostels from Supabase hostels table
2. WHEN a landlord adds a new hostel THEN the system SHALL provide a form with fields for name, images, address, price, and amenities
3. WHEN a landlord uploads images THEN the system SHALL store them in Supabase Storage and save URLs in the hostels table
4. WHEN a landlord saves hostel information THEN the system SHALL create a record in the hostels table with landlord_id foreign key
5. WHEN a landlord wants to edit a hostel THEN the system SHALL provide CRUD operations for their listings

### Requirement 8

**User Story:** As a landlord, I want to view detailed analytics about my hostel listings, so that I can understand their performance, identify top-performing hostels, and make data-driven decisions.

#### Acceptance Criteria

1. WHEN a landlord accesses the analytics screen THEN the system SHALL display comprehensive statistics for each hostel including view counts, contact attempts, and performance rankings
2. WHEN displaying analytics THEN the system SHALL show which hostels are performing best based on student engagement metrics
3. WHEN calculating hostel performance THEN the system SHALL aggregate view counts, contact attempts, and engagement rates from the booking_history table
4. WHEN showing hostel analytics THEN the system SHALL display individual hostel metrics including total views, total contacts, view-to-contact conversion rate, and trending data
5. WHEN presenting analytics data THEN the system SHALL provide visual indicators (charts/graphs) showing performance trends over time
6. WHEN comparing hostels THEN the system SHALL rank hostels by engagement metrics and highlight top performers

### Requirement 9

**User Story:** As any user, I want to securely log out of the application, so that my account remains protected.

#### Acceptance Criteria

1. WHEN a user selects logout THEN the system SHALL call Supabase auth.signOut()
2. WHEN logout is successful THEN the system SHALL navigate to the login screen
3. WHEN logout occurs THEN the system SHALL purge all local authentication state

### Requirement 10

**User Story:** As a user, I want the app to work reliably on both iOS and Android devices with intuitive navigation, so that I can access it regardless of my mobile platform.

#### Acceptance Criteria

1. WHEN the app is built THEN the system SHALL support both iOS and Android platforms through Expo
2. WHEN the app runs THEN the system SHALL maintain consistent functionality across both platforms
3. WHEN navigation occurs THEN the system SHALL use bottom tab navigation for both students and landlords for consistent user experience
4. WHEN users navigate THEN the system SHALL provide clear visual indicators of the current screen and available navigation options

### Requirement 11

**User Story:** As a user, I want the app to be accessible and secure, so that I can use it safely regardless of my abilities.

#### Acceptance Criteria

1. WHEN the app displays content THEN the system SHALL meet WCAG color contrast requirements
2. WHEN images are displayed THEN the system SHALL provide appropriate alt text descriptions
3. WHEN data is transmitted THEN the system SHALL use HTTPS encryption
4. WHEN accessing data THEN the system SHALL implement Supabase Row Level Security (RLS)

### Requirement 12

**User Story:** As a developer, I want the codebase to maintain high quality standards, so that the application is maintainable and reliable.

#### Acceptance Criteria

1. WHEN code is written THEN the system SHALL be configured with ESLint and Prettier
2. WHEN lint scripts run THEN the system SHALL execute without errors
3. WHEN format scripts run THEN the system SHALL apply consistent code formatting
4. WHEN the development environment is set up THEN the system SHALL use only free tier services
