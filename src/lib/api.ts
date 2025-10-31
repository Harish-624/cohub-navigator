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
  row_number: number;
  position: number;
  name: string;
  place_id: string;
  address: string;
  city: string;
  state: string;
  country: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews?: number;
  phone?: string;
  website?: string;
  category?: string;
  accessibility_features?: string;
  amenities?: string;
  parking_options?: string;
  crowd_info?: string;
  from_business?: string;
  operating_hours?: string;
  open_state?: string;
  thumbnail?: string;
}

export const api = {
  processData: async (data: ProcessDataRequest): Promise<ProcessDataResponse> => {
    const response = await fetch(`${N8N_BASE_URL}/webhook/map-data-master`, {
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
    const response = await fetch(`${N8N_BASE_URL}/webhook/fetch-sheets-data`);
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
