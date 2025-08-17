import { NavigationProp, useNavigation } from '@react-navigation/native';
import { 
  StudentTabParamList, 
  LandlordTabParamList, 
  AuthStackParamList 
} from '../types/navigation';

// Type-safe navigation hooks for different navigators

/**
 * Hook for type-safe navigation in Student tab navigator
 */
export const useStudentNavigation = () => {
  return useNavigation<NavigationProp<StudentTabParamList>>();
};

/**
 * Hook for type-safe navigation in Landlord tab navigator
 */
export const useLandlordNavigation = () => {
  return useNavigation<NavigationProp<LandlordTabParamList>>();
};

/**
 * Hook for type-safe navigation in Auth stack navigator
 */
export const useAuthNavigation = () => {
  return useNavigation<NavigationProp<AuthStackParamList>>();
};

// Navigation helper functions

/**
 * Navigate to hostel detail screen from student context
 */
export const navigateToHostelDetail = (
  navigation: NavigationProp<StudentTabParamList>,
  hostelId: string,
  source: 'home' | 'search' | 'history' = 'home'
) => {
  navigation.navigate('HostelDetail', { hostelId, source });
};

/**
 * Navigate to hostel detail screen from landlord context
 */
export const navigateToLandlordHostelDetail = (
  navigation: NavigationProp<LandlordTabParamList>,
  hostelId: string,
  source: 'dashboard' | 'analytics' = 'dashboard'
) => {
  navigation.navigate('HostelDetail', { hostelId, source });
};

/**
 * Navigate to edit hostel screen
 */
export const navigateToEditHostel = (
  navigation: NavigationProp<LandlordTabParamList>,
  hostelId: string
) => {
  navigation.navigate('EditHostel', { hostelId });
};

/**
 * Navigate to analytics with optional hostel filter
 */
export const navigateToAnalytics = (
  navigation: NavigationProp<LandlordTabParamList>,
  hostelId?: string
) => {
  navigation.navigate('Analytics', { hostelId });
};

/**
 * Navigate to search with optional query
 */
export const navigateToSearch = (
  navigation: NavigationProp<StudentTabParamList>,
  query?: string
) => {
  navigation.navigate('Search', { query });
};

// Deep linking helpers

/**
 * Parse deep link URL and return navigation parameters
 */
export const parseDeepLink = (url: string) => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const params = Object.fromEntries(urlObj.searchParams);

    // Parse different deep link patterns
    if (path.startsWith('/hostel/')) {
      const hostelId = path.split('/')[2];
      return {
        screen: 'HostelDetail',
        params: { hostelId, ...params }
      };
    }

    if (path.startsWith('/search')) {
      return {
        screen: 'Search',
        params: params
      };
    }

    if (path.startsWith('/analytics')) {
      return {
        screen: 'Analytics',
        params: params
      };
    }

    return null;
  } catch (error) {
    console.warn('Failed to parse deep link:', url, error);
    return null;
  }
};

/**
 * Generate deep link URL for sharing
 */
export const generateDeepLink = (screen: string, params?: Record<string, string>) => {
  const baseUrl = 'campuscrib://';
  let path = '';

  switch (screen) {
    case 'HostelDetail':
      path = `/hostel/${params?.hostelId}`;
      break;
    case 'Search':
      path = '/search';
      break;
    case 'Analytics':
      path = '/analytics';
      break;
    default:
      path = '/';
  }

  const url = new URL(path, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'hostelId') { // hostelId is already in the path
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
};

// Navigation guards

/**
 * Check if user has permission to access a screen
 */
export const canAccessScreen = (
  userRole: 'student' | 'landlord',
  screenName: string
): boolean => {
  const studentScreens = ['Home', 'Search', 'History', 'Profile', 'HostelDetail'];
  const landlordScreens = ['MyHostels', 'AddHostel', 'Analytics', 'Profile', 'EditHostel', 'HostelDetail'];

  if (userRole === 'student') {
    return studentScreens.includes(screenName);
  }

  if (userRole === 'landlord') {
    return landlordScreens.includes(screenName);
  }

  return false;
};

/**
 * Get default screen for user role
 */
export const getDefaultScreen = (userRole: 'student' | 'landlord'): string => {
  return userRole === 'student' ? 'Home' : 'MyHostels';
};