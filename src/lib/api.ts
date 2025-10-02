const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface UploadResponse {
  success: boolean;
  session_id: string;
  message: string;
  total_cities: number;
}

export interface UploadStatus {
  session_id: string;
  filename: string;
  status: 'processing' | 'completed' | 'failed';
  upload_timestamp: string;
  completed_timestamp?: string | null;
  total_cities: number;
  current_records: number;
  total_records: number;
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
  uploadCSV: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    return response.json();
  },

  getUploadStatus: async (sessionId: string): Promise<UploadStatus> => {
    const response = await fetch(`${API_BASE_URL}/api/upload/status/${sessionId}`);
    if (!response.ok) throw new Error('Status check failed');
    return response.json();
  },

  getAllSpaces: async (sessionId?: string): Promise<CoworkingSpace[]> => {
    const url = sessionId 
      ? `${API_BASE_URL}/api/spaces?session_id=${sessionId}&limit=5000`
      : `${API_BASE_URL}/api/spaces?limit=5000`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch spaces');
    return response.json();
  },

  getUploadHistory: async (): Promise<UploadStatus[]> => {
    const response = await fetch(`${API_BASE_URL}/api/uploads/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  }
};
