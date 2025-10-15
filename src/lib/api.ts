const N8N_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5678';

export interface ProcessDataRequest {
  csvContent?: string;
  cities?: Array<{
    city: string;
    state: string;
    country: string;
    region?: string;
    search_query?: string;
  }>;
  city?: string;
  region?: string;
  state?: string;
  country?: string;
  search_query?: string;
  command?: string;
}

export interface ProcessDataResponse {
  success: boolean;
  message: string;
  total_cities?: number;
  processed?: number;
}

export interface CoworkingSpace {
  id: number;
  session_id: string;
  place_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  category?: string;
  rating?: number;
  reviews_count?: number;
  open_state?: string;
  operating_hours?: string;
  wheelchair_accessible: boolean;
  lgbtq_friendly: boolean;
  women_owned: boolean;
  gender_neutral_toilets: boolean;
  online_appointments: boolean;
  onsite_services: boolean;
  thumbnail?: string;
  amenities?: string;
  accessibility_features?: string;
  parking_options?: string;
  crowd_info?: string;
  from_business?: string;
  search_timestamp: string;
}

export const api = {
  processData: async (data: ProcessDataRequest): Promise<ProcessDataResponse> => {
    const response = await fetch(`${N8N_BASE_URL}/webhook-test/map-data-master`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Processing failed' }));
      throw new Error(error.message || 'Processing failed');
    }
    return response.json();
  },

  fetchSpaces: async (): Promise<CoworkingSpace[]> => {
    const response = await fetch(`${N8N_BASE_URL}/webhook-test/fetch-sheets-data`);
    if (!response.ok) throw new Error('Failed to fetch spaces');
    return response.json();
  },

  removeDuplicates: async (placeIds: string[]): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${N8N_BASE_URL}/webhook-test/duplicate-remover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idsToRemove: placeIds })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove duplicates' }));
      throw new Error(error.message || 'Failed to remove duplicates');
    }
    return response.json();
  }
};
