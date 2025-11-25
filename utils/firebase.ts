import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateProfile, User, signOut, updateEmail, updatePassword, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
// KW1998 - Firebase Integration
// WICHTIG: runTransaction wurde hier hinzugefügt
import { getDatabase, ref, set, get, child, runTransaction, onValue } from 'firebase/database';
import { UserState, Language } from '../types';
import { AVATARS, APP_VERSION } from '../constants';

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
export const auth = getAuth(app);

// Simple hash function (NOT secure for production) - KEEPING FOR LEGACY DB ONLY
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
const REQUEST_COOLDOWN = 1000; // 1 second (reduced for better sync)

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
    theme: 'dark',
    activeFrame: null // Ensure this is not undefined for Firebase
};

// ============================================================================
// AUTH FUNCTIONS (UPDATED: Firebase Auth + DB)
// ============================================================================

/**
 * Creates the user data in Realtime Database.
 * Internal helper used after Firebase Auth registration.
 */
const createDatabaseUser = async (username: string, initialData?: Partial<UserState>): Promise<boolean> => {
    const normalizedUsername = normalizeUsername(username);
    try {
        const userRef = ref(database, `users/${normalizedUsername}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            // User DB entry already exists - might be claiming a legacy username or re-registering
            // For now, we assume unique usernames are enforced before calling this
            return false;
        }

        // Create user with full default state
        // Note: We no longer store the password in DB for new users
        await set(userRef, {
            createdAt: Date.now(),
            saves: {
                current: {
                    ...DEFAULT_USER_STATE,
                    ...initialData, // Apply overrides (e.g. language, age)
                    name: username, // Use the entered username as the display name initially
                    lastSaved: Date.now()
                }
            }
        });
        return true;
    } catch (error) {
        console.error('[Firebase] Create DB User error:', error);
        throw error;
    }
};

export const registerUser = async (email: string, password: string, username: string, initialData?: Partial<UserState>): Promise<{ success: boolean; error?: string; user?: User }> => {
    if (!checkRateLimit()) {
        return { success: false, error: 'Bitte warte einen Moment...' };
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        // 1. Check if username is taken in DB (to maintain unique usernames)
        const userRef = ref(database, `users/${normalizedUsername}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            return { success: false, error: 'Benutzername bereits vergeben' };
        }

        // 2. Create Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Send Verification Email
        await sendEmailVerification(user);
        console.log("Registrierung erfolgreich. Bestätigungs-E-Mail gesendet.");

        // 4. Update Profile with Username
        await updateProfile(user, {
            displayName: username
        });

        // 5. Create DB Entry
        await createDatabaseUser(username, initialData);

        return { success: true, user };

    } catch (error: any) {
        console.error('[Firebase] Register error:', error);
        // Map Firebase Auth errors to German messages
        let errorMessage = 'Registrierung fehlgeschlagen.';
        if (error.code === 'auth/email-already-in-use') errorMessage = 'E-Mail wird bereits verwendet.';
        else if (error.code === 'auth/invalid-email') errorMessage = 'Ungültige E-Mail-Adresse.';
        else if (error.code === 'auth/weak-password') errorMessage = 'Passwort ist zu schwach.';
        else if (error.code) errorMessage = `Fehler: ${error.code}`;
        else if (error.message) errorMessage = `Fehler: ${error.message}`;

        return { success: false, error: errorMessage };
    }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string; username?: string; emailVerified?: boolean }> => {
    if (!checkRateLimit()) {
        return { success: false, error: 'Bitte warte einen Moment...' };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // WICHTIG: Prüfen, ob E-Mail verifiziert ist
        if (!user.emailVerified) {
            console.warn("Bitte bestätige zuerst deine E-Mail-Adresse!");
            // Optional: Logout handled by caller or just return status
            return { success: false, error: 'Bitte bestätige zuerst deine E-Mail-Adresse!', emailVerified: false };
        }

        console.log("Login erfolgreich und E-Mail ist verifiziert!");

        // Get username from profile or DB?
        // Profile displayName is set during registration
        let username = user.displayName || '';

        // Fallback: If displayName is missing (legacy?), try to find by some other means?
        // For now, assume displayName is present for new auth users.

        return { success: true, username: username, emailVerified: true };

    } catch (error: any) {
        console.error('[Firebase] Login error:', error);
        let errorMessage = 'Login fehlgeschlagen';
        if (error.code === 'auth/user-not-found') errorMessage = 'Benutzer nicht gefunden.';
        if (error.code === 'auth/wrong-password') errorMessage = 'Falsches Passwort.';
        if (error.code === 'auth/invalid-email') errorMessage = 'Ungültige E-Mail-Adresse.';
        if (error.code === 'auth/invalid-credential') errorMessage = 'Ungültige Zugangsdaten.';

        return { success: false, error: errorMessage };
    }
};


// ============================================================================
// SAVE / LOAD FUNCTIONS (Unverändert)
// ============================================================================

// Helper to remove undefined values for Firebase
const sanitizeForFirebase = (obj: any): any => {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(sanitizeForFirebase);
    }

    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        const value = sanitizeForFirebase(obj[key]);
        if (value !== undefined) {
            newObj[key] = value;
        }
    });
    return newObj;
};

export const saveToCloud = async (username: string, userState: any): Promise<boolean> => {
    if (!checkRateLimit()) {
        console.warn('[Firebase] Rate limit hit for save');
        return false;
    }

    const normalizedUsername = normalizeUsername(username);

    try {
        const saveRef = ref(database, `users/${normalizedUsername}/saves/current`);
        const sanitizedState = sanitizeForFirebase(userState);

        await set(saveRef, {
            ...sanitizedState,
            lastSaved: Date.now()
        });
        console.log('[Firebase] Saved to cloud successfully', {
            level: userState.level,
            coins: userState.coins,
            xp: userState.xp,
            completedLevels: Object.keys(userState.completedLevels || {}).length
        });
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
// ENHANCED AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Re-authenticate user with current password
 * Required before sensitive operations like email/password changes
 */
export const reauthenticateUser = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'Nicht angemeldet' };
        }

        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);

        console.log('[Firebase] Re-authentication successful');
        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Re-authentication error:', error);
        let errorMessage = 'Re-Authentifizierung fehlgeschlagen';
        if (error.code === 'auth/wrong-password') errorMessage = 'Falsches Passwort';
        if (error.code === 'auth/invalid-credential') errorMessage = 'Ungültige Zugangsdaten';
        if (error.code === 'auth/too-many-requests') errorMessage = 'Zu viele Versuche. Bitte später erneut versuchen.';

        return { success: false, error: errorMessage };
    }
};

/**
 * Change user's email address
 * Requires recent re-authentication
 */
export const changeUserEmail = async (newEmail: string, currentPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            return { success: false, error: 'Nicht angemeldet' };
        }

        // Re-authenticate first
        const reauth = await reauthenticateUser(user.email, currentPassword);
        if (!reauth.success) {
            return reauth;
        }

        // Update email
        await updateEmail(user, newEmail);

        // Send verification email to new address
        await sendEmailVerification(user);

        console.log('[Firebase] Email updated successfully');
        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Change email error:', error);
        let errorMessage = 'E-Mail-Änderung fehlgeschlagen';
        if (error.code === 'auth/email-already-in-use') errorMessage = 'E-Mail wird bereits verwendet';
        if (error.code === 'auth/invalid-email') errorMessage = 'Ungültige E-Mail-Adresse';
        if (error.code === 'auth/requires-recent-login') errorMessage = 'Bitte melde dich erneut an';

        return { success: false, error: errorMessage };
    }
};

/**
 * Change user's password
 * Requires recent re-authentication
 */
export const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            return { success: false, error: 'Nicht angemeldet' };
        }

        // Re-authenticate first
        const reauth = await reauthenticateUser(user.email, currentPassword);
        if (!reauth.success) {
            return reauth;
        }

        // Validate new password
        if (newPassword.length < 6) {
            return { success: false, error: 'Neues Passwort muss mindestens 6 Zeichen lang sein' };
        }

        // Update password
        await updatePassword(user, newPassword);

        console.log('[Firebase] Password updated successfully');
        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Change password error:', error);
        let errorMessage = 'Passwort-Änderung fehlgeschlagen';
        if (error.code === 'auth/weak-password') errorMessage = 'Passwort ist zu schwach';
        if (error.code === 'auth/requires-recent-login') errorMessage = 'Bitte melde dich erneut an';

        return { success: false, error: errorMessage };
    }
};

/**
 * Send password reset email
 * Can be called without authentication
 */
export const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
        await sendPasswordResetEmail(auth, email);

        console.log('[Firebase] Password reset email sent');
        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Password reset error:', error);
        let errorMessage = 'Fehler beim Senden der E-Mail';
        if (error.code === 'auth/user-not-found') errorMessage = 'Benutzer nicht gefunden';
        if (error.code === 'auth/invalid-email') errorMessage = 'Ungültige E-Mail-Adresse';
        if (error.code === 'auth/too-many-requests') errorMessage = 'Zu viele Versuche. Bitte später erneut versuchen.';

        return { success: false, error: errorMessage };
    }
};

/**
 * Delete user account completely
 * Deletes from both Firebase Auth AND Realtime Database
 */
export const deleteUserAccountComplete = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedUsername = normalizeUsername(username);

    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            return { success: false, error: 'Nicht angemeldet' };
        }

        // Re-authenticate first for security
        const reauth = await reauthenticateUser(user.email, password);
        if (!reauth.success) {
            return reauth;
        }

        // 1. Delete from Realtime Database
        const userRef = ref(database, `users/${normalizedUsername}`);
        await set(userRef, null);
        console.log('[Firebase] User data deleted from database');

        // 2. Delete from Firebase Auth
        await deleteUser(user);
        console.log('[Firebase] User account deleted from authentication');

        // 3. Sign out (clean up local session)
        await signOut(auth);

        return { success: true };
    } catch (error: any) {
        console.error('[Firebase] Account deletion error:', error);
        let errorMessage = 'Fehler beim Löschen des Accounts';
        if (error.code === 'auth/requires-recent-login') errorMessage = 'Bitte melde dich erneut an';
        if (error.code === 'auth/wrong-password') errorMessage = 'Falsches Passwort';

        return { success: false, error: errorMessage };
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
    isPremium?: boolean;
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
            // UPDATE 1: Root level (for quick checks)
            const premiumRef = ref(database, `users/${normalizedUsername}/isPremium`);
            const activatedAtRef = ref(database, `users/${normalizedUsername}/premiumActivatedAt`);

            // UPDATE 2: Deep within saves/current (where the app actually reads/writes state)
            const savePremiumRef = ref(database, `users/${normalizedUsername}/saves/current/isPremium`);
            const saveActivatedAtRef = ref(database, `users/${normalizedUsername}/saves/current/premiumActivatedAt`);

            const now = Date.now();

            await set(premiumRef, true);
            await set(activatedAtRef, now);
            await set(savePremiumRef, true);
            await set(saveActivatedAtRef, now);

            console.log(`[Firebase] Premium aktiviert für ${normalizedUsername}`);
        }

        console.log(`[Firebase] Voucher ${normalizedCode} redeemed by ${normalizedUsername}`);
        return {
            success: true,
            coinsAwarded: voucherData.coins,
            isPremium: voucherData.isPremium // Pass this back to the frontend
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

// ============================================================================
// FRIEND SYSTEM
// ============================================================================

/**
 * Generate a unique friend code.
 * Checks database to ensure uniqueness.
 */
export const generateFriendCode = async (username: string): Promise<string | null> => {
    const normalizedUsername = normalizeUsername(username);
    try {
        // 1. Check if user already has a code
        const userCodeRef = ref(database, `users/${normalizedUsername}/friendCode`);
        const existingSnapshot = await get(userCodeRef);
        if (existingSnapshot.exists()) {
            return existingSnapshot.val();
        }

        // 2. Generate new code
        let code = '';
        let isUnique = false;
        while (!isUnique) {
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const codeRef = ref(database, `friendCodes/${code}`);
            const codeSnapshot = await get(codeRef);
            if (!codeSnapshot.exists()) {
                isUnique = true;
            }
        }

        // 3. Save code
        await set(ref(database, `users/${normalizedUsername}/friendCode`), code);
        await set(ref(database, `friendCodes/${code}`), normalizedUsername);
        
        // Also save to current save state for easy access
        await set(ref(database, `users/${normalizedUsername}/saves/current/friendCode`), code);

        return code;
    } catch (error) {
        console.error('[Firebase] Generate Friend Code error:', error);
        return null;
    }
};

/**
 * Add a friend using their Friend Code.
 */
export const addFriendByCode = async (myUsername: string, friendCode: string): Promise<{ success: boolean; error?: string }> => {
    const normalizedMyUsername = normalizeUsername(myUsername);
    const code = friendCode.trim().toUpperCase();

    try {
        // 1. Find user by code
        const codeRef = ref(database, `friendCodes/${code}`);
        const snapshot = await get(codeRef);

        if (!snapshot.exists()) {
            return { success: false, error: 'Ungültiger Freundescode' };
        }

        const friendUsername = snapshot.val();

        if (friendUsername === normalizedMyUsername) {
            return { success: false, error: 'Du kannst dich nicht selbst hinzufügen' };
        }

        // 2. Check if already friends
        const myFriendRef = ref(database, `users/${normalizedMyUsername}/friends/${friendUsername}`);
        const existingFriend = await get(myFriendRef);
        if (existingFriend.exists()) {
            return { success: false, error: 'Bereits befreundet' };
        }

        // 3. Send Friend Request (Atomic)
        const requestRef = ref(database, `users/${friendUsername}/friendRequests/${normalizedMyUsername}`);
        await set(requestRef, {
            from: normalizedMyUsername,
            timestamp: Date.now(),
            status: 'pending'
        });

        return { success: true };
    } catch (error) {
        console.error('[Firebase] Add Friend error:', error);
        return { success: false, error: 'Fehler beim Hinzufügen' };
    }
};

/**
 * Accept a friend request.
 */
export const acceptFriendRequest = async (myUsername: string, friendUsername: string): Promise<boolean> => {
    const normalizedMyUsername = normalizeUsername(myUsername);
    const normalizedFriend = normalizeUsername(friendUsername);

    try {
        // 1. Add to my friends list
        await set(ref(database, `users/${normalizedMyUsername}/friends/${normalizedFriend}`), {
            since: Date.now()
        });

        // 2. Add me to their friends list
        await set(ref(database, `users/${normalizedFriend}/friends/${normalizedMyUsername}`), {
            since: Date.now()
        });

        // 3. Remove request
        await set(ref(database, `users/${normalizedMyUsername}/friendRequests/${normalizedFriend}`), null);

        return true;
    } catch (error) {
        console.error('[Firebase] Accept Friend error:', error);
        return false;
    }
};

/**
 * Reject a friend request.
 */
export const rejectFriendRequest = async (myUsername: string, friendUsername: string): Promise<boolean> => {
    const normalizedMyUsername = normalizeUsername(myUsername);
    const normalizedFriend = normalizeUsername(friendUsername);

    try {
        await set(ref(database, `users/${normalizedMyUsername}/friendRequests/${normalizedFriend}`), null);
        return true;
    } catch (error) {
        console.error('[Firebase] Reject Friend error:', error);
        return false;
    }
};

export { database };