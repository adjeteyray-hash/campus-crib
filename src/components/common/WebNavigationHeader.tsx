import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { isWeb, isMobileWeb } from '../../utils/platform';

interface WebNavigationHeaderProps {
  title?: string;
  onMenuPress?: () => void;
  showMenu?: boolean;
}

export const WebNavigationHeader: React.FC<WebNavigationHeaderProps> = ({
  title = 'CampusCrib',
  onMenuPress,
  showMenu = false,
}) => {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = isMobileWeb();

  const styles = createStyles(theme, isMobile);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuPress?.();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {isMobile && onMenuPress && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={toggleMenu}
              accessibilityLabel="Toggle navigation menu"
              accessibilityRole="button"
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          {user ? (
            <View style={styles.userSection}>
              <Text style={styles.userName}>
                {user.role === 'student' ? 'Student' : 'Landlord'}
              </Text>
              
              {!isMobile && (
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleSignOut}
                  accessibilityLabel="Sign out"
                  accessibilityRole="button"
                >
                  <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
              )}
              
              {isMobile && (
                <TouchableOpacity
                  style={styles.userMenuButton}
                  onPress={toggleMenu}
                  accessibilityLabel="User menu"
                  accessibilityRole="button"
                >
                  <Text style={styles.userMenuIcon}>👤</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <Text style={styles.signInPrompt}>Sign in to continue</Text>
          )}
        </View>
      </View>

      {/* Mobile dropdown menu */}
      {isMobile && isMenuOpen && (
        <View style={styles.mobileMenu}>
          {user && (
            <TouchableOpacity
              style={styles.mobileMenuItem}
              onPress={handleSignOut}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <Text style={styles.mobileMenuItemText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any, isMobile: boolean) => StyleSheet.create({
  header: {
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 16 : 24,
    paddingVertical: 16,
    minHeight: 64,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
    padding: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: theme.text.primary,
  },
  title: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    color: theme.text.secondary,
    marginRight: isMobile ? 0 : 16,
  },
  signOutButton: {
    backgroundColor: theme.error.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  signOutText: {
    color: theme.text.onError,
    fontSize: 14,
    fontWeight: '500',
  },
  userMenuButton: {
    padding: 8,
  },
  userMenuIcon: {
    fontSize: 20,
    color: theme.text.primary,
  },
  signInPrompt: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  mobileMenu: {
    backgroundColor: theme.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.border.primary,
    paddingVertical: 8,
  },
  mobileMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.secondary,
  },
  mobileMenuItemText: {
    fontSize: 16,
    color: theme.text.primary,
  },
});

export default WebNavigationHeader;
