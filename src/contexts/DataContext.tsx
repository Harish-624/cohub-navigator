import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoworkingSpace, UploadMetadata } from '@/types/coworking';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DataContextType {
  spaces: CoworkingSpace[];
  lastUpload: UploadMetadata | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [spaces, setSpaces] = useState<CoworkingSpace[]>([]);
  const [lastUpload, setLastUpload] = useState<UploadMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshData = async () => {
    try {
      setLoading(true);
      const spacesData = await api.fetchSpaces();
      setSpaces(spacesData);
      
      // Set last upload timestamp based on most recent data
      if (spacesData.length > 0) {
        const timestamps = spacesData
          .map(s => s.search_timestamp ? new Date(s.search_timestamp) : null)
          .filter((d): d is Date => d !== null && !isNaN(d.getTime()));
        
        if (timestamps.length > 0) {
          const latestTimestamp = new Date(Math.max(...timestamps.map(d => d.getTime())));
          setLastUpload({
            id: 'api-fetch',
            filename: 'Google Sheets API',
            timestamp: latestTimestamp,
            recordCount: spacesData.length,
            processingTime: 0,
            status: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data from API',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider value={{ spaces, lastUpload, loading, refreshData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
