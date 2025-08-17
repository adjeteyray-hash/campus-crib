import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { LandlordTabParamList, LandlordStackParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';

// Import actual screens
import { AnalyticsScreen } from '../screens/landlord/AnalyticsScreen';
import { LandlordProfileScreen } from '../screens/landlord/LandlordProfileScreen';
import { ManageHostelsScreen } from '../screens/landlord/ManageHostelsScreen';
import { LandlordHostelDetailScreen } from '../screens/landlord/LandlordHostelDetailScreen';
import { HostelForm } from '../components/forms/HostelForm';

// Placeholder screens - these will be implemented in later tasks
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Wrapper component for EditHostel screen
const EditHostelWrapper = ({ route }: { route: any }) => {
  const navigation = useNavigation();
  
  const handleSuccess = () => {
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Ensure we have hostel data and set mode to edit
  const hostelData = route.params?.hostelData;
  
  if (!hostelData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No hostel data provided for editing</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <HostelForm
      mode="edit"
      initialData={hostelData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      showTitle={false}
      showHeader={false}
    />
  );
};

// Wrapper component for ManageHostelsScreen
const ManageHostelsWrapper = () => {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  
  return <ManageHostelsScreen navigation={navigation} route={route} />;
};

// Wrapper component for AddHostel tab
const AddHostelWrapper = () => {
  const navigation = useNavigation();
  
  const handleSuccess = () => {
    // Navigate back to MyHostels tab after successful creation
    navigation.navigate('MyHostels' as never);
  };

  const handleCancel = () => {
    // Navigate back to MyHostels tab when cancelled
    navigation.navigate('MyHostels' as never);
  };

  return (
    <HostelForm
      mode="create"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      showTitle={false}
      showHeader={false}
    />
  );
};

const Tab = createBottomTabNavigator<LandlordTabParamList>();
const Stack = createStackNavigator<LandlordStackParamList>();

// Stack navigator for screens that need to be pushed on top of tabs
const MyHostelsStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.background.primary }
      }}
    >
      <Stack.Screen name="MyHostelsMain" component={ManageHostelsWrapper} />
      <Stack.Screen
        name="HostelDetail"
        component={LandlordHostelDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Hostel Details',
          headerStyle: {
            backgroundColor: theme.surface.primary,
            borderBottomWidth: 1,
            borderBottomColor: theme.border.separator,
            shadowColor: theme.shadow.small.shadowColor,
            shadowOffset: theme.shadow.small.shadowOffset,
            shadowOpacity: theme.shadow.small.shadowOpacity,
            shadowRadius: theme.shadow.small.shadowRadius,
            elevation: theme.shadow.small.elevation,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
          },
        }}
      />
      <Stack.Screen
        name="EditHostel"
        component={EditHostelWrapper}
        options={{ 
          headerShown: true, 
          title: 'Edit Hostel',
          headerStyle: {
            backgroundColor: theme.surface.primary,
            borderBottomWidth: 1,
            borderBottomColor: theme.border.separator,
            shadowColor: theme.shadow.small.shadowColor,
            shadowOffset: theme.shadow.small.shadowOffset,
            shadowOpacity: theme.shadow.small.shadowOpacity,
            shadowRadius: theme.shadow.small.shadowRadius,
            elevation: theme.shadow.small.elevation,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
          },
        }}
      />
    </Stack.Navigator>
  );
};

const AddHostelStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.background.primary }
      }}
    >
      <Stack.Screen 
        name="AddHostelMain" 
        component={AddHostelWrapper}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AnalyticsStack = () => {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: theme.background.primary }
      }}
    >
      <Stack.Screen 
        name="AnalyticsMain" 
        component={AnalyticsScreen}
        options={{
          headerShown: true,
          title: 'Analytics',
          headerStyle: {
            backgroundColor: theme.surface.primary,
            borderBottomWidth: 1,
            borderBottomColor: theme.border.separator,
            shadowColor: theme.shadow.small.shadowColor,
            shadowOffset: theme.shadow.small.shadowOffset,
            shadowOpacity: theme.shadow.small.shadowOpacity,
            shadowRadius: theme.shadow.small.shadowRadius,
            elevation: theme.shadow.small.elevation,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
          },
        }}
      />
      <Stack.Screen
        name="HostelDetail"
        component={LandlordHostelDetailScreen}
        options={{ 
          headerShown: true, 
          title: 'Hostel Details',
          headerStyle: {
            backgroundColor: theme.surface.primary,
            borderBottomWidth: 1,
            borderBottomColor: theme.border.separator,
            shadowColor: theme.shadow.small.shadowColor,
            shadowOffset: theme.shadow.small.shadowOffset,
            shadowOpacity: theme.shadow.small.shadowOpacity,
            shadowRadius: theme.shadow.small.shadowRadius,
            elevation: theme.shadow.small.elevation,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.semibold,
          },
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * LandlordTabNavigator - Bottom tab navigation for landlord users
 * Provides access to MyHostels, AddHostel, Analytics, and Profile screens
 * Supports deep linking and type-safe navigation
 */
export const LandlordTabNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="MyHostels"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'MyHostels':
              iconName = focused ? 'business' : 'business-outline';
              break;
            case 'AddHostel':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'analytics' : 'analytics-outline';
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
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 8,
          shadowColor: theme.shadow.medium.shadowColor,
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: theme.shadow.medium.shadowOpacity,
          shadowRadius: theme.shadow.medium.shadowRadius,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}
    >
      <Tab.Screen
        name="MyHostels"
        component={MyHostelsStack}
        options={{
          tabBarLabel: 'My Hostels',
          title: 'My Hostels',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AddHostel"
        component={AddHostelStack}
        options={{
          tabBarLabel: 'Add Hostel',
          title: 'Add New Hostel',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsStack}
        options={{
          tabBarLabel: 'Analytics',
          title: 'Analytics',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={LandlordProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          title: 'My Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default LandlordTabNavigator;