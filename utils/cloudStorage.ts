/**
 * LexiMix - Hybrid Cloud Storage System
 * Primär: IONOS Server, Fallback: Firebase Realtime DB
 */

import { UserState } from '../types';

// API Endpoints
const IONOS_API = 'https://leximix.de/api';
const IONOS_SAVE = `${IONOS_API}/save.php`;
const IONOS_LOAD = `${IONOS_API}/load.php`;

// Offline Queue für fehlgeschlagene Saves
interface QueuedSave {
  username: string;
  data: any;
  timestamp: number;
  retries: number;
}

let offlineQueue: QueuedSave[] = [];
let isProcessingQueue = false;

// Lade Queue aus localStorage
const loadOfflineQueue = (): void => {
  try {
    const stored = localStorage.getItem('leximix_offline_queue');
    if (stored) {
      offlineQueue = JSON.parse(stored);
    }
  } catch (e) {
    console.error('[CloudStorage] Failed to load offline queue:', e);
    offlineQueue = [];
  }
};

// Speichere Queue in localStorage
const saveOfflineQueue = (): void => {
  try {
    localStorage.setItem('leximix_offline_queue', JSON.stringify(offlineQueue));
  } catch (e) {
    console.error('[CloudStorage] Failed to save offline queue:', e);
  }
};

// Normalisiere Username (konsistent mit Firebase)
export const normalizeUsername = (username: string): string => {
  return username.replace(/\s+/g, '').toLowerCase();
};

// Version tracking
let currentVersion = 0;

/**
 * Speichert Benutzerdaten - Primär IONOS, Fallback Firebase
 */
export const saveUserData = async (
  username: string,
  userData: Partial<UserState>
): Promise<{ success: boolean; error?: string; version?: number }> => {
  const normalizedUsername = normalizeUsername(username);
  const timestamp = Date.now();

  // Daten für API vorbereiten
  const payload = {
    username: normalizedUsername,
    data: {
      ...userData,
      lastSaved: timestamp,
    },
    version: currentVersion,
    timestamp,
  };

  try {
    // 1. Versuche IONOS Server
    const response = await fetch(IONOS_SAVE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      currentVersion = result.version || currentVersion + 1;
      console.log('[CloudStorage] IONOS save successful, version:', currentVersion);
      
      // Auch zu Firebase als Backup speichern (async, nicht blockierend)
      saveToFirebaseBackup(normalizedUsername, userData).catch(e => 
        console.warn('[CloudStorage] Firebase backup failed:', e)
      );
      
      return { success: true, version: currentVersion };
    }

    // Konflikt-Handling
    if (response.status === 409) {
      console.warn('[CloudStorage] Conflict detected:', result);
      return { 
        success: false, 
        error: 'conflict',
        version: result.serverVersion 
      };
    }

    throw new Error(result.error || 'IONOS save failed');

  } catch (error: any) {
    console.warn('[CloudStorage] IONOS failed, trying Firebase:', error.message);

    // 2. Fallback zu Firebase
    try {
      const firebaseResult = await saveToFirebaseBackup(normalizedUsername, userData);
      if (firebaseResult) {
        return { success: true };
      }
    } catch (fbError) {
      console.error('[CloudStorage] Firebase fallback also failed:', fbError);
    }

    // 3. Offline? Ab in die Queue
    if (!navigator.onLine) {
      addToOfflineQueue(normalizedUsername, userData, timestamp);
      return { success: true, error: 'queued' };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Lädt Benutzerdaten - Vergleicht IONOS und Firebase, nimmt neuere Version
 */
export const loadUserData = async (
  username: string
): Promise<{ success: boolean; data: any | null; source?: string; error?: string }> => {
  const normalizedUsername = normalizeUsername(username);

  let ionosData: any = null;
  let ionosTimestamp = 0;
  let firebaseData: any = null;
  let firebaseTimestamp = 0;

  // 1. Versuche IONOS
  try {
    const response = await fetch(`${IONOS_LOAD}?username=${encodeURIComponent(normalizedUsername)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success && result.exists && result.data) {
      ionosData = result.data;
      ionosTimestamp = result.timestamp || result.data.lastSaved || 0;
      currentVersion = result.version || 0;
      console.log('[CloudStorage] IONOS load successful, timestamp:', ionosTimestamp);
    }
  } catch (error) {
    console.warn('[CloudStorage] IONOS load failed:', error);
  }

  // 2. Lade auch von Firebase zum Vergleich
  try {
    firebaseData = await loadFromFirebaseBackup(normalizedUsername);
    if (firebaseData) {
      firebaseTimestamp = firebaseData.lastSaved || 0;
      console.log('[CloudStorage] Firebase load successful, timestamp:', firebaseTimestamp);
    }
  } catch (error) {
    console.warn('[CloudStorage] Firebase load failed:', error);
  }

  // 3. Entscheide welche Daten neuer sind
  if (ionosData && firebaseData) {
    if (ionosTimestamp >= firebaseTimestamp) {
      console.log('[CloudStorage] Using IONOS data (newer or equal)');
      return { success: true, data: ionosData, source: 'ionos' };
    } else {
      console.log('[CloudStorage] Using Firebase data (newer)');
      // Firebase ist neuer - sync zu IONOS
      saveUserData(normalizedUsername, firebaseData).catch(e =>
        console.warn('[CloudStorage] Failed to sync Firebase to IONOS:', e)
      );
      return { success: true, data: firebaseData, source: 'firebase' };
    }
  }

  if (ionosData) {
    return { success: true, data: ionosData, source: 'ionos' };
  }

  if (firebaseData) {
    return { success: true, data: firebaseData, source: 'firebase' };
  }

  // Keine Daten gefunden
  return { success: true, data: null };
};

/**
 * Firebase Backup - Speichern
 */
const saveToFirebaseBackup = async (username: string, userData: any): Promise<boolean> => {
  try {
    const { saveToCloud } = await import('./firebase');
    return await saveToCloud(username, userData);
  } catch (error) {
    console.error('[CloudStorage] Firebase backup save error:', error);
    return false;
  }
};

/**
 * Firebase Backup - Laden
 */
const loadFromFirebaseBackup = async (username: string): Promise<any | null> => {
  try {
    const { loadFromCloud } = await import('./firebase');
    return await loadFromCloud(username);
  } catch (error) {
    console.error('[CloudStorage] Firebase backup load error:', error);
    return null;
  }
};

/**
 * Offline Queue Management
 */
const addToOfflineQueue = (username: string, data: any, timestamp: number): void => {
  // Entferne alte Einträge für denselben User
  offlineQueue = offlineQueue.filter(q => q.username !== username);
  
  offlineQueue.push({
    username,
    data,
    timestamp,
    retries: 0,
  });
  
  saveOfflineQueue();
  console.log('[CloudStorage] Added to offline queue');
};

/**
 * Verarbeite Offline Queue wenn wieder online
 */
export const processOfflineQueue = async (): Promise<void> => {
  if (isProcessingQueue || offlineQueue.length === 0) return;
  if (!navigator.onLine) return;

  isProcessingQueue = true;
  console.log('[CloudStorage] Processing offline queue:', offlineQueue.length, 'items');

  const queue = [...offlineQueue];
  offlineQueue = [];

  for (const item of queue) {
    try {
      const result = await saveUserData(item.username, item.data);
      if (!result.success && result.error !== 'conflict') {
        // Zurück in die Queue wenn fehlgeschlagen (max 3 Versuche)
        if (item.retries < 3) {
          offlineQueue.push({ ...item, retries: item.retries + 1 });
        }
      }
    } catch (error) {
      console.error('[CloudStorage] Queue item failed:', error);
      if (item.retries < 3) {
        offlineQueue.push({ ...item, retries: item.retries + 1 });
      }
    }
  }

  saveOfflineQueue();
  isProcessingQueue = false;
};

/**
 * Force Sync - Erzwingt sofortige Synchronisation
 */
export const forceSync = async (username: string, userData: any): Promise<boolean> => {
  const result = await saveUserData(username, userData);
  return result.success;
};

/**
 * Initialisierung - Queue laden und Online-Listener registrieren
 */
export const initCloudStorage = (): void => {
  loadOfflineQueue();
  
  // Online-Event: Queue verarbeiten
  window.addEventListener('online', () => {
    console.log('[CloudStorage] Back online - processing queue');
    processOfflineQueue();
  });

  // Visibility-Event: Sync bei Tab-Fokus
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      processOfflineQueue();
    }
  });

  // Initial Queue verarbeiten falls online
  if (navigator.onLine) {
    processOfflineQueue();
  }
};

// Auto-Init
if (typeof window !== 'undefined') {
  initCloudStorage();
}

export default {
  saveUserData,
  loadUserData,
  forceSync,
  processOfflineQueue,
  normalizeUsername,
};
