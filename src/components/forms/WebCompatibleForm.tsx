import React, { ReactNode } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { isWeb, isMobileWeb } from '../../utils/platform';

interface WebCompatibleFormProps {
  children: ReactNode;
  onSubmit?: () => void;
  style?: any;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
}

export const WebCompatibleForm: React.FC<WebCompatibleFormProps> = ({
  children,
  onSubmit,
  style,
  scrollable = true,
  keyboardAvoiding = true,
}) => {
  const isMobile = isMobileWeb();

  // Web-specific form handling
  if (isWeb) {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.();
    };

    const formContent = (
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {children}
      </form>
    );

    if (scrollable) {
      return (
        <ScrollView 
          style={[styles.container, style]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {formContent}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.container, style]}>
        {formContent}
      </View>
    );
  }

  // Native form handling
  const content = (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );

  if (keyboardAvoiding && Platform.OS !== 'web') {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {scrollable ? (
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    );
  }

  if (scrollable) {
    return (
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default WebCompatibleForm;
