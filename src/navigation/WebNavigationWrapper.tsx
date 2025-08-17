import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { isWeb, isMobileWeb } from '../utils/platform';
import WebResponsiveLayout from '../components/common/WebResponsiveLayout';
import WebNavigationHeader from '../components/common/WebNavigationHeader';
import WebSidebar from '../components/common/WebSidebar';

interface WebNavigationWrapperProps {
  children: React.ReactNode;
}

export const WebNavigationWrapper: React.FC<WebNavigationWrapperProps> = ({ children }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobileWeb());

  useEffect(() => {
    if (route?.name) {
      setCurrentRoute(route.name.toLowerCase());
    }
  }, [route?.name]);

  const handleSidebarNavigation = (routeKey: string) => {
    // Map sidebar route keys to actual navigation routes
    const routeMap: Record<string, string> = {
      home: 'Home',
      search: 'Search',
      history: 'History',
      profile: 'Profile',
      hostels: 'ManageHostels',
      analytics: 'Analytics',
    };

    const targetRoute = routeMap[routeKey];
    if (targetRoute && navigation.canGoBack()) {
      navigation.navigate(targetRoute as never);
    } else if (targetRoute) {
      navigation.reset({
        index: 0,
        routes: [{ name: targetRoute as never }],
      });
    }
  };

  const handleMenuPress = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isWeb) {
    return <>{children}</>;
  }

  return (
    <WebResponsiveLayout
      header={
        <WebNavigationHeader
          title="CampusCrib"
          onMenuPress={handleMenuPress}
          showMenu={sidebarOpen}
        />
      }
      sidebar={
        <WebSidebar
          currentRoute={currentRoute}
          onNavigate={handleSidebarNavigation}
        />
      }
    >
      {children}
    </WebResponsiveLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WebNavigationWrapper;
