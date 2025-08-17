import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StudentTabParamList, StudentStackParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';

// Import actual screens
import { HomeScreen } from '../screens/student/HomeScreen';
import { SearchScreen } from '../screens/student/SearchScreen';
import { HistoryScreen } from '../screens/student/HistoryScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';
import { HostelDetailScreen } from '../screens/shared/HostelDetailScreen';

const Tab = createBottomTabNavigator<StudentTabParamList>();
const Stack = createStackNavigator<StudentStackParamList>();

// Stack navigator for screens that need to be pushed on top of tabs
const HomeStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="HostelDetail"
        component={HostelDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Hostel Details',
          headerStyle: {
            backgroundColor: theme.background.secondary,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            color: theme.text.primary,
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const SearchStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen
        name="HostelDetail"
        component={HostelDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Hostel Details',
          headerStyle: {
            backgroundColor: theme.background.secondary,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            color: theme.text.primary,
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const HistoryStack = () => {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
      <Stack.Screen
        name="HostelDetail"
        component={HostelDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Hostel Details',
          headerStyle: {
            backgroundColor: theme.background.secondary,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            color: theme.text.primary,
            fontWeight: '600',
          },
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * StudentTabNavigator - Bottom tab navigation for student users
 * Provides access to Home, Search, History, and Profile screens
 * Supports deep linking and type-safe navigation
 */
export const StudentTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Define styles inside component to access theme
  const styles = StyleSheet.create({
    placeholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background.secondary,
      padding: 20,
    },
    placeholderText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 8,
    },
    placeholderSubtext: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.navigation.text.active,
        tabBarInactiveTintColor: theme.navigation.text.inactive,
        tabBarStyle: {
          backgroundColor: theme.navigation.background,
          borderTopWidth: 1,
          borderTopColor: theme.navigation.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          elevation: 8,
          // Web-compatible shadow
          ...(Platform.OS === 'web' ? {
            boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
          } : {
            shadowColor: theme.shadow.small.shadowColor,
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: theme.shadow.small.shadowOpacity,
            shadowRadius: theme.shadow.small.shadowRadius,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          title: 'Find Hostels',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarLabel: 'Search',
          title: 'Search Hostels',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStack}
        options={{
          tabBarLabel: 'History',
          title: 'My History',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          title: 'My Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.background.secondary,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            color: theme.text.primary,
            fontWeight: '600',
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default StudentTabNavigator;