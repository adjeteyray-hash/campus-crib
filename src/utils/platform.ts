import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

// Web-specific utilities
export const getWebViewport = () => {
  if (!isWeb) return { width: 0, height: 0 };
  
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
};

export const isMobileWeb = () => {
  if (!isWeb) return false;
  return window.innerWidth <= 768;
};

export const isTabletWeb = () => {
  if (!isWeb) return false;
  return window.innerWidth > 768 && window.innerWidth <= 1024;
};

export const isDesktopWeb = () => {
  if (!isWeb) return false;
  return window.innerWidth > 1024;
};

// Responsive breakpoints for web
export const WEB_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1440,
};

// Platform-specific styling
export const getPlatformStyle = (webStyle: any, nativeStyle: any) => {
  return isWeb ? webStyle : nativeStyle;
};

// Web-specific event handling
export const addWebResizeListener = (callback: () => void) => {
  if (!isWeb) return () => {};
  
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};

// Touch vs mouse events
export const getPointerEvent = () => {
  if (isWeb) {
    return 'ontouchstart' in window ? 'touch' : 'mouse';
  }
  return 'touch';
};
