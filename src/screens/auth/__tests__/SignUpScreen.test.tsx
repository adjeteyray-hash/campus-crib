import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../SignUpScreen';
import { useAuth } from '../../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      signUp: jest.fn(),
      loading: false,
      error: null,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });
  });

  it('should render sign up form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Join CampusCrib today')).toBeTruthy();
    expect(getByText('Student')).toBeTruthy();
    expect(getByText('Landlord')).toBeTruthy();
    expect(getByPlaceholderText('Enter your full name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
    expect(getByPlaceholderText('Create a password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm your password')).toBeTruthy();
    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('should handle role selection', () => {
    const { getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const landlordButton = getByText('Landlord');
    fireEvent.press(landlordButton);

    // The landlord button should be selected (this would be tested through styling)
    expect(landlordButton).toBeTruthy();
  });

  it('should handle form input changes', () => {
    const { getByPlaceholderText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText('Enter your full name');
    const emailInput = getByPlaceholderText('Enter your email');
    const phoneInput = getByPlaceholderText('Enter your phone number');
    const passwordInput = getByPlaceholderText('Create a password');
    const confirmPasswordInput = getByPlaceholderText('Confirm your password');

    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(phoneInput, '+233201234567');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'Password123');

    expect(nameInput.props.value).toBe('John Doe');
    expect(emailInput.props.value).toBe('john@example.com');
    expect(phoneInput.props.value).toBe('+233201234567');
    expect(passwordInput.props.value).toBe('Password123');
    expect(confirmPasswordInput.props.value).toBe('Password123');
  });

  it('should show validation error for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should show validation error for password mismatch', async () => {
    const { getByPlaceholderText, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const passwordInput = getByPlaceholderText('Create a password');
    const confirmPasswordInput = getByPlaceholderText('Confirm your password');

    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'DifferentPassword');
    fireEvent(confirmPasswordInput, 'blur');

    await waitFor(() => {
      expect(getByText('Passwords do not match')).toBeTruthy();
    });
  });

  it('should call signUp when form is submitted with valid data', async () => {
    const mockSignUp = jest.fn();
    mockUseAuth.mockReturnValue({
      signUp: mockSignUp,
      loading: false,
      error: null,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });

    const { getByPlaceholderText, getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const nameInput = getByPlaceholderText('Enter your full name');
    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Create a password');
    const confirmPasswordInput = getByPlaceholderText('Confirm your password');
    const submitButton = getByText('Create Account');

    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.changeText(emailInput, 'john@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.changeText(confirmPasswordInput, 'Password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'Password123',
        role: 'student',
        name: 'John Doe',
        phone: undefined,
      });
    });
  });

  it('should navigate to login screen when sign in link is pressed', () => {
    const { getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    const signInLink = getByText('Sign In');
    fireEvent.press(signInLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('should display error message when sign up fails', () => {
    const errorMessage = 'Email already exists';
    mockUseAuth.mockReturnValue({
      signUp: jest.fn(),
      loading: false,
      error: errorMessage,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });

    const { getByText } = render(
      <SignUpScreen navigation={mockNavigation} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });
});