export type PropertyStatus = "active" | "pending" | "sold";

/** Serializable property shape passed from Server to Client Components. */
export interface PropertyDTO {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lat: number;
  lng: number;
  imageUrls: string[];
  featured: boolean;
  status: PropertyStatus;
  agentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredDate: string | null;
  propertyId: string;
  propertyTitle: string | null;
  propertyCity: string | null;
  createdAt: string;
}

export type PropertySort = "newest" | "price-asc" | "price-desc" | "size-desc";

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  sort?: PropertySort;
}
