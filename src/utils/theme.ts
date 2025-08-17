// CampusCrib App Theme
// Using the specified color palette for consistent theming
// Primary dark theme with light theme variant

export const THEME_COLORS = {
  // Primary color palette - using only the specified 5 colors
  white: '#FFFFFF',
  lightGray: '#A8A3B8',
  mediumPurple: '#332E3D',
  darkGray: '#17171C',
  charcoal: '#24212B',
} as const;

// Dark theme as the primary theme
export const THEME = {
  // Primary colors
  primary: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
    contrast: THEME_COLORS.white,
  },
  
  // Secondary colors
  secondary: {
    main: THEME_COLORS.mediumPurple,
    light: THEME_COLORS.lightGray,
    dark: THEME_COLORS.charcoal,
    text: THEME_COLORS.white,
    contrast: THEME_COLORS.white,
  },
  
  // Background colors - Dark theme
  background: {
    primary: THEME_COLORS.darkGray,
    secondary: THEME_COLORS.charcoal,
    tertiary: THEME_COLORS.mediumPurple,
    card: THEME_COLORS.charcoal,
    overlay: 'rgba(255, 255, 255, 0.1)',
    modal: THEME_COLORS.charcoal,
  },
  
  // Surface colors - Dark theme
  surface: {
    primary: THEME_COLORS.charcoal,
    secondary: THEME_COLORS.mediumPurple,
    elevated: THEME_COLORS.mediumPurple,
    card: THEME_COLORS.charcoal,
    input: THEME_COLORS.mediumPurple,
    button: THEME_COLORS.lightGray,
  },
  
  // Text colors - Dark theme
  text: {
    primary: THEME_COLORS.white,
    secondary: THEME_COLORS.lightGray,
    tertiary: THEME_COLORS.lightGray,
    disabled: THEME_COLORS.mediumPurple,
    inverse: THEME_COLORS.darkGray,
    link: THEME_COLORS.lightGray,
    placeholder: THEME_COLORS.white,
  },
  
  // Border colors - Dark theme
  border: {
    primary: THEME_COLORS.mediumPurple,
    secondary: THEME_COLORS.lightGray,
    input: THEME_COLORS.mediumPurple,
    card: THEME_COLORS.mediumPurple,
    separator: THEME_COLORS.mediumPurple,
    focus: THEME_COLORS.lightGray,
  },
  
  // Status colors - Dark theme
  success: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
    background: THEME_COLORS.charcoal,
  },
  
  error: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
    background: THEME_COLORS.charcoal,
  },
  
  warning: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
    background: THEME_COLORS.charcoal,
  },
  
  info: {
    main: THEME_COLORS.lightGray,
    light: THEME_COLORS.white,
    dark: THEME_COLORS.mediumPurple,
    text: THEME_COLORS.white,
    background: THEME_COLORS.charcoal,
  },
  
  // Interactive elements - Dark theme
  interactive: {
    button: {
      primary: THEME_COLORS.lightGray,
      secondary: THEME_COLORS.mediumPurple,
      disabled: THEME_COLORS.charcoal,
      text: {
        primary: THEME_COLORS.white,
        secondary: THEME_COLORS.white,
        disabled: THEME_COLORS.mediumPurple,
      },
    },
    input: {
      background: THEME_COLORS.charcoal,
      border: THEME_COLORS.mediumPurple,
      focus: THEME_COLORS.lightGray,
      text: THEME_COLORS.white,
      placeholder: THEME_COLORS.white,
    },
    link: {
      normal: THEME_COLORS.lightGray,
      hover: THEME_COLORS.white,
      active: THEME_COLORS.white,
    },
  },
  
  // Navigation - Dark theme
  navigation: {
    background: THEME_COLORS.darkGray,
    border: THEME_COLORS.mediumPurple,
    text: {
      active: THEME_COLORS.lightGray,
      inactive: THEME_COLORS.mediumPurple,
    },
    indicator: THEME_COLORS.lightGray,
  },
  
  // Shadows and elevation - Dark theme
  shadow: {
    small: {
      shadowColor: THEME_COLORS.darkGray,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: THEME_COLORS.darkGray,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: THEME_COLORS.darkGray,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  
  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 50,
  },
  
  // Typography
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      display: 32,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },
} as const;

// Component-specific theme variants
export const COMPONENT_THEMES = {
  // Card theme
  card: {
    background: THEME.surface.card,
    border: THEME.border.card,
    shadow: THEME.shadow.small,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  
  // Button theme
  button: {
    primary: {
      background: THEME.interactive.button.primary,
      text: THEME.interactive.button.text.primary,
      border: THEME.interactive.button.primary,
      borderRadius: THEME.borderRadius.md,
      padding: THEME.spacing.md,
    },
    secondary: {
      background: THEME.interactive.button.secondary,
      text: THEME.interactive.button.text.secondary,
      border: THEME.interactive.button.secondary,
      borderRadius: THEME.borderRadius.md,
      padding: THEME.spacing.md,
    },
    outline: {
      background: 'transparent',
      text: THEME.interactive.button.text.primary,
      border: THEME.interactive.button.primary,
      borderRadius: THEME.borderRadius.md,
      padding: THEME.spacing.md,
    },
  },
  
  // Input theme
  input: {
    background: THEME.interactive.input.background,
    border: THEME.interactive.input.border,
    focus: THEME.interactive.input.focus,
    text: THEME.interactive.input.text,
    placeholder: THEME.interactive.input.placeholder,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  
  // Navigation theme
  navigation: {
    background: THEME.navigation.background,
    border: THEME.navigation.border,
    activeText: THEME.navigation.text.active,
    inactiveText: THEME.navigation.text.inactive,
    indicator: THEME.navigation.indicator,
  },
} as const;

// Light theme variant (for users who prefer light mode) - using only the specified colors
export const LIGHT_THEME = {
  ...THEME,
  background: {
    primary: THEME_COLORS.white,
    secondary: THEME_COLORS.lightGray,
    tertiary: THEME_COLORS.mediumPurple,
    card: THEME_COLORS.white,
    overlay: 'rgba(23, 23, 28, 0.7)',
    modal: THEME_COLORS.white,
  },
  surface: {
    primary: THEME_COLORS.white,
    secondary: THEME_COLORS.lightGray,
    elevated: THEME_COLORS.white,
    card: THEME_COLORS.white,
    input: THEME_COLORS.white,
    button: THEME_COLORS.mediumPurple,
  },
  text: {
    primary: THEME_COLORS.darkGray,
    secondary: THEME_COLORS.charcoal,
    tertiary: THEME_COLORS.mediumPurple,
    disabled: THEME_COLORS.lightGray,
    inverse: THEME_COLORS.white,
    link: THEME_COLORS.mediumPurple,
    placeholder: THEME_COLORS.lightGray,
  },
  border: {
    primary: THEME_COLORS.lightGray,
    secondary: THEME_COLORS.mediumPurple,
    input: THEME_COLORS.lightGray,
    card: THEME_COLORS.lightGray,
    separator: THEME_COLORS.lightGray,
    focus: THEME_COLORS.mediumPurple,
  },
  interactive: {
    button: {
      primary: THEME_COLORS.mediumPurple,
      secondary: THEME_COLORS.lightGray,
      disabled: THEME_COLORS.lightGray,
      text: {
        primary: THEME_COLORS.white,
        secondary: THEME_COLORS.darkGray,
        disabled: THEME_COLORS.mediumPurple,
      },
    },
    input: {
      background: THEME_COLORS.white,
      border: THEME_COLORS.lightGray,
      focus: THEME_COLORS.mediumPurple,
      text: THEME_COLORS.darkGray,
      placeholder: THEME_COLORS.lightGray,
    },
    link: {
      normal: THEME_COLORS.mediumPurple,
      hover: THEME_COLORS.charcoal,
      active: THEME_COLORS.darkGray,
    },
  },
  navigation: {
    background: THEME_COLORS.white,
    border: THEME_COLORS.lightGray,
    text: {
      active: THEME_COLORS.mediumPurple,
      inactive: THEME_COLORS.mediumPurple,
    },
    indicator: THEME_COLORS.mediumPurple,
  },
  shadow: {
    small: {
      shadowColor: THEME_COLORS.darkGray,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: THEME_COLORS.darkGray,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: THEME_COLORS.darkGray,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
} as const;

// Export the dark theme as default
export default THEME;
