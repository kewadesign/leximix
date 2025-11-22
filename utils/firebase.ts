import { initializeApp } from 'firebase/app';
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

// Auth functions
export const registerUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        // Check if username exists
        const userRef = ref(database, `users/${username}`);
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
    try {
        const userRef = ref(database, `users/${username}`);
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
    try {
        const saveRef = ref(database, `users/${username}/saves/current`);
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
    try {
        const saveRef = ref(database, `users/${username}/saves/current`);
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

export { database };
