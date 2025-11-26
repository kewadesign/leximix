import { ref, set, get, onValue, off, remove, runTransaction } from 'firebase/database';
import { database } from './firebase';
import { GameMode } from '../types';

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
    const queueRef = ref(database, `matchmakingQueue/${gameMode}/${userId}`);
    const entry: MatchmakingEntry = {
        userId,
        username,
        timestamp: Date.now(),
        language
    };
    await set(queueRef, entry);
}

/**
 * Leaves the matchmaking queue.
 */
export async function leaveMatchmakingQueue(gameMode: GameMode, userId: string): Promise<void> {
    const queueRef = ref(database, `matchmakingQueue/${gameMode}/${userId}`);
    await remove(queueRef);
}

/**
 * Tries to find a match in the queue.
 * If a match is found, it creates a game and returns the gameId.
 * If no match is found, it returns null.
 * 
 * This is a simple client-side matchmaking implementation.
 * Ideally, this should be done via Cloud Functions to avoid race conditions.
 */
export async function findMatch(
    gameMode: GameMode,
    currentUserId: string,
    currentUsername: string
): Promise<{ gameId: string; opponent: MatchmakingEntry } | null> {
    const queueRef = ref(database, `matchmakingQueue/${gameMode}`);

    // Use a transaction to atomically find and remove an opponent
    // Note: This is tricky with client-side logic on a list. 
    // For now, we'll fetch the list and try to claim an opponent.

    const snapshot = await get(queueRef);
    if (!snapshot.exists()) return null;

    const queue = snapshot.val();
    const potentialOpponents = Object.values(queue) as MatchmakingEntry[];

    // Filter out self and find an opponent (FIFO or random)
    // Simple FIFO: Find the oldest entry that is not me
    const opponent = potentialOpponents
        .filter(entry => entry.userId !== currentUserId)
        .sort((a, b) => a.timestamp - b.timestamp)[0];

    if (!opponent) return null;

    // Try to claim this opponent by removing them from the queue
    // This is where race conditions can happen.
    // We will try to remove them. If successful, we matched.
    // If they are already gone, someone else took them.

    try {
        // We need to verify they are still there and remove them
        const opponentQueueRef = ref(database, `matchmakingQueue/${gameMode}/${opponent.userId}`);

        // We can't easily do a "test and set" on a delete in Firebase without a transaction on the parent,
        // which might be too heavy.
        // For this prototype, we'll just try to remove.
        // A better approach for client-side is to "lock" the opponent first.

        await remove(opponentQueueRef);

        // If we reached here without error, we assume we claimed them.
        // (In a real high-concurrency app, we'd need better locking)

        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create the game invite/signal for the opponent
        // We can reuse the gameInvites system or a specific 'matches' node
        // Let's use a 'matches' node to signal the opponent

        await set(ref(database, `matches/${opponent.userId}`), {
            gameId,
            opponentId: currentUserId,
            opponentName: currentUsername,
            mode: gameMode,
            timestamp: Date.now()
        });

        // Also signal ourselves (so our listener picks it up same way)
        await set(ref(database, `matches/${currentUserId}`), {
            gameId,
            opponentId: opponent.userId,
            opponentName: opponent.username,
            mode: gameMode,
            timestamp: Date.now()
        });

        // Remove ourselves from queue
        await leaveMatchmakingQueue(gameMode, currentUserId);

        return { gameId, opponent };

    } catch (error) {
        console.error("Failed to match with opponent", error);
        return null; // Try again later
    }
}

/**
 * Listens for a match assignment for the current user.
 */
export function listenForMatch(
    userId: string,
    onMatchFound: (matchData: { gameId: string; opponentName: string; mode: GameMode }) => void
): () => void {
    const matchRef = ref(database, `matches/${userId}`);

    const unsubscribe = onValue(matchRef, (snapshot) => {
        if (snapshot.exists()) {
            const matchData = snapshot.val();
            // Match found!
            onMatchFound(matchData);

            // Clean up the match signal
            remove(matchRef);
        }
    });

    return () => off(matchRef);
}
