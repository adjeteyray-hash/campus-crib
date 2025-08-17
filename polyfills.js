// Polyfills for React Native/Hermes
// This file provides Node.js compatibility for packages that expect Node.js globals

// Import early polyfills first to ensure util.inherits is available
import './src/config/polyfills';

import { Buffer } from 'buffer';
import process from 'process';

// Polyfill Buffer globally
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Polyfill process globally
if (typeof global.process === 'undefined') {
  global.process = process;
}

// Ensure util object exists
if (typeof global.util === 'undefined') {
  global.util = {};
}

// Import inherits function
import inherits from 'inherits';

// Set up util.inherits correctly - this is the main fix for the "util.inherits is not a function" error
global.util.inherits = inherits;

// Also set it directly on global for packages that might access it differently
global.inherits = inherits;

// Ensure other common Node.js globals are available
if (typeof global.global === 'undefined') {
  global.global = global;
}

// Polyfill console methods if they're missing (for older React Native versions)
if (typeof console === 'undefined') {
  global.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
  };
}

// Additional polyfills for common Node.js modules
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

if (typeof global.clearImmediate === 'undefined') {
  global.clearImmediate = (id) => clearTimeout(id);
}

// Verify that util.inherits is properly set
if (typeof global.util.inherits !== 'function') {
  console.warn('⚠️ util.inherits not properly set, using fallback implementation');
  // Fallback implementation
  global.util.inherits = function inherits(ctor, superCtor) {
    if (ctor === undefined || ctor === null)
      throw new TypeError('The constructor to "inherits" must not be null or undefined');
    if (superCtor === undefined || superCtor === null)
      throw new TypeError('The super constructor to "inherits" must not be null or undefined');
    if (superCtor.prototype === undefined)
      throw new TypeError('The super constructor to "inherits" must have a prototype');
    ctor.super_ = superCtor;
    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  };
}

console.log('✅ Polyfills loaded successfully');
console.log('✅ util.inherits available:', typeof global.util.inherits);
console.log('✅ global.inherits available:', typeof global.inherits);
