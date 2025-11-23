import { initializeApp } from "firebase/app";
// KW1998 - Firebase Integration
// WICHTIG: runTransaction wurde hier hinzugefügt
import { getDatabase, ref, set, get, child, runTransaction, onValue } from 'firebase/database';
import { UserState, Language } from '../types';
import { AVATARS } from '../constants';

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

// Helper to normalize usernames
export const normalizeUsername = (username: string): string => {
    return username.replace(/\s+/g, '').toLowerCase();
};

// Default User State (copied from App.tsx to ensure consistency on register)
const DEFAULT_USER_STATE: UserState = {
    name: 'Player',
    age: 0,
    avatarId: AVATARS[0],
    ownedAvatars: [AVATARS[0]],
    xp: 0,
    level: 1,
    coins: 0,
    isPremium: false,
    completedLevels: {},
    playedWords: [],
    language: Language.DE,
    theme: 'dark'
};

// ============================================================================
// AUTH FUNCTIONS (Unverändert)
// ============================================================================

export const registerUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!checkRateLimit()) {
        return { success: false, error: 'Bitte warte einen Moment...' };
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        const userRef = ref(database, `users/${normalizedUsername}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            return { success: false, error: 'Benutzername bereits vergeben' };
        }

        const hashedPassword = simpleHash(password);
        
        // Create user with full default state
        await set(userRef, {
            password: hashedPassword,
            createdAt: Date.now(),
            saves: { 
                current: {
                    ...DEFAULT_USER_STATE,
                    name: username, // Use the entered username as the display name initially
                    lastSaved: Date.now()
                }
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Register error:', error);
        // Log specific details to help debugging
        if (error.code) console.error('Error code:', error.code);
        if (error.message) console.error('Error message:', error.message);

        if (error.message && error.message.includes('permission_denied')) {
            return { success: false, error: 'Benutzername bereits vergeben (oder Zugriff verweigert)' };
        }
        return { success: false, error: 'Registrierung fehlgeschlagen. Prüfe die Konsole.' };
    }
};

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!checkRateLimit()) {
        return { success: false, error: 'Bitte warte einen Moment...' };
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        // Check App Version
        const versionRef = ref(database, 'system/min_version');
        const versionSnapshot = await get(versionRef);

        if (versionSnapshot.exists()) {
            const minVersion = versionSnapshot.val();
            const currentVersion = "2.1.0";
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

// ============================================================================
// SAVE / LOAD FUNCTIONS (Unverändert)
// ============================================================================

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
    const normalizedUsername = normalizeUsername(username);

    try {
        const saveRef = ref(database, `users/${normalizedUsername}/saves/current`);
        const snapshot = await get(saveRef);

        if (snapshot.exists()) {
            const cloudData = snapshot.val();
            // Check premium logic here if needed
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
        await set(userRef, null);
        return true;
    } catch (error) {
        console.error('[Firebase] Delete error:', error);
        return false;
    }
};

// ============================================================================
// VOUCHER SYSTEM (UPDATED: First-Come-First-Served)
// ============================================================================

export interface VoucherData {
    coins: number;
    description?: string;
    isPremium?: boolean; // true for premium vouchers
}

export interface VoucherRedemptionResult {
    success: boolean;
    error?: string;
    coinsAwarded?: number;
}

/**
 * Redeem a voucher code.
 * Logic: Uses the 'usedBy' map to ensure a voucher can only be claimed once per user.
 * If the field is already taken, Security Rules will block the write -> Error.
 */
export const redeemVoucher = async (
    username: string,
    voucherCode: string
): Promise<VoucherRedemptionResult> => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedCode = voucherCode.trim().toUpperCase();

    try {
        // 1. Define References (original code)
        let voucherRef = ref(database, `vouchers/${normalizedCode}`);
        let usedByRef = ref(database, `vouchers/${normalizedCode}/usedBy/${normalizedUsername}`);

        // 2. Try to fetch the voucher with the given format
        let voucherSnapshot = await get(voucherRef);

        // If not found, try a dash‑less version (e.g. LEXIMIX‑ABC‑123 → LEXIMIXABC123)
        if (!voucherSnapshot.exists()) {
            const strippedCode = normalizedCode.replace(/-/g, "");
            voucherRef = ref(database, `vouchers/${strippedCode}`);
            usedByRef = ref(database, `vouchers/${strippedCode}/usedBy/${normalizedUsername}`);
            voucherSnapshot = await get(voucherRef);
            if (!voucherSnapshot.exists()) {
                return { success: false, error: 'Ungültiger Gutscheincode' };
            }
        }

        const voucherData = voucherSnapshot.val();

        // 3. Check if already redeemed by this user
        const usedBySnapshot = await get(usedByRef);
        if (usedBySnapshot.exists()) {
            return { success: false, error: 'Du hast diesen Gutschein bereits eingelöst' };
        }

        // 4. ATOMIC CLAIM ATTEMPT – write our username into usedBy
        await set(usedByRef, Date.now());

        // --- SUCCESS! If we are here, we own the code. ---

        const coinsAmount = voucherData.coins || 0;

        // 5. Add Coins Transactionally (Safe update of user balance)
        const userCoinsRef = ref(database, `users/${normalizedUsername}/saves/current/coins`);
        await runTransaction(userCoinsRef, (currentCoins) => {
            return (currentCoins || 0) + coinsAmount;
        });

        // 6. Create reward entry for the user

        // 6. Create reward entry for the user
        const rewardId = `reward_${Date.now()}`;
        const rewardRef = ref(database, `users/${normalizedUsername}/voucherRewards/${rewardId}`);
        await set(rewardRef, {
            coins: voucherData.coins,
            timestamp: Date.now(),
            voucherCode: normalizedCode,
            processed: false
        });

        // ---- PREMIUM ACTIVATION ----
        if (voucherData.isPremium) {
            const premiumRef = ref(database, `users/${normalizedUsername}/isPremium`);
            const activatedAtRef = ref(database, `users/${normalizedUsername}/premiumActivatedAt`);
            await set(premiumRef, true);
            await set(activatedAtRef, Date.now());
            console.log(`[Firebase] Premium aktiviert für ${normalizedUsername}`);
        }

        console.log(`[Firebase] Voucher ${normalizedCode} redeemed by ${normalizedUsername}`);
        return {
            success: true,
            coinsAwarded: voucherData.coins,
        };

    } catch (error: any) {
        console.error('[Firebase] Voucher redemption error:', error);

        // Interpret Permission Denied as "Already Claimed" due to our rules
        if (error.message && error.message.includes('permission_denied')) {
            return { success: false, error: 'Schade! Jemand war schneller.' };
        }

        return { success: false, error: 'Fehler beim Einlösen.' };
    }
};

/**
 * Listen to rewards (Frontend helper)
 */
export const listenToVoucherRewards = (
    username: string,
    onReward: (coins: number, voucherCode: string) => void
): (() => void) => {
    const normalizedUsername = normalizeUsername(username);
    const rewardsRef = ref(database, `users/${normalizedUsername}/voucherRewards`);

    const unsubscribe = onValue(rewardsRef, (snapshot) => {
        if (snapshot.exists()) {
            const rewards = snapshot.val();
            Object.keys(rewards).forEach((rewardId) => {
                const reward = rewards[rewardId];
                if (!reward.processed) {
                    onReward(reward.coins, reward.voucherCode);
                    // Mark as processed to avoid double alerts
                    const processedRef = ref(database, `users/${normalizedUsername}/voucherRewards/${rewardId}/processed`);
                    set(processedRef, true);
                }
            });
        }
    });

    return unsubscribe;
};

/**
 * ADMIN ONLY: Create a new voucher
 */
export const createVoucher = async (
    voucherCode: string,
    coins: number,
    description: string
): Promise<{ success: boolean; error?: string }> => {
    const normalizedCode = voucherCode.trim().toUpperCase();

    try {
        const voucherRef = ref(database, `vouchers/${normalizedCode}`);
        const snapshot = await get(voucherRef);

        if (snapshot.exists()) {
            return { success: false, error: 'Code existiert bereits' };
        }

        // Create simple object. No 'claimedBy' field; vouchers are claimed via the 'usedBy' map.
        const voucherData: VoucherData = {
            coins,
            description,
            // isPremium can be added when creating premium vouchers
        };

        await set(voucherRef, voucherData);
        console.log(`[Firebase] Created voucher: ${normalizedCode}`);
        return { success: true };
    } catch (error) {
        console.error('[Firebase] Create voucher error:', error);
        return { success: false, error: 'Fehler beim Erstellen' };
    }
};

export { database };