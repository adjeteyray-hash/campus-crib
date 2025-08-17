import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { useAuth } from '../../../hooks/useAuth';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      loading: false,
      error: null,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });
  });

  it('should render login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to your CampusCrib account')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('should handle email input changes', () => {
    const { getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('should handle password input changes', () => {
    const { getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const passwordInput = getByPlaceholderText('Enter your password');
    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('should show validation errors for invalid email', async () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent(emailInput, 'blur');

    await waitFor(() => {
      expect(getByText('Please enter a valid email address')).toBeTruthy();
    });
  });

  it('should show validation errors for short password', async () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const passwordInput = getByPlaceholderText('Enter your password');
    fireEvent.changeText(passwordInput, '123');
    fireEvent(passwordInput, 'blur');

    await waitFor(() => {
      expect(getByText('Password must be at least 8 characters long')).toBeTruthy();
    });
  });

  it('should call signIn when form is submitted with valid data', async () => {
    const mockSignIn = jest.fn();
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      loading: false,
      error: null,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });

    const { getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const emailInput = getByPlaceholderText('Enter your email');
    const passwordInput = getByPlaceholderText('Enter your password');
    const submitButton = getByText('Sign In');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'Password123');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
    });
  });

  it('should navigate to sign up screen when sign up link is pressed', () => {
    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    const signUpLink = getByText('Sign Up');
    fireEvent.press(signUpLink);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('SignUp');
  });

  it('should display loading state when signing in', () => {
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      loading: true,
      error: null,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });

    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    // The ActivityIndicator should be rendered when loading
    expect(() => getByTestId('loading-indicator')).not.toThrow();
  });

  it('should display error message when sign in fails', () => {
    const errorMessage = 'Invalid credentials';
    mockUseAuth.mockReturnValue({
      signIn: jest.fn(),
      loading: false,
      error: errorMessage,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isStudent: false,
      isLandlord: false,
      userRole: null,
      signUp: jest.fn(),
      signOut: jest.fn(),
      refreshUser: jest.fn(),
      hasRole: jest.fn(),
      getUserDisplayName: jest.fn(),
      isCurrentUser: jest.fn(),
    });

    const { getByText } = render(
      <LoginScreen navigation={mockNavigation} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });
});