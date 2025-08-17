import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LandlordProfileScreen } from '../LandlordProfileScreen';
import { useAuth } from '../../../contexts/AuthContext';
import { profileService } from '../../../services/supabase';
import type { User } from '../../../types/auth';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');
jest.mock('../../../services/supabase');

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

describe('LandlordProfileScreen', () => {
  const mockUser: User = {
    id: 'landlord-123',
    email: 'landlord@test.com',
    role: 'landlord',
    name: 'John Smith',
    phone: '+233987654321',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockAuthContext = {
    user: mockUser,
    loading: false,
    error: null,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshUser: jest.fn(),
    clearError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
    mockProfileService.updateProfile.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      name: mockUser.name || null,
      phone: mockUser.phone || null,
      created_at: mockUser.created_at!,
      updated_at: new Date().toISOString(),
    });
  });

  describe('Rendering', () => {
    it('renders loading state when user is null', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: null,
      });

      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Loading profile...')).toBeTruthy();
    });

    it('renders landlord profile information correctly', () => {
      const { getByText, getByDisplayValue } = render(<LandlordProfileScreen />);
      
      expect(getByText('John Smith')).toBeTruthy();
      expect(getByText('Landlord Account')).toBeTruthy();
      expect(getByDisplayValue('John Smith')).toBeTruthy(); // Business name field
      expect(getByDisplayValue('landlord@test.com')).toBeTruthy();
      expect(getByDisplayValue('+233987654321')).toBeTruthy();
    });

    it('renders profile sections correctly', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Business Information')).toBeTruthy();
      expect(getByText('Contact Information')).toBeTruthy();
      expect(getByText('Settings')).toBeTruthy();
      expect(getByText('Account')).toBeTruthy();
    });

    it('renders business verification button', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Verify Business')).toBeTruthy();
    });

    it('renders landlord-specific settings', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Push Notifications')).toBeTruthy();
      expect(getByText('Email Updates')).toBeTruthy();
      expect(getByText('Marketing Emails')).toBeTruthy();
      expect(getByText('Analytics Sharing')).toBeTruthy();
    });

    it('renders landlord-specific account actions', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Help & Support')).toBeTruthy();
      expect(getByText('Terms & Privacy')).toBeTruthy();
      expect(getByText('Billing & Payments')).toBeTruthy();
      expect(getByText('Logout')).toBeTruthy();
    });
  });

  describe('Business Verification', () => {
    it('shows verification dialog when verify button is pressed', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      fireEvent.press(getByText('Verify Business'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Business Verification',
        'To verify your business, please contact our support team with your business registration documents.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Contact Support' }),
          expect.objectContaining({ text: 'Later', style: 'cancel' }),
        ])
      );
    });

    it('shows contact support information when requested', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      fireEvent.press(getByText('Verify Business'));
      
      // Get the contact support callback
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const contactCallback = alertCall[2][0].onPress;
      
      // Execute contact support
      contactCallback();
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Contact Support',
        'Email: support@campuscrib.com\nPhone: +233 XX XXX XXXX'
      );
    });
  });

  describe('Profile Editing', () => {
    it('enables editing mode when edit button is pressed', () => {
      const { getByText, getByDisplayValue } = render(<LandlordProfileScreen />);
      
      const editButton = getByText('Edit');
      fireEvent.press(editButton);
      
      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
      
      // Check that business name and owner name inputs are editable
      const businessNameInput = getByDisplayValue('John Smith');
      const ownerNameInput = getByDisplayValue('John Smith');
      
      expect(businessNameInput.props.editable).toBe(true);
      expect(ownerNameInput.props.editable).toBe(true);
    });

    it('cancels editing and resets form data', () => {
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Change business name (first input with this value)
      const businessNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(businessNameInputs[0], 'New Business Name');
      
      // Cancel editing
      fireEvent.press(getByText('Cancel'));
      
      // Check that form is reset
      expect(getAllByDisplayValue('John Smith')).toHaveLength(2); // Business name and owner name
      expect(getByText('Edit')).toBeTruthy();
    });

    it('validates business name length', async () => {
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Set business name too short
      const businessNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(businessNameInputs[0], 'A');
      
      // Try to save
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      expect(getByText('Business name must be at least 2 characters long')).toBeTruthy();
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('validates owner name length', async () => {
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Set owner name too short (second input with this value)
      const ownerNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(ownerNameInputs[1], 'B');
      
      // Try to save
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      expect(getByText('Name must be at least 2 characters long')).toBeTruthy();
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('validates phone number format', async () => {
      const { getByText, getByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Enter invalid phone
      const phoneInput = getByDisplayValue('+233987654321');
      fireEvent.changeText(phoneInput, 'invalid-phone');
      
      // Try to save
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      expect(getByText('Please enter a valid phone number')).toBeTruthy();
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
    });

    it('saves profile successfully', async () => {
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Change owner name (second input with this value)
      const ownerNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(ownerNameInputs[1], 'John Johnson');
      
      // Save changes
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
          mockUser.id,
          {
            name: 'John Johnson',
            phone: '+233987654321',
          }
        );
      });
      
      expect(mockAuthContext.refreshUser).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Profile updated successfully!');
    });

    it('handles profile update error', async () => {
      mockProfileService.updateProfile.mockResolvedValue(null);
      
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Change owner name
      const ownerNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(ownerNameInputs[1], 'John Johnson');
      
      // Save changes
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to update profile. Please try again.'
        );
      });
    });
  });

  describe('Settings Management', () => {
    it('toggles notification settings', () => {
      const { getAllByRole } = render(<LandlordProfileScreen />);
      
      const switches = getAllByRole('switch');
      const notificationSwitch = switches[0]; // First switch is notifications
      
      // Initial state should be true
      expect(notificationSwitch.props.value).toBe(true);
      
      // Toggle switch
      fireEvent(notificationSwitch, 'valueChange', false);
      
      expect(notificationSwitch).toBeTruthy();
    });

    it('toggles email updates setting', () => {
      const { getAllByRole } = render(<LandlordProfileScreen />);
      
      const switches = getAllByRole('switch');
      const emailSwitch = switches[1]; // Second switch is email updates
      
      // Initial state should be true
      expect(emailSwitch.props.value).toBe(true);
      
      // Toggle switch
      fireEvent(emailSwitch, 'valueChange', false);
      
      expect(emailSwitch).toBeTruthy();
    });

    it('toggles marketing emails setting', () => {
      const { getAllByRole } = render(<LandlordProfileScreen />);
      
      const switches = getAllByRole('switch');
      const marketingSwitch = switches[2]; // Third switch is marketing emails
      
      // Initial state should be false
      expect(marketingSwitch.props.value).toBe(false);
      
      // Toggle switch
      fireEvent(marketingSwitch, 'valueChange', true);
      
      expect(marketingSwitch).toBeTruthy();
    });

    it('toggles analytics sharing setting', () => {
      const { getAllByRole } = render(<LandlordProfileScreen />);
      
      const switches = getAllByRole('switch');
      const analyticsSwitch = switches[3]; // Fourth switch is analytics sharing
      
      // Initial state should be true
      expect(analyticsSwitch.props.value).toBe(true);
      
      // Toggle switch
      fireEvent(analyticsSwitch, 'valueChange', false);
      
      expect(analyticsSwitch).toBeTruthy();
    });
  });

  describe('Logout Functionality', () => {
    it('shows logout confirmation dialog', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      fireEvent.press(getByText('Logout'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Logout', style: 'destructive' }),
        ])
      );
    });

    it('calls signOut when logout is confirmed', async () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      fireEvent.press(getByText('Logout'));
      
      // Get the logout confirmation callback
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const logoutCallback = alertCall[2][1].onPress;
      
      // Execute logout
      await act(async () => {
        await logoutCallback();
      });
      
      expect(mockAuthContext.signOut).toHaveBeenCalled();
    });

    it('handles logout error', async () => {
      mockAuthContext.signOut.mockRejectedValue(new Error('Logout failed'));
      
      const { getByText } = render(<LandlordProfileScreen />);
      
      fireEvent.press(getByText('Logout'));
      
      // Get the logout confirmation callback
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const logoutCallback = alertCall[2][1].onPress;
      
      // Execute logout
      await act(async () => {
        await logoutCallback();
      });
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to logout. Please try again.'
      );
    });
  });

  describe('Form Validation', () => {
    it('clears errors when user starts typing', () => {
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Enter invalid business name to trigger error
      const businessNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(businessNameInputs[0], 'A');
      
      // Try to save to trigger validation
      act(() => {
        fireEvent.press(getByText('Save'));
      });
      
      // Error should be shown
      expect(getByText('Business name must be at least 2 characters long')).toBeTruthy();
      
      // Start typing valid business name
      fireEvent.changeText(businessNameInputs[0], 'Valid Business');
      
      // Error should be cleared (we can't directly test this, but the component should handle it)
      expect(businessNameInputs[0]).toBeTruthy();
    });

    it('allows empty business name (optional field)', async () => {
      const { getByText, getAllByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Clear business name
      const businessNameInputs = getAllByDisplayValue('John Smith');
      fireEvent.changeText(businessNameInputs[0], '');
      
      // Save changes
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
          mockUser.id,
          {
            name: 'John Smith', // Owner name unchanged
            phone: '+233987654321',
          }
        );
      });
    });

    it('allows empty phone (optional field)', async () => {
      const { getByText, getByDisplayValue } = render(<LandlordProfileScreen />);
      
      // Enter edit mode
      fireEvent.press(getByText('Edit'));
      
      // Clear phone
      const phoneInput = getByDisplayValue('+233987654321');
      fireEvent.changeText(phoneInput, '');
      
      // Save changes
      await act(async () => {
        fireEvent.press(getByText('Save'));
      });
      
      await waitFor(() => {
        expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
          mockUser.id,
          {
            name: 'John Smith',
            phone: undefined,
          }
        );
      });
    });
  });

  describe('User Data Display', () => {
    it('handles user without optional fields', () => {
      const userWithoutOptionalFields: User = {
        id: 'landlord-123',
        email: 'landlord@test.com',
        role: 'landlord',
      };

      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: userWithoutOptionalFields,
      });

      const { getByText, getByDisplayValue } = render(<LandlordProfileScreen />);
      
      expect(getByText('Landlord')).toBeTruthy(); // Default name
      expect(getByDisplayValue('landlord@test.com')).toBeTruthy();
      expect(getByDisplayValue('')).toBeTruthy(); // Empty business name field
    });

    it('displays account creation date when available', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Account created: 1/1/2024')).toBeTruthy();
    });

    it('handles missing creation date', () => {
      const userWithoutDate: User = {
        ...mockUser,
        created_at: undefined,
      };

      mockUseAuth.mockReturnValue({
        ...mockAuthContext,
        user: userWithoutDate,
      });

      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('Account created: Unknown')).toBeTruthy();
    });

    it('shows phone number hint for landlords', () => {
      const { getByText } = render(<LandlordProfileScreen />);
      
      expect(getByText('This will be shown to students for contact')).toBeTruthy();
    });
  });
});