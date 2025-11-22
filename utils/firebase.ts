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

// ============================================================================
// VOUCHER SYSTEM
// ============================================================================

export interface VoucherData {
    coins: number;
    description: string;
    expiresAt?: number;
    maxUses?: number;
    usedBy?: { [username: string]: number };
}

export interface VoucherRedemptionResult {
    success: boolean;
    error?: string;
    coinsAwarded?: number;
}

/**
 * Redeem a voucher code for the user
 * This function checks if the code is valid, not expired, not fully used,
 * and if the user hasn't already redeemed it. If valid, it marks the voucher
 * as used by the user and creates a reward entry.
 */
export const redeemVoucher = async (
    username: string,
    voucherCode: string
): Promise<VoucherRedemptionResult> => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedCode = voucherCode.trim().toUpperCase();

    try {
        // 1. Check if voucher exists
        const voucherRef = ref(database, `vouchers/${normalizedCode}`);
        const voucherSnapshot = await get(voucherRef);

        if (!voucherSnapshot.exists()) {
            return { success: false, error: 'Ungültiger Gutscheincode' };
        }

        const voucherData: VoucherData = voucherSnapshot.val();

        // 2. Check if expired
        if (voucherData.expiresAt && Date.now() > voucherData.expiresAt) {
            return { success: false, error: 'Gutschein ist abgelaufen' };
        }

        // 3. Check if max uses reached
        if (voucherData.maxUses && voucherData.usedBy) {
            const useCount = Object.keys(voucherData.usedBy).length;
            if (useCount >= voucherData.maxUses) {
                return { success: false, error: 'Gutschein wurde bereits vollständig eingelöst' };
            }
        }

        // 4. Check if user already redeemed this voucher
        const usedByRef = ref(database, `vouchers/${normalizedCode}/usedBy/${normalizedUsername}`);
        const usedBySnapshot = await get(usedByRef);

        if (usedBySnapshot.exists()) {
            return { success: false, error: 'Du hast diesen Gutschein bereits eingelöst' };
        }

        // 5. Mark voucher as used by this user
        await set(usedByRef, Date.now());

        // 6. Create reward entry for the user
        const rewardId = `reward_${Date.now()}`;
        const rewardRef = ref(database, `users/${normalizedUsername}/voucherRewards/${rewardId}`);
        await set(rewardRef, {
            coins: voucherData.coins,
            timestamp: Date.now(),
            voucherCode: normalizedCode,
        });

        console.log(`[Firebase] Voucher ${normalizedCode} redeemed by ${normalizedUsername}`);
        return {
            success: true,
            coinsAwarded: voucherData.coins,
        };
    } catch (error: any) {
        console.error('[Firebase] Voucher redemption error:', error);
        if (error.message && error.message.includes('permission_denied')) {
            return { success: false, error: 'Du hast diesen Gutschein bereits eingelöst' };
        }
        return { success: false, error: 'Fehler beim Einlösen des Gutscheins' };
    }
};

/**
 * Listen to voucher rewards for a user and execute callback when new rewards arrive
 * This allows real-time coin updates when a voucher is redeemed
 */
export const listenToVoucherRewards = (
    username: string,
    onReward: (coins: number, voucherCode: string) => void
): (() => void) => {
    const normalizedUsername = normalizeUsername(username);
    const rewardsRef = ref(database, `users/${normalizedUsername}/voucherRewards`);

    // Import onValue from firebase/database
    import('firebase/database').then(({ onValue }) => {
        const unsubscribe = onValue(rewardsRef, (snapshot) => {
            if (snapshot.exists()) {
                const rewards = snapshot.val();
                // Process only new rewards (not yet processed)
                Object.keys(rewards).forEach((rewardId) => {
                    const reward = rewards[rewardId];
                    if (!reward.processed) {
                        onReward(reward.coins, reward.voucherCode);

                        // Mark as processed
                        const processedRef = ref(database, `users/${normalizedUsername}/voucherRewards/${rewardId}/processed`);
                        set(processedRef, true);
                    }
                });
            }
        });

        return unsubscribe;
    });

    // Return empty cleanup function initially
    return () => { };
};

/**
 * ADMIN ONLY: Create a new voucher code
 * This should only be called from admin panel or server-side
 */
export const createVoucher = async (
    voucherCode: string,
    coins: number,
    description: string,
    expiresAt?: number,
    maxUses?: number
): Promise<{ success: boolean; error?: string }> => {
    const normalizedCode = voucherCode.trim().toUpperCase();

    try {
        const voucherRef = ref(database, `vouchers/${normalizedCode}`);
        const snapshot = await get(voucherRef);

        if (snapshot.exists()) {
            return { success: false, error: 'Gutscheincode existiert bereits' };
        }

        const voucherData: VoucherData = {
            coins,
            description,
        };

        if (expiresAt) voucherData.expiresAt = expiresAt;
        if (maxUses) voucherData.maxUses = maxUses;

        await set(voucherRef, voucherData);
        console.log(`[Firebase] Created voucher: ${normalizedCode}`);
        return { success: true };
    } catch (error) {
        console.error('[Firebase] Create voucher error:', error);
        return { success: false, error: 'Fehler beim Erstellen des Gutscheins' };
    }
};

export { database };

const _DEV_SIG = 'KW-1998';
