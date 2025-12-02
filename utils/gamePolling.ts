/**
 * LexiMix - Game Polling System
 * Polling-basiertes System für Echtzeit-Game-Updates ohne Firebase
 */

const API_BASE = 'http://leximix.de/api';
const POLL_INTERVAL = 1500; // 1.5 Sekunden

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
 * Start polling for game state updates
 * Returns cleanup function to stop polling
 */
export function startGamePolling(
    gameId: string,
    onUpdate: (state: any) => void,
    onError?: (error: string) => void
): () => void {
    let isActive = true;
    
    const poll = async () => {
        if (!isActive) return;
        
        try {
            const token = getSessionToken();
            if (!token) {
                onError?.('Not authenticated');
                return;
            }
            
            const response = await fetch(`${API_BASE}/games/state.php?id=${encodeURIComponent(gameId)}`, {
                headers: {
                    'X-Session-Token': token
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.state) {
                onUpdate(data.state);
            } else {
                onError?.(data.error || 'Failed to fetch game state');
            }
        } catch (error: any) {
            onError?.(error.message || 'Network error');
        }
    };
    
    // Initial fetch
    poll();
    
    // Set up interval
    const intervalId = setInterval(poll, POLL_INTERVAL);
    
    // Return cleanup function
    return () => {
        isActive = false;
        clearInterval(intervalId);
    };
}

/**
 * Start polling for game invites
 * Returns cleanup function to stop polling
 */
export function startInvitePolling(
    onUpdate: (invites: any[]) => void,
    onError?: (error: string) => void
): () => void {
    let isActive = true;
    
    const poll = async () => {
        if (!isActive) return;
        
        try {
            const token = getSessionToken();
            if (!token) {
                onError?.('Not authenticated');
                return;
            }
            
            const response = await fetch(`${API_BASE}/invites/list.php`, {
                headers: {
                    'X-Session-Token': token
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                onUpdate(data.invites || []);
            } else {
                onError?.(data.error || 'Failed to fetch invites');
            }
        } catch (error: any) {
            onError?.(error.message || 'Network error');
        }
    };
    
    // Initial fetch
    poll();
    
    // Set up interval
    const intervalId = setInterval(poll, POLL_INTERVAL);
    
    // Return cleanup function
    return () => {
        isActive = false;
        clearInterval(intervalId);
    };
}

/**
 * Make a game move
 */
export async function makeGameMove(
    gameId: string,
    newState: any
): Promise<{ success: boolean; error?: string }> {
    try {
        const token = getSessionToken();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        
        const response = await fetch(`${API_BASE}/games/move.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({
                gameId,
                state: newState
            })
        });
        
        const data = await response.json();
        
        return {
            success: data.success || false,
            error: data.error
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

/**
 * Create a new game
 */
export async function createGame(
    gameType: string,
    initialState: any
): Promise<{ success: boolean; gameId?: string; error?: string }> {
    try {
        const token = getSessionToken();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        
        const response = await fetch(`${API_BASE}/games/create.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({
                gameType,
                state: initialState
            })
        });
        
        const data = await response.json();
        
        return {
            success: data.success || false,
            gameId: data.gameId,
            error: data.error
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

/**
 * Join a game
 */
export async function joinGame(
    gameId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const token = getSessionToken();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        
        const response = await fetch(`${API_BASE}/games/join.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({ gameId })
        });
        
        const data = await response.json();
        
        return {
            success: data.success || false,
            error: data.error
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

/**
 * Send game invite
 */
export async function sendGameInvite(
    gameId: string,
    toUserId?: number,
    toFriendCode?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const token = getSessionToken();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        
        const response = await fetch(`${API_BASE}/invites/send.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({
                gameId,
                toUserId,
                toFriendCode
            })
        });
        
        const data = await response.json();
        
        return {
            success: data.success || false,
            error: data.error
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}

/**
 * Respond to game invite
 */
export async function respondToInvite(
    inviteId: number,
    action: 'accept' | 'decline'
): Promise<{ success: boolean; gameId?: string; error?: string }> {
    try {
        const token = getSessionToken();
        if (!token) {
            return { success: false, error: 'Not authenticated' };
        }
        
        const response = await fetch(`${API_BASE}/invites/respond.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({
                inviteId,
                action
            })
        });
        
        const data = await response.json();
        
        return {
            success: data.success || false,
            gameId: data.gameId,
            error: data.error
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
}
