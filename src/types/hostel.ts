export interface Hostel {
  id: string;
  name: string;
  description?: string;
  address: string;
  price: number;
  amenities: string[];
  images: string[];
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  landlordId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  profilePictureUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
  hostelId: string;
}

export interface HostelDetail extends Hostel {
  landlord?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  viewCount?: number;
  contactCount?: number;
  reviews?: Review[];
}

export interface BookingHistoryEntry {
  id: string;
  studentId: string;
  hostelId: string;
  hostelName: string;
  action: 'viewed' | 'contacted';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsData {
  hostelId: string;
  hostelName: string;
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
  ranking: number;
  trendData: {
    date: string;
    views: number;
    contacts: number;
  }[];
}

// Additional hostel-related types
export interface HostelFormData {
  name: string;
  description: string;
  address: string;
  price: number;
  amenities: string[];
  images: File[] | string[];
  contactPhone: string;
  contactEmail: string;
}

export interface HostelFilters {
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  amenities?: string[];
  sortBy?: 'price' | 'name' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface HostelSearchResult extends Hostel {
  relevanceScore?: number;
  distance?: number;
}
