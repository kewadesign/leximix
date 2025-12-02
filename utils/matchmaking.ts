/**
 * Matchmaking system for LexiMix
 * Uses IONOS API instead of Firebase
 */

import { GameMode } from '../types';

const API_BASE = 'https://leximix.de/api';
const MATCH_CHECK_INTERVAL = 2000; // 2 seconds

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

// Map GameMode to API game type
const gameModeToType = (mode: GameMode): string => {
    const map: Record<GameMode, string> = {
        [GameMode.SKAT_MAU_MAU]: 'maumau',
        [GameMode.CHESS]: 'chess',
        [GameMode.NINE_MENS_MORRIS]: 'morris',
        [GameMode.CHECKERS]: 'checkers',
        [GameMode.RUMMY]: 'rummy',
        [GameMode.SOLITAIRE]: 'solitaire'
    };
    return map[mode] || 'maumau';
};

export interface MatchmakingEntry {
    userId: string;
    username: string;
    timestamp: number;
    language: string;
    mmr?: number;
}

/**
 * Joins the matchmaking queue for a specific game mode.
 */
export async function joinMatchmakingQueue(
    gameMode: GameMode,
    userId: string,
    username: string,
    language: string
): Promise<void> {
    try {
        const token = getSessionToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        const gameType = gameModeToType(gameMode);
        
        const response = await fetch(`${API_BASE}/matchmaking/join.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({
                gameType,
                language,
                mmr: 1000 // Default MMR, can be enhanced later
            })
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to join queue');
        }
    } catch (error: any) {
        console.error('[Matchmaking] Failed to join queue:', error);
        throw error;
    }
}

/**
 * Leaves the matchmaking queue.
 */
export async function leaveMatchmakingQueue(gameMode: GameMode, userId: string): Promise<void> {
    try {
        const token = getSessionToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        const gameType = gameModeToType(gameMode);
        
        const response = await fetch(`${API_BASE}/matchmaking/leave.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({ gameType })
        });
        
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to leave queue');
        }
    } catch (error: any) {
        console.error('[Matchmaking] Failed to leave queue:', error);
        throw error;
    }
}

/**
 * Tries to find a match in the queue.
 * Server-side implementation - atomar und race-condition-safe
 */
export async function findMatch(
    gameMode: GameMode,
    currentUserId: string,
    currentUsername: string
): Promise<{ gameId: string; opponent: MatchmakingEntry } | null> {
    try {
        const token = getSessionToken();
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        const gameType = gameModeToType(gameMode);
        
        const response = await fetch(`${API_BASE}/matchmaking/find.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({ gameType })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to find match');
        }
        
        if (!data.matched) {
            return null; // No opponent found
        }
        
        return {
            gameId: data.gameId,
            opponent: {
                userId: String(data.opponent.userId),
                username: data.opponent.username,
                timestamp: Date.now(),
                language: 'DE'
            }
        };
    } catch (error: any) {
        console.error('[Matchmaking] Failed to find match:', error);
        return null;
    }
}

/**
 * Listens for a match assignment for the current user.
 * Uses polling instead of Firebase real-time listeners
 */
export function listenForMatch(
    userId: string,
    onMatchFound: (matchData: { gameId: string; opponentName: string; mode: GameMode }) => void
): () => void {
    let isActive = true;
    
    const checkMatch = async () => {
        if (!isActive) return;
        
        try {
            const token = getSessionToken();
            if (!token) {
                return;
            }
            
            const response = await fetch(`${API_BASE}/matchmaking/check.php`, {
                headers: {
                    'X-Session-Token': token
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.matched) {
                // Map game type back to GameMode
                const typeToMode: Record<string, GameMode> = {
                    'maumau': GameMode.SKAT_MAU_MAU,
                    'chess': GameMode.CHESS,
                    'morris': GameMode.NINE_MENS_MORRIS,
                    'checkers': GameMode.CHECKERS,
                    'rummy': GameMode.RUMMY
                };
                
                const mode = typeToMode[data.gameType] || GameMode.SKAT_MAU_MAU;
                
                onMatchFound({
                    gameId: data.gameId,
                    opponentName: data.opponent.username,
                    mode
                });
            }
        } catch (error) {
            console.error('[Matchmaking] Failed to check match:', error);
        }
    };
    
    // Initial check
    checkMatch();
    
    // Set up polling interval
    const intervalId = setInterval(checkMatch, MATCH_CHECK_INTERVAL);
    
    // Return cleanup function
    return () => {
        isActive = false;
        clearInterval(intervalId);
    };
}
