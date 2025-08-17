import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { isWeb, isMobileWeb, addWebResizeListener } from '../../utils/platform';

interface WebResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const WebResponsiveLayout: React.FC<WebResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
}) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(isMobileWeb());
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    if (!isWeb) return;

    const cleanup = addWebResizeListener(() => {
      const newIsMobile = isMobileWeb();
      setIsMobile(newIsMobile);
      if (!newIsMobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    });

    return cleanup;
  }, [sidebarOpen]);

  const styles = createStyles(theme, isMobile, sidebarOpen);

  if (!isWeb) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {header && (
        <View style={styles.header}>
          {header}
        </View>
      )}
      
      <View style={styles.mainContent}>
        {sidebar && !isMobile && (
          <View style={styles.sidebar}>
            {sidebar}
          </View>
        )}
        
        <View style={styles.content}>
          {children}
        </View>
      </View>
      
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any, isMobile: boolean, sidebarOpen: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: 16,
  },
  mainContent: {
    flex: 1,
    flexDirection: isMobile ? 'column' : 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: theme.background.secondary,
    borderRightWidth: 1,
    borderRightColor: theme.border.primary,
    padding: 20,
  },
  content: {
    flex: 1,
    padding: isMobile ? 16 : 24,
    maxWidth: isMobile ? '100%' : 'calc(100% - 280px)',
  },
  footer: {
    backgroundColor: theme.background.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.border.primary,
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: 20,
  },
});

export default WebResponsiveLayout;
