import { NavigationProp, CommonActions } from '@react-navigation/native';
import { StudentTabParamList } from '../types/navigation';
import { Share, Linking, Platform } from 'react-native';

/**
 * Student-specific navigation helpers
 * Provides convenient methods for common student navigation patterns
 */

/**
 * Navigate to home and reset the navigation stack
 */
export const navigateToHome = (navigation: NavigationProp<StudentTabParamList>) => {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    })
  );
};

/**
 * Navigate to search with optional pre-filled query
 */
export const navigateToSearchWithQuery = (
  navigation: NavigationProp<StudentTabParamList>,
  query?: string
) => {
  navigation.navigate('Search', { query });
};

/**
 * Navigate to hostel detail from different sources
 */
export const navigateToHostelDetailFromHome = (
  navigation: NavigationProp<StudentTabParamList>,
  hostelId: string
) => {
  navigation.navigate('HostelDetail', { hostelId, source: 'home' });
};

export const navigateToHostelDetailFromSearch = (
  navigation: NavigationProp<StudentTabParamList>,
  hostelId: string
) => {
  navigation.navigate('HostelDetail', { hostelId, source: 'search' });
};

export const navigateToHostelDetailFromHistory = (
  navigation: NavigationProp<StudentTabParamList>,
  hostelId: string
) => {
  navigation.navigate('HostelDetail', { hostelId, source: 'history' });
};

/**
 * Navigate back to the appropriate tab based on source
 */
export const navigateBackFromHostelDetail = (
  navigation: NavigationProp<StudentTabParamList>,
  source: 'home' | 'search' | 'history' = 'home'
) => {
  switch (source) {
    case 'search':
      navigation.navigate('Search', {});
      break;
    case 'history':
      navigation.navigate('History');
      break;
    case 'home':
    default:
      navigation.navigate('Home');
      break;
  }
};

/**
 * Check if we can go back in the navigation stack
 */
export const canGoBack = (navigation: NavigationProp<StudentTabParamList>): boolean => {
  return navigation.canGoBack();
};

/**
 * Go back or navigate to home if no back stack
 */
export const goBackOrHome = (navigation: NavigationProp<StudentTabParamList>) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
  } else {
    navigation.navigate('Home');
  }
};

/**
 * Navigate to profile tab
 */
export const navigateToProfile = (navigation: NavigationProp<StudentTabParamList>) => {
  navigation.navigate('Profile');
};

/**
 * Navigate to history tab
 */
export const navigateToHistory = (navigation: NavigationProp<StudentTabParamList>) => {
  navigation.navigate('History');
};

/**
 * Get current route name
 */
export const getCurrentRouteName = (navigation: NavigationProp<StudentTabParamList>): string => {
  const state = navigation.getState();
  const route = state.routes[state.index];
  return route.name;
};

/**
 * Check if currently on a specific tab
 */
export const isOnTab = (
  navigation: NavigationProp<StudentTabParamList>,
  tabName: keyof StudentTabParamList
): boolean => {
  return getCurrentRouteName(navigation) === tabName;
};

/**
 * Share hostel via deep link
 */
export const shareHostel = async (hostelId: string, hostelName: string) => {
  const deepLink = `campuscrib://hostel/${hostelId}`;
  const message = `Check out this hostel: ${hostelName}\n${deepLink}`;
  
  try {
    await Share.share({
      message,
      url: deepLink,
      title: `Share ${hostelName}`,
    });
  } catch (error) {
    console.warn('Failed to share hostel:', error);
  }
};

/**
 * Open external map app with hostel location
 */
export const openMapWithLocation = async (address: string, hostelName: string) => {
  try {
    const encodedAddress = encodeURIComponent(`${hostelName}, ${address}`);
    
    // Try Google Maps first, fallback to Apple Maps on iOS
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    const appleMapsUrl = `http://maps.apple.com/?q=${encodedAddress}`;
    
    const mapUrl = Platform.OS === 'ios' ? appleMapsUrl : googleMapsUrl;
    
    const canOpen = await Linking.canOpenURL(mapUrl);
    if (canOpen) {
      await Linking.openURL(mapUrl);
    }
  } catch (error) {
    console.warn('Failed to open map:', error);
  }
};

/**
 * Open phone dialer with landlord contact
 */
export const callLandlord = async (phoneNumber: string) => {
  try {
    const phoneUrl = `tel:${phoneNumber}`;
    
    const canOpen = await Linking.canOpenURL(phoneUrl);
    if (canOpen) {
      await Linking.openURL(phoneUrl);
    }
  } catch (error) {
    console.warn('Failed to open phone dialer:', error);
  }
};

/**
 * Open email client with landlord contact
 */
export const emailLandlord = async (email: string, hostelName: string) => {
  try {
    const subject = encodeURIComponent(`Inquiry about ${hostelName}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in learning more about ${hostelName}. Could you please provide more details?\n\nThank you!`);
    const emailUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    const canOpen = await Linking.canOpenURL(emailUrl);
    if (canOpen) {
      await Linking.openURL(emailUrl);
    }
  } catch (error) {
    console.warn('Failed to open email client:', error);
  }
};