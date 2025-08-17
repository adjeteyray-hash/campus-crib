# Accessibility Documentation

## Overview

This document outlines the accessibility features implemented in the CampusCrib mobile application to ensure compliance with WCAG 2.1 AA standards and provide an inclusive user experience for all users, including those using assistive technologies.

## WCAG 2.1 AA Compliance

### Color Contrast Requirements
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text (18pt+ or 14pt+ bold)**: Minimum 3:1 contrast ratio
- **UI components and graphics**: Minimum 3:1 contrast ratio

### Color Palette
The app uses a carefully selected color palette that meets WCAG 2.1 AA standards:

```typescript
// Primary colors with high contrast
primary: {
  main: '#0056CC',    // Darker blue for better contrast
  light: '#4A90E2',
  dark: '#003D99',
  text: '#FFFFFF',    // White text on dark backgrounds
}

// Text colors with maximum contrast
text: {
  primary: '#212529',   // Near black for maximum contrast
  secondary: '#495057', // Dark gray for secondary text
  disabled: '#6C757D',  // Medium gray for disabled text
  inverse: '#FFFFFF',   // White for dark backgrounds
}
```

## Screen Reader Support

### iOS VoiceOver
- All interactive elements have proper `accessibilityRole` attributes
- Images include descriptive `accessibilityLabel` attributes
- Form fields have clear labels and hints
- Navigation changes are announced to users

### Android TalkBack
- Compatible with Android's TalkBack screen reader
- Proper focus management for touch navigation
- Clear announcements for state changes

## Accessibility Attributes

### Core Attributes
- `accessible={true}` - Makes element accessible to screen readers
- `accessibilityRole` - Defines the semantic role of the element
- `accessibilityLabel` - Provides a descriptive label for screen readers
- `accessibilityHint` - Gives additional context about the element's purpose

### Common Roles
```typescript
// Navigation
accessibilityRole="button"      // For buttons and touchable elements
accessibilityRole="header"      // For section headers and titles
accessibilityRole="text"        // For regular text content
accessibilityRole="alert"       // For error messages and important notifications
accessibilityRole="progressbar" // For loading indicators
```

## Component Accessibility

### LoadingSpinner
```typescript
<View 
  accessible={true}
  accessibilityRole="progressbar"
  accessibilityLabel="Loading content"
  accessibilityHint="Content is currently loading, please wait"
>
  <ActivityIndicator accessibilityLabel="Loading indicator" />
</View>
```

### ErrorBoundary
```typescript
<View 
  accessible={true}
  accessibilityRole="alert"
  accessibilityLabel="Error occurred"
>
  <TouchableOpacity
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel="Try again"
    accessibilityHint="Double tap to attempt the action again"
  >
    <Text>Try Again</Text>
  </TouchableOpacity>
</View>
```

### Form Elements
```typescript
<TextInput
  accessible={true}
  accessibilityLabel="Email address input"
  accessibilityHint="Enter your email address to sign in"
  accessibilityRole="text"
  testID="email-input"
/>
```

## Focus Management

### Tab Order
The app implements logical tab order for keyboard navigation:
1. Email input
2. Password input
3. Submit button
4. Navigation links

### Focus Indicators
- Clear visual focus indicators for all interactive elements
- High contrast focus rings that meet accessibility standards
- Focus management for dynamic content updates

## Screen Reader Announcements

### Loading States
```typescript
announceLoading('hostels');     // "Loading available hostels"
announceLoading('search');      // "Searching for hostels"
announceLoading('details');     // "Loading hostel details"
```

### Success States
```typescript
announceSuccess('login');       // "Successfully signed in"
announceSuccess('signup');      // "Account created successfully"
announceSuccess('profileUpdate'); // "Profile updated successfully"
```

### Error States
```typescript
announceError('loginFailed');   // "Sign in failed, please check your credentials"
announceError('networkError');  // "Network error, please check your connection"
announceError('generalError');  // "An error occurred, please try again"
```

### Navigation
```typescript
announceNavigation('screenLoaded'); // "Screen loaded"
announceNavigation('tabChanged');    // "Tab changed"
announceNavigation('screenChanged'); // "Screen changed"
```

## Testing Accessibility

### Automated Testing
```typescript
// Test accessibility attributes
expect(spinner.props.accessible).toBe(true);
expect(spinner.props.accessibilityRole).toBe('progressbar');
expect(spinner.props.accessibilityLabel).toBe(ACCESSIBILITY_LABELS.actions.loadingSpinner);
```

### Manual Testing
1. **iOS VoiceOver Testing**
   - Enable VoiceOver in iOS Settings
   - Navigate through the app using VoiceOver gestures
   - Verify all content is properly announced

2. **Android TalkBack Testing**
   - Enable TalkBack in Android Accessibility Settings
   - Test navigation and content announcements
   - Verify focus management works correctly

3. **Color Contrast Testing**
   - Use tools like WebAIM's Color Contrast Checker
   - Verify all text meets minimum contrast requirements
   - Test with color blindness simulators

## Accessibility Hook

### useAccessibility Hook
The app provides a custom hook for managing accessibility features:

```typescript
const { 
  announceToScreenReader,
  announceLoading,
  announceSuccess,
  announceError,
  focusElement,
  isScreenReaderEnabled 
} = useAccessibility();
```

### Usage Examples
```typescript
// Announce loading state
announceLoading('hostels');

// Focus on specific element
focusElement(emailInputRef);

// Check if screen reader is enabled
const enabled = await isScreenReaderEnabled();
```

## Best Practices

### Content Structure
- Use semantic HTML structure with proper heading hierarchy
- Provide clear, descriptive labels for all interactive elements
- Include alternative text for images and icons
- Use proper ARIA landmarks and regions

### User Experience
- Ensure all functionality is accessible via keyboard
- Provide multiple ways to navigate and access content
- Test with actual assistive technology users
- Include accessibility in design reviews and testing

### Performance
- Optimize screen reader announcements to avoid overwhelming users
- Use appropriate announcement timing for dynamic content
- Ensure accessibility features don't impact app performance

## Maintenance

### Regular Audits
- Conduct monthly accessibility audits
- Test with new screen reader versions
- Update accessibility features based on user feedback
- Monitor accessibility compliance in CI/CD pipeline

### Code Reviews
- Include accessibility checks in pull request reviews
- Verify all new components have proper accessibility attributes
- Test accessibility features before merging code
- Document accessibility requirements for new features

## Resources

### WCAG Guidelines
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/AA/)
- [Mobile Accessibility Guidelines](https://www.w3.org/WAI/mobile/)

### Testing Tools
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe-core for React Native](https://github.com/dequelabs/axe-core)
- [iOS Accessibility Inspector](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXTestingApps.html)

### Documentation
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [iOS Accessibility Programming Guide](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/Introduction/Introduction.html)
- [Android Accessibility Developer Guide](https://developer.android.com/guide/topics/ui/accessibility)

## Support

For accessibility-related issues or questions:
1. Check this documentation first
2. Review the accessibility test suite
3. Test with actual assistive technologies
4. Consult with accessibility experts if needed
5. Report issues through the project's issue tracker

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: Development Team
