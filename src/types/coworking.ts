export interface CoworkingSpace {
  position?: number;
  name: string;
  place_id?: string;
  data_id?: string;
  data_cid?: string;
  provider_id?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  city: string;
  state?: string;
  country: string;
  region?: string;
  phone?: string;
  website?: string;
  category?: string;
  types?: string;
  type_id?: string;
  type_ids?: string;
  rating?: number;
  reviews?: number;
  user_review?: string;
  reviews_link?: string;
  open_state?: string;
  hours?: string;
  operating_hours?: string;
  accessibility_features?: string;
  amenities?: string;
  parking_options?: string;
  crowd_info?: string;
  from_business?: string;
  thumbnail?: string;
  serpapi_thumbnail?: string;
  photos_link?: string;
  search_query?: string;
  search_timestamp?: string;
}

export interface UploadMetadata {
  id: string;
  filename: string;
  timestamp: Date;
  recordCount: number;
  processingTime: number;
  status: 'success' | 'processing' | 'failed';
}

export interface CityData {
  city: string;
  state?: string;
  country: string;
  region?: string;
  spaces: CoworkingSpace[];
  totalSpaces: number;
}

export interface CountryData {
  country: string;
  states: StateData[];
  totalStates: number;
  totalCities: number;
  totalSpaces: number;
}

export interface StateData {
  state: string;
  country: string;
  cities: CityData[];
  totalCities: number;
  totalSpaces: number;
}

export interface DashboardStats {
  totalSpaces: number;
  totalCities: number;
  totalCountries: number;
  averageRating: number;
  spacesWithHighRating: number;
  spacesCurrentlyOpen: number;
  wheelchairAccessible: number;
  womenOwned: number;
  lgbtqFriendly: number;
  topCities: Array<{ city: string; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
}
