import React, { useEffect } from 'react';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { isWeb } from '../../utils/platform';

interface WebCompatibleStatusBarProps {
  style?: 'auto' | 'inverted' | 'light' | 'dark';
  backgroundColor?: string;
  translucent?: boolean;
}

const WebCompatibleStatusBar: React.FC<WebCompatibleStatusBarProps> = ({ 
  style = 'auto',
  backgroundColor,
  translucent = false,
}) => {
  // Handle web status bar (theme-color meta tag)
  useEffect(() => {
    if (!isWeb) return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (metaThemeColor) {
      if (backgroundColor) {
        metaThemeColor.setAttribute('content', backgroundColor);
      } else {
        // Set default theme color based on style
        const defaultColor = style === 'light' ? '#ffffff' : '#000000';
        metaThemeColor.setAttribute('content', defaultColor);
      }
    }
  }, [style, backgroundColor]);

  // Use expo-status-bar for native platforms
  if (!isWeb) {
    return (
      <ExpoStatusBar 
        style={style} 
        backgroundColor={backgroundColor}
        translucent={translucent}
      />
    );
  }

  // Web doesn't need a StatusBar component
  return null;
};

export default WebCompatibleStatusBar;
