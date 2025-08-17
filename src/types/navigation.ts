import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { Hostel } from './hostel';

// Root navigation parameter list
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Student: NavigatorScreenParams<StudentTabParamList>;
  Landlord: NavigatorScreenParams<LandlordTabParamList>;
};

// Authentication stack parameters
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

// Student tab navigation parameters
export type StudentTabParamList = {
  Home: NavigatorScreenParams<StudentStackParamList>;
  Search: NavigatorScreenParams<StudentStackParamList>;
  History: NavigatorScreenParams<StudentStackParamList>;
  Profile: undefined;
};

// Student stack navigation parameters (for nested stacks)
export type StudentStackParamList = {
  HomeMain: undefined;
  SearchMain: {
    query?: string;
  };
  HistoryMain: undefined;
  HostelDetail: {
    hostelId: string;
    source?: 'home' | 'search' | 'history';
  };
};

// Landlord tab navigation parameters
export type LandlordTabParamList = {
  MyHostels: NavigatorScreenParams<LandlordStackParamList>;
  AddHostel: NavigatorScreenParams<LandlordStackParamList>;
  Analytics: NavigatorScreenParams<LandlordStackParamList>;
  Profile: undefined;
};

// Landlord stack navigation parameters (for nested stacks)
export type LandlordStackParamList = {
  MyHostelsMain: {
    action?: 'edit';
    hostelData?: Hostel;
  } | undefined;
  AddHostelMain: undefined;
  AnalyticsMain: {
    hostelId?: string;
  };
  EditHostel: {
    hostelId: string;
    hostelData?: Hostel;
  };
  HostelDetail: {
    hostelId: string;
    source?: 'dashboard' | 'analytics';
    isLandlord?: boolean;
    hostelData?: Hostel;
  };
};

// Screen props type helpers
export type ScreenProps<
  T extends keyof RootStackParamList,
  K extends keyof RootStackParamList[T]
> = {
  route: {
    params: RootStackParamList[T][K];
  };
  navigation: any; // Will be properly typed with specific navigator
};

// Navigation prop types
export type StudentNavigationProp<T extends keyof StudentTabParamList> = 
  BottomTabNavigationProp<StudentTabParamList, T>;

export type LandlordNavigationProp<T extends keyof LandlordTabParamList> = 
  BottomTabNavigationProp<LandlordTabParamList, T>;

export type StudentStackNavigationProp<T extends keyof StudentStackParamList> = 
  StackNavigationProp<StudentStackParamList, T>;

export type LandlordStackNavigationProp<T extends keyof LandlordStackParamList> = 
  StackNavigationProp<LandlordStackParamList, T>;

// Tab navigation props
export type StudentTabScreenProps<T extends keyof StudentTabParamList> = {
  route: {
    params: StudentTabParamList[T];
  };
  navigation: StudentNavigationProp<T>;
};

export type LandlordTabScreenProps<T extends keyof LandlordTabParamList> = {
  route: {
    params: LandlordTabParamList[T];
  };
  navigation: LandlordNavigationProp<T>;
};

// Stack navigation props
export type StudentStackScreenProps<T extends keyof StudentStackParamList> = {
  route: {
    params: StudentStackParamList[T];
  };
  navigation: StudentStackNavigationProp<T>;
};

export type LandlordStackScreenProps<T extends keyof LandlordStackParamList> = {
  route: {
    params: LandlordStackParamList[T];
  };
  navigation: LandlordStackNavigationProp<T>;
};