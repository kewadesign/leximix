/**
 * Multiplayer system utilities for LexiMix
 * Uses IONOS API instead of Firebase
 */

import { getFriends, addFriend, respondToFriendRequest } from './api';

const API_BASE = 'https://leximix.de/api';

// Session token helper
const getSessionToken = (): string | null => {
    const stored = localStorage.getItem('leximix_session_token');
    const storedExpires = localStorage.getItem('leximix_session_expires');
    
    if (stored && storedExpires) {
        const expiresDate = new Date(storedExpires);
        if (new Date() < expiresDate) {
            return stored;
        }
    }
    
    return null;
};

/**
 * Generate a unique friend code
 */
export function generateFriendCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Look up a username by friend code
 */
export async function getUsernameByFriendCode(friendCode: string): Promise<string | null> {
    try {
        const token = getSessionToken();
        if (!token) {
            return null;
        }
        
        // Use friends API to lookup by code
        const response = await fetch(`${API_BASE}/friends/lookup.php?code=${encodeURIComponent(friendCode)}`, {
            headers: {
                'X-Session-Token': token
            }
        });
        
        const data = await response.json();
        if (data.success && data.username) {
            return data.username;
        }
        
        return null;
    } catch (error) {
        console.error('Error looking up friend code:', error);
        return null;
    }
}

/**
 * Get all friends for a user
 */
export async function getFriendsFromFirebase(username: string): Promise<{ code: string; username: string }[]> {
    try {
        const result = await getFriends();
        if (result.success && result.friends) {
            return result.friends.map(f => ({
                code: f.friendCode,
                username: f.username
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching friends:', error);
        return [];
    }
}

/**
 * Add a friend using friend code
 * Note: This now uses the API which handles bidirectional friendship
 */
export async function addFriendToFirebase(
    currentUsername: string,
    currentUserFriendCode: string,
    friendCode: string,
    friendUsername: string
): Promise<boolean> {
    try {
        const result = await addFriend(friendCode);
        return result.success || false;
    } catch (error) {
        console.error('Error adding friend:', error);
        return false;
    }
}

/**
 * Remove a friend
 */
export async function removeFriendFromFirebase(
    currentUsername: string,
    currentUserFriendCode: string,
    friendCode: string,
    friendUsername: string
): Promise<boolean> {
    try {
        const token = getSessionToken();
        if (!token) {
            return false;
        }
        
        const response = await fetch(`${API_BASE}/friends/remove.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({ friendCode })
        });
        
        const data = await response.json();
        return data.success || false;
    } catch (error) {
        console.error('Error removing friend:', error);
        return false;
    }
}

/**
 * Save friend code to database
 * Note: Friend codes are now stored in the users table via API
 */
export async function saveFriendCodeToFirebase(username: string, friendCode: string): Promise<void> {
    // Friend codes are automatically managed by the API
    // This function is kept for compatibility but does nothing
    console.log('[Multiplayer] Friend code saved via API:', friendCode);
}
