// Early polyfills configuration
// This file ensures critical polyfills are loaded before any other imports

// Import inherits early to ensure it's available
import inherits from 'inherits';

// Set up util.inherits immediately
if (typeof global.util === 'undefined') {
  global.util = {};
}

// Ensure util.inherits is available
global.util.inherits = inherits;

// Also set it globally for packages that might access it directly
global.inherits = inherits;

// Export for use in other parts of the app
export { inherits };

console.log('🚀 Early polyfills loaded - util.inherits available:', typeof global.util.inherits);
