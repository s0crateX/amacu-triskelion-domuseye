export interface Property {
  id: string;
  area: number;
  available: boolean;
  images: string[];
  title: string;
  category: string;
  datePosted: string;
  price: string;
  location: string; // postal code
  amenities: string[];
  beds: number;
  baths: number;
  sqft: number;
  features: string[];
  isNew?: boolean;
  isVerified?: boolean;
  type: string;
  uid: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  landlord: string[];
  subtype: string;
  kitchen: string;
  parking: number;
  landlordId: string;
  landlordName: string;
  views: number;
  // Legacy field for backward compatibility
  image?: string;
  // Additional fields for internal use
  inquiries?: number;
  tenant?: string | null;
  status?: 'Available' | 'Occupied';
  rating?: number;
}

export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  address: string;
  price: string;
  beds: string;
  baths: string;
  parking: string;
  sqft: string;
  type: string;
  category: string;
  subtype: string;
  kitchen: string;
  features: string[];
  images: string[];
  latitude: number;
  longitude: number;
}