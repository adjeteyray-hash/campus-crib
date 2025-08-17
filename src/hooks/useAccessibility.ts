import React, { useCallback, useRef, useEffect } from 'react';
import { AccessibilityInfo, findNodeHandle } from 'react-native';
import { SCREEN_READER_ANNOUNCEMENTS } from '../utils/accessibility';

interface UseAccessibilityReturn {
  // Screen reader announcements
  announceToScreenReader: (message: string) => void;
  announceLoading: (type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.loading) => void;
  announceSuccess: (type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.success) => void;
  announceError: (type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.error) => void;
  announceNavigation: (type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.navigation) => void;
  
  // Focus management
  focusElement: (ref: React.RefObject<any>) => void;
  focusFirstElement: (refs: React.RefObject<any>[]) => void;
  
  // Accessibility utilities
  isScreenReaderEnabled: () => Promise<boolean>;
  setAccessibilityFocus: (ref: React.RefObject<any>) => void;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const screenReaderEnabled = useRef<boolean>(false);

  // Check if screen reader is enabled
  const checkScreenReaderStatus = useCallback(async () => {
    try {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      screenReaderEnabled.current = enabled;
      return enabled;
    } catch (error) {
      console.warn('Failed to check screen reader status:', error);
      return false;
    }
  }, []);

  // Announce message to screen reader
  const announceToScreenReader = useCallback((message: string) => {
    if (screenReaderEnabled.current) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, []);

  // Announce loading states
  const announceLoading = useCallback((type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.loading) => {
    const message = SCREEN_READER_ANNOUNCEMENTS.loading[type];
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  // Announce success states
  const announceSuccess = useCallback((type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.success) => {
    const message = SCREEN_READER_ANNOUNCEMENTS.success[type];
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  // Announce error states
  const announceError = useCallback((type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.error) => {
    const message = SCREEN_READER_ANNOUNCEMENTS.error[type];
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  // Announce navigation changes
  const announceNavigation = useCallback((type: keyof typeof SCREEN_READER_ANNOUNCEMENTS.navigation) => {
    const message = SCREEN_READER_ANNOUNCEMENTS.navigation[type];
    announceToScreenReader(message);
  }, [announceToScreenReader]);

  // Focus a specific element
  const focusElement = useCallback((ref: React.RefObject<any>) => {
    if (ref.current) {
      const nodeHandle = findNodeHandle(ref.current);
      if (nodeHandle) {
        AccessibilityInfo.setAccessibilityFocus(nodeHandle);
      }
    }
  }, []);

  // Focus the first available element from a list of refs
  const focusFirstElement = useCallback((refs: React.RefObject<any>[]) => {
    for (const ref of refs) {
      if (ref.current) {
        focusElement(ref);
        break;
      }
    }
  }, [focusElement]);

  // Set accessibility focus on an element
  const setAccessibilityFocus = useCallback((ref: React.RefObject<any>) => {
    focusElement(ref);
  }, [focusElement]);

  // Check if screen reader is enabled
  const isScreenReaderEnabled = useCallback(async () => {
    return await checkScreenReaderStatus();
  }, [checkScreenReaderStatus]);

  // Initialize screen reader status check
  useEffect(() => {
    checkScreenReaderStatus();
    
    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled: boolean) => {
        screenReaderEnabled.current = enabled;
      }
    );

    return () => {
      subscription?.remove();
    };
  }, [checkScreenReaderStatus]);

  return {
    announceToScreenReader,
    announceLoading,
    announceSuccess,
    announceError,
    announceNavigation,
    focusElement,
    focusFirstElement,
    isScreenReaderEnabled,
    setAccessibilityFocus,
  };
};
