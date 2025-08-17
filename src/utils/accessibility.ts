// Accessibility constants for CampusCrib app
// Following WCAG 2.1 AA standards
// Updated to use the new dark theme color palette

import { THEME_COLORS } from './theme';

// WCAG 2.1 AA compliant color palette
// All colors meet minimum 4.5:1 contrast ratio for normal text
// and 3:1 for large text (18pt+ or 14pt+ bold)
export const ACCESSIBLE_COLORS = {
  // Primary colors with high contrast
  primary: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
  },
  
  // Secondary colors
  secondary: {
    main: THEME_COLORS.mediumPurple,
    light: THEME_COLORS.lightGray,
    dark: THEME_COLORS.charcoal,
    text: THEME_COLORS.white,
  },
  
  // Success colors
  success: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
  },
  
  // Error colors
  error: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
  },
  
  // Warning colors
  warning: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
  },
  
  // Info colors
  info: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
  },
  
  // Neutral colors
  neutral: {
    white: THEME_COLORS.white,
    lightGray: THEME_COLORS.lightGray,
    gray: THEME_COLORS.mediumPurple,
    darkGray: THEME_COLORS.charcoal,
    black: THEME_COLORS.darkGray,
  },
  
  // Text colors with high contrast - Dark theme
  text: {
    primary: THEME_COLORS.white,
    secondary: THEME_COLORS.lightGray,
    disabled: THEME_COLORS.mediumPurple,
    inverse: THEME_COLORS.darkGray,
    link: THEME_COLORS.lightGray,
  },
  
  // Background colors - Dark theme
  background: {
    primary: THEME_COLORS.darkGray,
    secondary: THEME_COLORS.charcoal,
    tertiary: THEME_COLORS.mediumPurple,
    overlay: 'rgba(255, 255, 255, 0.1)',
  },
} as const;

// Accessibility labels and hints for common UI elements
export const ACCESSIBILITY_LABELS = {
  // Navigation
  navigation: {
    backButton: 'Go back',
    homeTab: 'Home tab',
    searchTab: 'Search tab',
    historyTab: 'History tab',
    profileTab: 'Profile tab',
    myHostelsTab: 'My Hostels tab',
    addHostelTab: 'Add Hostel tab',
    analyticsTab: 'Analytics tab',
  },
  
  // Forms
  forms: {
    emailInput: 'Email address input',
    passwordInput: 'Password input',
    confirmPasswordInput: 'Confirm password input',
    nameInput: 'Full name input',
    phoneInput: 'Phone number input',
    addressInput: 'Address input',
    priceInput: 'Price input',
    amenitiesInput: 'Amenities input',
    descriptionInput: 'Description input',
    submitButton: 'Submit form',
    cancelButton: 'Cancel action',
    saveButton: 'Save changes',
    deleteButton: 'Delete item',
    editButton: 'Edit item',
  },
  
  // Hostel related
  hostel: {
    hostelCard: 'Hostel information card',
    hostelImage: 'Photo of hostel',
    hostelName: 'Hostel name',
    hostelAddress: 'Hostel address',
    hostelPrice: 'Hostel price',
    hostelAmenities: 'Hostel amenities',
    contactButton: 'Contact landlord',
    callButton: 'Call landlord',
    emailButton: 'Email landlord',
    viewDetailsButton: 'View hostel details',
    bookButton: 'Book this hostel',
    favoriteButton: 'Add to favorites',
  },
  
  // Common actions
  actions: {
    retryButton: 'Try again',
    refreshButton: 'Refresh content',
    closeButton: 'Close dialog',
    nextButton: 'Next step',
    previousButton: 'Previous step',
    doneButton: 'Complete action',
    loadingSpinner: 'Loading content',
    errorMessage: 'Error occurred',
    successMessage: 'Action completed successfully',
  },
} as const;

// Accessibility hints for better user understanding
export const ACCESSIBILITY_HINTS = {
  // Navigation hints
  navigation: {
    backButton: 'Double tap to return to previous screen',
    homeTab: 'Double tap to go to home screen',
    searchTab: 'Double tap to search for hostels',
    historyTab: 'Double tap to view your booking history',
    profileTab: 'Double tap to access your profile settings',
  },
  
  // Form hints
  forms: {
    emailInput: 'Enter your email address to sign in or create account',
    passwordInput: 'Enter your password (minimum 8 characters)',
    confirmPasswordInput: 'Re-enter your password to confirm',
    submitButton: 'Double tap to submit your information',
    cancelButton: 'Double tap to cancel and return to previous screen',
  },
  
  // Hostel hints
  hostel: {
    hostelCard: 'Double tap to view detailed information about this hostel',
    contactButton: 'Double tap to contact the landlord about this hostel',
    callButton: 'Double tap to call the landlord directly',
    emailButton: 'Double tap to send an email to the landlord',
    bookButton: 'Double tap to book this hostel (this will record your interest)',
  },
  
  // Action hints
  actions: {
    retryButton: 'Double tap to attempt the action again',
    refreshButton: 'Double tap to reload the current content',
    loadingSpinner: 'Content is currently loading, please wait',
  },
} as const;

// Screen reader announcements
export const SCREEN_READER_ANNOUNCEMENTS = {
  // Loading states
  loading: {
    hostels: 'Loading available hostels',
    search: 'Searching for hostels',
    details: 'Loading hostel details',
    profile: 'Loading profile information',
    analytics: 'Loading analytics data',
  },
  
  // Success states
  success: {
    login: 'Successfully signed in',
    signup: 'Account created successfully',
    profileUpdate: 'Profile updated successfully',
    hostelAdded: 'Hostel added successfully',
    hostelUpdated: 'Hostel updated successfully',
    hostelDeleted: 'Hostel removed successfully',
  },
  
  // Error states
  error: {
    loginFailed: 'Sign in failed, please check your credentials',
    signupFailed: 'Account creation failed, please try again',
    networkError: 'Network error, please check your connection',
    generalError: 'An error occurred, please try again',
  },
  
  // Navigation announcements
  navigation: {
    screenLoaded: 'Screen loaded',
    tabChanged: 'Tab changed',
    screenChanged: 'Screen changed',
  },
} as const;

// Focus management constants
export const FOCUS_MANAGEMENT = {
  // Focus order for forms
  formFocusOrder: [
    'email-input',
    'password-input',
    'confirm-password-input',
    'name-input',
    'phone-input',
    'address-input',
    'submit-button',
    'cancel-button',
  ],
  
  // Focus order for hostel cards
  hostelCardFocusOrder: [
    'hostel-image',
    'hostel-name',
    'hostel-address',
    'hostel-price',
    'hostel-amenities',
    'view-details-button',
    'contact-button',
  ],
} as const;

// Export all accessibility constants
export default {
  ACCESSIBLE_COLORS,
  ACCESSIBILITY_LABELS,
  ACCESSIBILITY_HINTS,
  SCREEN_READER_ANNOUNCEMENTS,
  FOCUS_MANAGEMENT,
};
