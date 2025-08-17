// Export all type definitions
export * from './auth';
export * from './hostel';
export * from './api';
export * from './navigation';
export * from './error';
export * from './database';

// Common utility types
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchFilters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  amenities?: string[];
  sortBy?: 'price' | 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
  rules: ValidationRule[];
}

export interface FormState {
  [key: string]: FormField;
}

// App configuration types
export interface AppConfig {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    analytics: boolean;
    notifications: boolean;
    maps: boolean;
  };
}