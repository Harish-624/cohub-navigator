import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CoworkingSpace, UploadMetadata } from '@/types/coworking';
import { getAllSpaces, getLatestUpload } from '@/lib/db';
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
      const [spacesData, uploadData] = await Promise.all([
        getAllSpaces(),
        getLatestUpload()
      ]);
      setSpaces(spacesData);
      setLastUpload(uploadData || null);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data from storage',
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
