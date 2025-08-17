export interface User {
  id: string;
  email: string;
  role: 'student' | 'landlord';
  name?: string;
  phone?: string;
  profile_picture_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  role: 'student' | 'landlord';
  name?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
  message?: string;
}