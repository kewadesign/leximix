import { initializeApp } from "firebase/app";
// KW1998 - Firebase Integration
import { getDatabase, ref, set, get, child } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBP8-tGq9Gh-8vvCuBWHYB8CtoMVpfKKkw",
    authDomain: "leximix-aecac.firebaseapp.com",
    databaseURL: "https://leximix-aecac-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "leximix-aecac",
    storageBucket: "leximix-aecac.firebasestorage.app",
    messagingSenderId: "1008517795796",
    appId: "1:1008517795796:web:ae108267f370e334371041",
    measurementId: "G-0Y8H3X9Z7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Simple hash function (NOT secure for production)
const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
};

// Rate Limiting
let lastRequestTime = 0;
const REQUEST_COOLDOWN = 2000; // 2 seconds

const checkRateLimit = (): boolean => {
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_COOLDOWN) {
        return false;
    }
    lastRequestTime = now;
    return true;
};

// Helper to normalize usernames (prevent duplicates like "User" vs "user")
export const normalizeUsername = (username: string): string => {
    return username.replace(/\s+/g, '').toLowerCase();
};

// Auth functions
export const registerUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!checkRateLimit()) {
        return { success: false, error: 'Bitte warte einen Moment...' };
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        // Check if username exists
        const userRef = ref(database, `users/${normalizedUsername}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            return { success: false, error: 'Benutzername bereits vergeben' };
        }

        // Create user
        const hashedPassword = simpleHash(password);
        await set(userRef, {
            password: hashedPassword,
            createdAt: Date.now(),
            saves: {
                current: null
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Register error:', error);
        if (error.message && error.message.includes('permission_denied')) {
            return { success: false, error: 'Benutzername bereits vergeben' };
        }
        return { success: false, error: 'Registrierung fehlgeschlagen' };
    }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!checkRateLimit()) {
        return { success: false, error: 'Bitte warte einen Moment...' };
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        // 1. Check App Version
        const versionRef = ref(database, 'system/min_version');
        const versionSnapshot = await get(versionRef);

        if (versionSnapshot.exists()) {
            const minVersion = versionSnapshot.val();
            const currentVersion = "2.1.0"; // Hardcoded to match package.json

            // Simple string comparison (works for x.y.z if padded, but sufficient for now)
            // Better: Semantic version comparison
            if (currentVersion < minVersion) {
                return { success: false, error: `Update erforderlich! (Benötigt: v${minVersion})` };
            }
        }

        const userRef = ref(database, `users/${normalizedUsername}`);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            return { success: false, error: 'Benutzer nicht gefunden' };
        }

        const userData = snapshot.val();
        const hashedPassword = simpleHash(password);

        if (userData.password !== hashedPassword) {
            return { success: false, error: 'Falsches Passwort' };
        }

        return { success: true };
    } catch (error) {
        console.error('[Firebase] Login error:', error);
        return { success: false, error: 'Login fehlgeschlagen' };
    }
};

export const saveToCloud = async (username: string, userState: any): Promise<boolean> => {
    if (!checkRateLimit()) {
        console.warn('[Firebase] Rate limit hit for save');
        return false;
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        const saveRef = ref(database, `users/${normalizedUsername}/saves/current`);
        await set(saveRef, {
            ...userState,
            lastSaved: Date.now()
        });
        console.log('[Firebase] Saved to cloud successfully');
        return true;
    } catch (error) {
        console.error('[Firebase] Save error:', error);
        return false;
    }
};

export const loadFromCloud = async (username: string): Promise<any | null> => {
    // No rate limit for loading (usually happens once at start)
    const normalizedUsername = normalizeUsername(username);

    try {
        const saveRef = ref(database, `users/${normalizedUsername}/saves/current`);
        const snapshot = await get(saveRef);

        if (snapshot.exists()) {
            const cloudData = snapshot.val();

            // Check premium expiration (30 days)
            if (cloudData.isPremium && cloudData.premiumActivatedAt) {
                const daysSinceActivation = (Date.now() - cloudData.premiumActivatedAt) / (1000 * 60 * 60 * 24);
                if (daysSinceActivation > 30) {
                    console.log('[Firebase] Premium expired after 30 days');
                    cloudData.isPremium = false; // Expired
                }
            }

            console.log('[Firebase] Loaded from cloud successfully');
            return cloudData;
        }

        return null;
    } catch (error) {
        console.error('[Firebase] Load error:', error);
        return null;
    }
};

export const deleteUserAccount = async (username: string): Promise<boolean> => {
    const normalizedUsername = normalizeUsername(username);
    try {
        const userRef = ref(database, `users/${normalizedUsername}`);
        // We use set(null) to delete in Firebase Realtime Database
        await set(userRef, null);
        return true;
    } catch (error) {
        console.error('[Firebase] Delete error:', error);
        return false;
    }
};

export { database };

const _DEV_SIG = 'KW-1998';
