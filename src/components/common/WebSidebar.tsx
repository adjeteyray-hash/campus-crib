import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { isWeb, isMobileWeb } from '../../utils/platform';

interface WebSidebarProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

export const WebSidebar: React.FC<WebSidebarProps> = ({
  onNavigate,
  currentRoute,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isMobile = isMobileWeb();

  const styles = createStyles(theme, isMobile);

  if (!isWeb || isMobile) {
    return null;
  }

  const navigationItems = user?.role === 'student' 
    ? [
        { key: 'home', label: 'Home', icon: '🏠' },
        { key: 'search', label: 'Search Hostels', icon: '🔍' },
        { key: 'history', label: 'Booking History', icon: '📚' },
        { key: 'profile', label: 'Profile', icon: '👤' },
      ]
    : [
        { key: 'hostels', label: 'Manage Hostels', icon: '🏢' },
        { key: 'analytics', label: 'Analytics', icon: '📊' },
        { key: 'profile', label: 'Profile', icon: '👤' },
      ];

  const handleNavigation = (route: string) => {
    onNavigate?.(route);
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Navigation</Text>
      </View>
      
      <ScrollView style={styles.navigationList} showsVerticalScrollIndicator={false}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navigationItem,
              currentRoute === item.key && styles.activeNavigationItem
            ]}
            onPress={() => handleNavigation(item.key)}
            accessibilityLabel={item.label}
            accessibilityRole="button"
            accessibilityState={{ selected: currentRoute === item.key }}
          >
            <Text style={styles.navigationIcon}>{item.icon}</Text>
            <Text style={[
              styles.navigationLabel,
              currentRoute === item.key && styles.activeNavigationLabel
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.sidebarFooter}>
        <Text style={styles.userInfo}>
          Logged in as {user?.role === 'student' ? 'Student' : 'Landlord'}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any, isMobile: boolean) => StyleSheet.create({
  sidebar: {
    width: 280,
    backgroundColor: theme.background.secondary,
    borderRightWidth: 1,
    borderRightColor: theme.border.primary,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.secondary,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  navigationList: {
    flex: 1,
    paddingVertical: 16,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeNavigationItem: {
    backgroundColor: theme.primary.main,
  },
  navigationIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  navigationLabel: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '500',
  },
  activeNavigationLabel: {
    color: theme.text.onPrimary,
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border.secondary,
  },
  userInfo: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
});

export default WebSidebar;
