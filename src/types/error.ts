// Error types and handling utilities
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

// Base error class
export class BaseAppError extends Error implements AppError {
  code: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;

  constructor(message: string, code: string, details?: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
    this.context = context;
  }
}

// Network error class
export class NetworkError extends BaseAppError {
  statusCode?: number;
  retryable: boolean;

  constructor(message: string, statusCode?: number, retryable = true) {
    super(message, 'NETWORK_ERROR');
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

// API error class
export class APIError extends BaseAppError {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  statusCode?: number;

  constructor(message: string, statusCode?: number, endpoint?: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE') {
    super(message, 'API_ERROR');
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.method = method;
  }
}

// Validation error class
export class ValidationError extends BaseAppError {
  field?: string;
  value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message, 'VALIDATION_ERROR');
    this.field = field;
    this.value = value;
  }
}

// Auth error class
export class AuthError extends BaseAppError {
  type: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'UNAUTHORIZED' | 'SIGNUP_FAILED';

  constructor(message: string, type: 'INVALID_CREDENTIALS' | 'TOKEN_EXPIRED' | 'UNAUTHORIZED' | 'SIGNUP_FAILED') {
    super(message, 'AUTH_ERROR');
    this.type = type;
  }
}

// Database error class
export class DatabaseError extends BaseAppError {
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  table?: string;

  constructor(message: string, operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE', table?: string) {
    super(message, 'DATABASE_ERROR');
    this.operation = operation;
    this.table = table;
  }
}

// Error handling utility types
export type ErrorHandler = (error: AppError) => void;

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

// Error recovery actions
export type ErrorRecoveryAction = 
  | { type: 'RETRY' }
  | { type: 'DISMISS' }
  | { type: 'LOGOUT' }
  | { type: 'NAVIGATE'; screen: string }
  | { type: 'REFRESH' };

export interface ErrorState {
  errors: AppError[];
  isRetrying: boolean;
  retryCount: number;
}