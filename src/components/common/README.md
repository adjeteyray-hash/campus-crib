# Error Handling and Loading Components

This directory contains comprehensive error handling and loading state components for the CampusCrib mobile app.

## Components

### ErrorBoundary
A React error boundary component that catches JavaScript errors anywhere in the child component tree.

**Features:**
- Catches and logs JavaScript errors
- Provides retry functionality (up to 3 attempts)
- Customizable fallback UI
- Error reporting integration ready

**Usage:**
```tsx
import { ErrorBoundary } from '../components/common';

<ErrorBoundary onError={(error) => console.log(error)}>
  <YourComponent />
</ErrorBoundary>
```

### LoadingSpinner
A flexible loading spinner component with multiple display options.

**Features:**
- Customizable size and color
- Optional loading message
- Overlay mode for modal-like loading
- Full-screen or inline display

**Usage:**
```tsx
import { LoadingSpinner } from '../components/common';

<LoadingSpinner 
  message="Loading data..." 
  overlay={true}
  size="large"
  color="#007AFF"
/>
```

### OfflineBanner
A banner component that displays when the device is offline.

**Features:**
- Automatic network status detection
- Customizable display conditions
- Minimal, non-intrusive design

**Usage:**
```tsx
import { OfflineBanner } from '../components/common';

<OfflineBanner showWhenOffline={true} />
```

### ErrorDisplay
A user-friendly error display component with action buttons.

**Features:**
- Automatic error message formatting
- Retry and dismiss actions
- Customizable styling
- Accessibility compliant

**Usage:**
```tsx
import { ErrorDisplay } from '../components/common';

<ErrorDisplay
  error={error}
  onRetry={() => retryOperation()}
  onDismiss={() => dismissError()}
  showDismiss={true}
/>
```

## Hooks

### useErrorHandler
A comprehensive hook for managing error states and recovery actions.

**Features:**
- Error logging and tracking
- Retry logic with limits
- Recovery action execution
- Network-aware error handling

**Usage:**
```tsx
import { useErrorHandler } from '../hooks';

const { error, handleError, retry, dismiss } = useErrorHandler({
  maxRetries: 3,
  onError: (err) => console.log('Error:', err),
  onRecovery: () => console.log('Recovered'),
});
```

### useLoadingState
A hook for managing multiple loading states efficiently.

**Features:**
- Multiple concurrent loading states
- Automatic loading state management
- Promise-based operations
- State reset functionality

**Usage:**
```tsx
import { useLoadingState } from '../hooks';

const { isLoading, withLoading, setLoading } = useLoadingState();

// Use with async operations
await withLoading('fetch', async () => {
  const data = await fetchData();
  return data;
});

// Check loading state
if (isLoading('fetch')) {
  return <LoadingSpinner />;
}
```

### useNetworkStatus
A hook for monitoring network connectivity status.

**Features:**
- Real-time network status updates
- Connection type detection
- Internet reachability checking
- WiFi status monitoring

**Usage:**
```tsx
import { useNetworkStatus } from '../hooks';

const networkStatus = useNetworkStatus();

if (!networkStatus.isConnected) {
  return <OfflineBanner />;
}
```

## Error Handling Utilities

### Error Types
The system includes specialized error classes:
- `NetworkError` - Network connectivity issues
- `APIError` - API response errors
- `AuthError` - Authentication failures
- `ValidationError` - Input validation errors
- `DatabaseError` - Database operation errors

### Retry Logic
```tsx
import { withRetry, withNetworkRetry } from '../utils/errorHandling';

// Basic retry with exponential backoff
const result = await withRetry(
  () => apiCall(),
  { maxRetries: 3, baseDelay: 1000 }
);

// Network-aware retry
const result = await withNetworkRetry(
  () => apiCall(),
  { maxRetries: 2, baseDelay: 500 }
);
```

### Graceful Degradation
```tsx
import { withGracefulDegradation } from '../utils/errorHandling';

const result = await withGracefulDegradation(
  () => fetchFromAPI(),
  () => getCachedData(),
  (error) => error.code === 'NETWORK_ERROR'
);
```

## Integration Example

See `src/examples/ErrorHandlingExample.tsx` for a complete integration example showing how to use all components and hooks together.

## Testing

All components and hooks include comprehensive unit tests:
- Component rendering and interaction tests
- Hook behavior and state management tests
- Error handling and recovery tests
- Network status simulation tests

Run tests with:
```bash
npm test -- --testPathPattern="ErrorBoundary|LoadingSpinner|ErrorDisplay|useErrorHandler|useLoadingState|useNetworkStatus"
```

## Best Practices

1. **Always wrap your app in ErrorBoundary** at the root level
2. **Use specific error types** for better error handling
3. **Implement retry logic** for transient failures
4. **Provide fallback data** when possible
5. **Show loading states** for better UX
6. **Handle offline scenarios** gracefully
7. **Log errors** for debugging and monitoring