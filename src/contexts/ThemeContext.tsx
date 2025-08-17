import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import THEME, { THEME_COLORS, COMPONENT_THEMES, LIGHT_THEME } from '../utils/theme';

// Theme context interface
interface ThemeContextType {
  theme: typeof THEME;
  colors: typeof THEME_COLORS;
  componentThemes: typeof COMPONENT_THEMES;
  isLight: boolean;
  toggleTheme: () => void;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Start with dark theme by default (isLight: false)
  const [isLight, setIsLight] = React.useState(false);

  const toggleTheme = () => {
    setIsLight(prev => !prev);
  };

  // Get the current theme based on isLight state
  const currentTheme = isLight ? LIGHT_THEME : THEME;

  // Debug logging to help troubleshoot theme issues
  useEffect(() => {
    console.log('🎨 ThemeContext: Theme changed to', isLight ? 'LIGHT' : 'DARK');
    console.log('🎨 ThemeContext: Background primary color:', currentTheme.background.primary);
    console.log('🎨 ThemeContext: Text primary color:', currentTheme.text.primary);
  }, [isLight, currentTheme]);

  const value: ThemeContextType = {
    theme: currentTheme,
    colors: THEME_COLORS,
    componentThemes: COMPONENT_THEMES,
    isLight,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme with better error handling
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default dark theme instead of throwing error
    console.warn('useTheme: Theme context not available, using default theme');
    return {
      theme: THEME,
      colors: THEME_COLORS,
      componentThemes: COMPONENT_THEMES,
      isLight: false,
      toggleTheme: () => {
        console.warn('Theme toggle not available in this context');
      },
    };
  }
  return context;
};

// Hook to get just the theme object
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};

// Hook to get just the theme object
export const useThemeObject = () => {
  const { theme } = useTheme();
  return theme;
};

// Hook to get component themes
export const useComponentThemes = () => {
  const { componentThemes } = useTheme();
  return componentThemes;
};

export default ThemeProvider;
