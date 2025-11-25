// Multiplayer system utilities for LexiMix
import { ref, set, get, onValue, off, push } from 'firebase/database';
import { database } from './firebase';

/**
 * Generate a unique 8-character friend code
 */
export function generateFriendCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Store friend code in Firebase for a user
 */
export async function saveFriendCodeToFirebase(username: string, friendCode: string): Promise<void> {
    try {
        const userCodeRef = ref(database, `friendCodes/${friendCode}`);
        await set(userCodeRef, {
            username,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error saving friend code:', error);
        throw error;
    }
}

/**
 * Look up a username by friend code
 */
export async function getUsernameByFriendCode(friendCode: string): Promise<string | null> {
    try {
        const codeRef = ref(database, `friendCodes/${friendCode}`);
        const snapshot = await get(codeRef);

        if (snapshot.exists()) {
            return snapshot.val().username;
        }
        return null;
    } catch (error) {
        console.error('Error looking up friend code:', error);
        return null;
    }
}

/**
 * Add a friend to user's friend list in Firebase
 */
export async function addFriendToFirebase(
    currentUsername: string,
    friendCode: string,
    friendUsername: string
): Promise<boolean> {
    try {
        const friendsRef = ref(database, `users/${currentUsername}/friends/${friendCode}`);
        await set(friendsRef, {
            code: friendCode,
            username: friendUsername,
            addedAt: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Error adding friend:', error);
        return false;
    }
}

/**
 * Remove a friend from user's friend list
 */
export async function removeFriendFromFirebase(
    currentUsername: string,
    friendCode: string
): Promise<boolean> {
    try {
        const friendRef = ref(database, `users/${currentUsername}/friends/${friendCode}`);
        await set(friendRef, null);
        return true;
    } catch (error) {
        console.error('Error removing friend:', error);
        return false;
    }
}

/**
 * Get all friends for a user
 */
export async function getFriendsFromFirebase(username: string): Promise<{ code: string; username: string }[]> {
    try {
        const friendsRef = ref(database, `users/${username}/friends`);
        const snapshot = await get(friendsRef);

        if (snapshot.exists()) {
            const friendsData = snapshot.val();
            return Object.values(friendsData);
        }
        return [];
    } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
    }
}
