/**
 * LexiMix - Cloud Storage System
 * IONOS Server only
 */

import { UserState } from '../types';

// API Endpoints
const IONOS_API = 'http://leximix.de/api';
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
    console.error('[CloudStorage] Save failed:', error.message);

    // Offline? Ab in die Queue
    if (!navigator.onLine) {
      addToOfflineQueue(normalizedUsername, userData, timestamp);
      return { success: true, error: 'queued' };
    }

    return { success: false, error: error.message };
  }
};

/**
 * Lädt Benutzerdaten von IONOS Server
 */
export const loadUserData = async (
  username: string
): Promise<{ success: boolean; data: any | null; source?: string; error?: string }> => {
  const normalizedUsername = normalizeUsername(username);

  try {
    const response = await fetch(`${IONOS_LOAD}?username=${encodeURIComponent(normalizedUsername)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success && result.exists && result.data) {
      currentVersion = result.version || 0;
      console.log('[CloudStorage] IONOS load successful');
      return { success: true, data: result.data, source: 'ionos' };
    }

    // Keine Daten gefunden
    return { success: true, data: null, source: 'ionos' };
  } catch (error: any) {
    console.error('[CloudStorage] Load failed:', error);
    return { success: false, data: null, error: error.message };
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
