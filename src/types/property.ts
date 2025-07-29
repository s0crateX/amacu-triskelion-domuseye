export interface Property {
  id: string;
  available: boolean;
  image: string;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  features: string[];
  isNew?: boolean;
  isVerified?: boolean;
  type: string;
  uid: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  images: string[];
  landlord: string[];
  subtype: string;
  kitchen: string;
  parking: number;
  landlordId: string;
  landlordName: string;
  // Additional fields for internal use
  datePosted?: string;
  views?: number;
  inquiries?: number;
  tenant?: string | null;
  status?: 'Available' | 'Occupied';
  amenities?: string[];
  area?: number;
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