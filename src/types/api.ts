// Hostel API UCC response types
export interface HostelAPIResponse {
  success: boolean;
  data: HostelAPIHostel[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface HostelAPIHostel {
  id: string;
  name: string;
  description?: string;
  address: string;
  price: number;
  amenities: string[];
  images: string[];
  contact_phone?: string;
  contact_email?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface HostelAPIDetailResponse {
  success: boolean;
  data: HostelAPIHostel;
  message?: string;
}

export interface HostelAPISearchResponse extends HostelAPIResponse {
  query: string;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    amenities?: string[];
  };
}

// Generic API response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Supabase response types
export interface SupabaseResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}