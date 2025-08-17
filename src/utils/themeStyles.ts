import { StyleSheet } from 'react-native';
import THEME, { THEME_COLORS, COMPONENT_THEMES } from './theme';

// Common theme styles that can be used across components
export const ThemeStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: THEME.background.primary,
  },
  
  // Card styles
  card: {
    backgroundColor: THEME.surface.card,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.border.card,
    ...THEME.shadow.small,
  },
  
  cardElevated: {
    backgroundColor: THEME.surface.elevated,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    ...THEME.shadow.medium,
  },
  
  // Button styles
  button: {
    primary: {
      backgroundColor: THEME.interactive.button.primary,
      borderRadius: THEME.borderRadius.md,
      paddingVertical: THEME.spacing.md,
      paddingHorizontal: THEME.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: THEME.interactive.button.secondary,
      borderRadius: THEME.borderRadius.md,
      paddingVertical: THEME.spacing.md,
      paddingHorizontal: THEME.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: THEME.interactive.button.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderRadius: THEME.borderRadius.md,
      paddingVertical: THEME.spacing.md,
      paddingHorizontal: THEME.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: THEME.interactive.button.primary,
    },
    disabled: {
      backgroundColor: THEME.interactive.button.disabled,
      borderRadius: THEME.borderRadius.md,
      paddingVertical: THEME.spacing.md,
      paddingHorizontal: THEME.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.6,
    },
  },
  
  // Button text styles
  buttonText: {
    primary: {
      color: THEME.interactive.button.text.primary,
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.semibold,
    },
    secondary: {
      color: THEME.interactive.button.text.secondary,
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.semibold,
    },
    outline: {
      color: THEME.interactive.button.text.primary,
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.semibold,
    },
    disabled: {
      color: THEME.interactive.button.text.disabled,
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.semibold,
    },
  },
  
  // Input styles
  input: {
    container: {
      marginBottom: THEME.spacing.md,
    },
    label: {
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.medium,
      color: THEME.text.primary,
      marginBottom: THEME.spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: THEME.border.input,
      borderRadius: THEME.borderRadius.md,
      paddingHorizontal: THEME.spacing.md,
      paddingVertical: THEME.spacing.md,
      fontSize: THEME.typography.sizes.md,
      backgroundColor: THEME.interactive.input.background,
      color: THEME.interactive.input.text,
    },
    inputFocus: {
      borderColor: THEME.interactive.input.focus,
    },
    inputError: {
      borderColor: THEME.error.main,
    },
    placeholder: {
      color: THEME.interactive.input.placeholder,
    },
    errorText: {
      fontSize: THEME.typography.sizes.sm,
      color: THEME.error.main,
      marginTop: THEME.spacing.xs,
    },
  },
  
  // Text styles
  text: {
    h1: {
      fontSize: THEME.typography.sizes.xxxl,
      fontWeight: THEME.typography.weights.bold,
      color: THEME.text.primary,
      lineHeight: THEME.typography.lineHeights.tight,
    },
    h2: {
      fontSize: THEME.typography.sizes.xxl,
      fontWeight: THEME.typography.weights.bold,
      color: THEME.text.primary,
      lineHeight: THEME.typography.lineHeights.tight,
    },
    h3: {
      fontSize: THEME.typography.sizes.xl,
      fontWeight: THEME.typography.weights.semibold,
      color: THEME.text.primary,
      lineHeight: THEME.typography.lineHeights.normal,
    },
    body: {
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.regular,
      color: THEME.text.primary,
      lineHeight: THEME.typography.lineHeights.normal,
    },
    bodyLarge: {
      fontSize: THEME.typography.sizes.lg,
      fontWeight: THEME.typography.weights.regular,
      color: THEME.text.primary,
      lineHeight: THEME.typography.lineHeights.normal,
    },
    bodySmall: {
      fontSize: THEME.typography.sizes.sm,
      fontWeight: THEME.typography.weights.regular,
      color: THEME.text.secondary,
      lineHeight: THEME.typography.lineHeights.normal,
    },
    caption: {
      fontSize: THEME.typography.sizes.xs,
      fontWeight: THEME.typography.weights.medium,
      color: THEME.text.tertiary,
      lineHeight: THEME.typography.lineHeights.normal,
    },
    link: {
      fontSize: THEME.typography.sizes.md,
      fontWeight: THEME.typography.weights.medium,
      color: THEME.text.link,
      lineHeight: THEME.typography.lineHeights.normal,
    },
  },
  
  // Layout styles
  layout: {
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowSpaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    padding: {
      padding: THEME.spacing.md,
    },
    paddingHorizontal: {
      paddingHorizontal: THEME.spacing.md,
    },
    paddingVertical: {
      paddingVertical: THEME.spacing.md,
    },
    margin: {
      margin: THEME.spacing.md,
    },
    marginHorizontal: {
      marginHorizontal: THEME.spacing.md,
    },
    marginVertical: {
      marginVertical: THEME.spacing.md,
    },
  },
  
  // Divider styles
  divider: {
    horizontal: {
      height: 1,
      backgroundColor: THEME.border.separator,
      marginVertical: THEME.spacing.md,
    },
    vertical: {
      width: 1,
      backgroundColor: THEME.border.separator,
      marginHorizontal: THEME.spacing.md,
    },
  },
  
  // Status styles
  status: {
    success: {
      backgroundColor: THEME.success.background,
      borderColor: THEME.success.main,
      borderWidth: 1,
      borderRadius: THEME.borderRadius.sm,
      padding: THEME.spacing.sm,
    },
    error: {
      backgroundColor: THEME.error.background,
      borderColor: THEME.error.main,
      borderWidth: 1,
      borderRadius: THEME.borderRadius.sm,
      padding: THEME.spacing.sm,
    },
    warning: {
      backgroundColor: THEME.warning.background,
      borderColor: THEME.warning.main,
      borderWidth: 1,
      borderRadius: THEME.borderRadius.sm,
      padding: THEME.spacing.sm,
    },
    info: {
      backgroundColor: THEME.info.background,
      borderColor: THEME.info.main,
      borderWidth: 1,
      borderRadius: THEME.borderRadius.sm,
      padding: THEME.spacing.sm,
    },
  },
  
  // Navigation styles
  navigation: {
    header: {
      backgroundColor: THEME.navigation.background,
      borderBottomColor: THEME.navigation.border,
      borderBottomWidth: 1,
    },
    tabBar: {
      backgroundColor: THEME.navigation.background,
      borderTopColor: THEME.navigation.border,
      borderTopWidth: 1,
    },
  },
  
  // Form styles
  form: {
    container: {
      flex: 1,
      padding: THEME.spacing.md,
    },
    section: {
      marginBottom: THEME.spacing.lg,
    },
    row: {
      flexDirection: 'row',
      gap: THEME.spacing.md,
    },
    submitButton: {
      marginTop: THEME.spacing.lg,
    },
  },
  
  // List styles
  list: {
    container: {
      backgroundColor: THEME.background.primary,
    },
    item: {
      backgroundColor: THEME.surface.primary,
      borderBottomColor: THEME.border.separator,
      borderBottomWidth: 1,
      paddingVertical: THEME.spacing.md,
      paddingHorizontal: THEME.spacing.md,
    },
    itemLast: {
      borderBottomWidth: 0,
    },
  },
  
  // Modal styles
  modal: {
    container: {
      flex: 1,
      backgroundColor: THEME.background.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      backgroundColor: THEME.background.modal,
      borderRadius: THEME.borderRadius.lg,
      padding: THEME.spacing.lg,
      margin: THEME.spacing.lg,
      ...THEME.shadow.large,
    },
  },
});

// Helper function to create dynamic styles based on theme
export const createThemedStyles = (theme: typeof THEME) => {
  return StyleSheet.create({
    // Dynamic theme-aware styles can be created here
    dynamicContainer: {
      backgroundColor: theme.background.primary,
    },
    dynamicText: {
      color: theme.text.primary,
    },
  });
};

// Export individual style groups for easier imports
export const {
  container,
  card,
  button,
  buttonText,
  input,
  text,
  layout,
  divider,
  status,
  navigation,
  form,
  list,
  modal,
} = ThemeStyles;

export default ThemeStyles;
