// Database table types that match Supabase schema

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      hostels: {
        Row: HostelRow;
        Insert: HostelInsert;
        Update: HostelUpdate;
      };
      booking_history: {
        Row: BookingHistoryRow;
        Insert: BookingHistoryInsert;
        Update: BookingHistoryUpdate;
      };
    };
  };
}

// Profile table types
export interface ProfileRow {
  id: string;
  email: string;
  role: 'student' | 'landlord';
  name: string | null;
  phone: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  role: 'student' | 'landlord';
  name?: string;
  phone?: string;
  profile_picture_url?: string;
}

export interface ProfileUpdate {
  email?: string;
  role?: 'student' | 'landlord';
  name?: string;
  phone?: string;
  profile_picture_url?: string;
  updated_at?: string;
}

// Hostel table types
export interface HostelRow {
  id: string;
  landlord_id: string;
  name: string;
  description: string | null;
  address: string;
  price: number;
  amenities: string[];
  images: string[];
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HostelInsert {
  landlord_id: string;
  name: string;
  description?: string;
  address: string;
  price: number;
  amenities?: string[];
  images?: string[];
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
}

export interface HostelUpdate {
  name?: string;
  description?: string;
  address?: string;
  price?: number;
  amenities?: string[];
  images?: string[];
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
  updated_at?: string;
}

// Booking history table types
export interface BookingHistoryRow {
  id: string;
  student_id: string;
  hostel_id: string; // TEXT field that can store UUID as string or external API IDs
  hostel_name: string;
  action: 'viewed' | 'contacted';
  timestamp: string;
  metadata: Record<string, unknown> | null;
}

export interface BookingHistoryInsert {
  student_id: string;
  hostel_id: string; // TEXT field that can store UUID as string or external API IDs
  hostel_name: string;
  action: 'viewed' | 'contacted';
  metadata?: Record<string, unknown>;
}

export interface BookingHistoryUpdate {
  hostel_name?: string;
  action?: 'viewed' | 'contacted';
  metadata?: Record<string, unknown>;
}

// RLS Policy types
export interface RLSPolicy {
  name: string;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  using?: string;
  with_check?: string;
}