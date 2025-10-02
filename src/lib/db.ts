import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CoworkingSpace, UploadMetadata } from '@/types/coworking';

interface CoworkingDB extends DBSchema {
  spaces: {
    key: string;
    value: CoworkingSpace & { uploadId: string };
    indexes: { 
      'by-city': string; 
      'by-country': string; 
      'by-upload': string;
      'by-place-id': string;
    };
  };
  uploads: {
    key: string;
    value: UploadMetadata;
    indexes: { 'by-timestamp': Date };
  };
}

let dbInstance: IDBPDatabase<CoworkingDB> | null = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<CoworkingDB>('coworking-db', 1, {
    upgrade(db) {
      // Create spaces store
      if (!db.objectStoreNames.contains('spaces')) {
        const spacesStore = db.createObjectStore('spaces', { keyPath: 'place_id' });
        spacesStore.createIndex('by-city', 'city');
        spacesStore.createIndex('by-country', 'country');
        spacesStore.createIndex('by-upload', 'uploadId');
        spacesStore.createIndex('by-place-id', 'place_id');
      }

      // Create uploads store
      if (!db.objectStoreNames.contains('uploads')) {
        const uploadsStore = db.createObjectStore('uploads', { keyPath: 'id' });
        uploadsStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

export async function saveSpaces(spaces: CoworkingSpace[], uploadId: string) {
  const db = await getDB();
  const tx = db.transaction('spaces', 'readwrite');
  
  await Promise.all(
    spaces.map((space) =>
      tx.store.put({ ...space, uploadId })
    )
  );

  await tx.done;
}

export async function saveUpload(metadata: UploadMetadata) {
  const db = await getDB();
  await db.put('uploads', metadata);
}

export async function getAllSpaces(): Promise<(CoworkingSpace & { uploadId: string })[]> {
  const db = await getDB();
  return db.getAll('spaces');
}

export async function getSpacesByCity(city: string): Promise<(CoworkingSpace & { uploadId: string })[]> {
  const db = await getDB();
  return db.getAllFromIndex('spaces', 'by-city', city);
}

export async function getSpacesByCountry(country: string): Promise<(CoworkingSpace & { uploadId: string })[]> {
  const db = await getDB();
  return db.getAllFromIndex('spaces', 'by-country', country);
}

export async function getLatestUpload(): Promise<UploadMetadata | undefined> {
  const db = await getDB();
  const uploads = await db.getAllFromIndex('uploads', 'by-timestamp');
  return uploads[uploads.length - 1];
}

export async function getAllUploads(): Promise<UploadMetadata[]> {
  const db = await getDB();
  return db.getAll('uploads');
}

export async function clearAllData() {
  const db = await getDB();
  await db.clear('spaces');
  await db.clear('uploads');
}
