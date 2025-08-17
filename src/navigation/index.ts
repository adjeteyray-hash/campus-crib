// Navigation components
export { default as AuthStack } from './AuthStack';
export { default as StudentTabNavigator } from './StudentTabNavigator';
export { default as LandlordTabNavigator } from './LandlordTabNavigator';
export { default as RoleDetector } from './RoleDetector';

// Navigation helpers - General
export {
  useStudentNavigation,
  useLandlordNavigation,
  useAuthNavigation,
  navigateToHostelDetail,
  navigateToLandlordHostelDetail,
  navigateToSearch,
  parseDeepLink,
  generateDeepLink,
  canAccessScreen,
  getDefaultScreen,
} from './navigationHelpers';

// Navigation helpers - Student specific
import * as StudentNavigationHelpers from './studentNavigationHelpers';
export { StudentNavigationHelpers as StudentNavigation };

// Navigation helpers - Landlord specific  
import * as LandlordNavigationHelpers from './landlordNavigationHelpers';
export { LandlordNavigationHelpers as LandlordNavigation };

// Deep linking
export { linking } from './linking';

// Re-export types for convenience
export type {
  AuthStackParamList,
  StudentTabParamList,
  LandlordTabParamList,
  RootStackParamList,
  StudentTabScreenProps,
  LandlordTabScreenProps,
} from '../types/navigation';