// Multiplayer game state synchronization utilities
import { ref, set, onValue, off, get, update } from 'firebase/database';
import { database, sanitizeForFirebase } from './firebase';
import { type Card, CardRank } from './maumau';

export interface MultiplayerGameState {
    gameId: string;
    players: {
        host: string;
        guest: string;
    };
    deck: Card[];
    discardPile: Card[];
    hands: {
        [playerId: string]: Card[];
    };
    currentTurn: string; // username
    wishedSuit: number | null;
    drawCount: number;
    status: 'waiting' | 'ready' | 'playing' | 'finished';
    winner?: string;
    lastMove: {
        player: string;
        action: 'play' | 'draw' | 'wish';
        card?: Card;
        suit?: number;
        timestamp: number;
    } | null;
    createdAt: number;
    lastActivity: number;
}

export interface ChessGameState {
    gameId: string;
    players: {
        host: string;
        guest: string;
    };
    fen: string;
    turn: 'w' | 'b';
    status: 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'resigned';
    winner?: string;
    lastMove?: {
        from: string;
        to: string;
        timestamp: number;
    } | null;
    createdAt: number;
    lastActivity: number;
}

/**
 * Initialize a new multiplayer CHESS game
 */
export async function initializeChessGame(
    gameId: string,
    hostUsername: string,
    guestUsername: string
): Promise<boolean> {
    console.log('[MultiplayerGame] Initializing CHESS game:', gameId);
    try {
        const gameState: ChessGameState = {
            gameId,
            players: {
                host: hostUsername,
                guest: guestUsername
            },
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Start FEN
            turn: 'w',
            status: 'playing',
            lastMove: null,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        console.log('[MultiplayerGame] Writing CHESS game state to Firebase...', gameState);
        const sanitizedState = sanitizeForFirebase(gameState);
        await set(ref(database, `games/${gameId}`), sanitizedState);
        console.log('[MultiplayerGame] CHESS Game state written successfully');
        return true;
    } catch (error) {
        console.error('[MultiplayerGame] Error initializing chess game:', error);
        return false;
    }
}

/**
 * Initialize a new multiplayer game
 */
export async function initializeMultiplayerGame(
    gameId: string,
    hostUsername: string,
    guestUsername: string,
    initialDeck: Card[],
    initialDiscardPile: Card[],
    hostHand: Card[],
    guestHand: Card[]
): Promise<boolean> {
    console.log('[MultiplayerGame] Initializing game:', gameId);
    try {
        const gameState: MultiplayerGameState = {
            gameId,
            players: {
                host: hostUsername,
                guest: guestUsername
            },
            deck: initialDeck,
            discardPile: initialDiscardPile,
            hands: {
                [hostUsername]: hostHand,
                [guestUsername]: guestHand
            },
            currentTurn: hostUsername, // Host starts
            wishedSuit: null,
            drawCount: 0,
            status: 'playing',
            lastMove: null,
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        console.log('[MultiplayerGame] Writing game state to Firebase...', gameState);
        const sanitizedState = sanitizeForFirebase(gameState);
        await set(ref(database, `games/${gameId}`), sanitizedState);
        console.log('[MultiplayerGame] Game state written successfully');
        return true;
    } catch (error) {
        console.error('[MultiplayerGame] Error initializing multiplayer game:', error);
        return false;
    }
}

/**
 * Listen to game state changes
 */
export function subscribeToGameState(
    gameId: string,
    onUpdate: (state: MultiplayerGameState) => void
): () => void {
    const gameRef = ref(database, `games/${gameId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
        if (snapshot.exists()) {
            const state = snapshot.val() as MultiplayerGameState;
            onUpdate(state);
        }
    });

    return () => off(gameRef);
}

/**
 * Play a card in multiplayer game
 */
export async function playCardMultiplayer(
    gameId: string,
    playerUsername: string,
    card: Card,
    newHand: Card[],
    wishedSuit?: number
): Promise<boolean> {
    try {
        const gameRef = ref(database, `games/${gameId}`);
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) return false;

        const currentState = snapshot.val() as MultiplayerGameState;

        // Validate it's player's turn
        if (currentState.currentTurn !== playerUsername) {
            console.error('Not your turn!');
            return false;
        }

        // Update game state
        const updates: Partial<MultiplayerGameState> = {
            hands: {
                ...currentState.hands,
                [playerUsername]: newHand
            },
            discardPile: [...currentState.discardPile, card],
            lastMove: {
                player: playerUsername,
                action: 'play',
                card,
                suit: wishedSuit,
                timestamp: Date.now()
            },
            lastActivity: Date.now()
        };

        // Determine next player
        const nextPlayer = currentState.currentTurn === currentState.players.host
            ? currentState.players.guest
            : currentState.players.host;

        // Handle special cards
        if (card.rank === CardRank.SEVEN) {
            // 7: Next player must draw 2 (or stack)
            updates.drawCount = (currentState.drawCount || 0) + 2;
            updates.currentTurn = nextPlayer;
            updates.wishedSuit = null;
        } else if (card.rank === CardRank.JACK) {
            // Jack: Wish a suit, turn switches
            updates.wishedSuit = wishedSuit || null;
            updates.currentTurn = nextPlayer;
            updates.drawCount = 0;
        } else if (card.rank === CardRank.EIGHT) {
            // 8: Same player plays again
            updates.currentTurn = playerUsername;
            updates.wishedSuit = null;
            updates.drawCount = 0;
        } else {
            // Normal card: Switch turn, clear special states
            updates.currentTurn = nextPlayer;
            updates.drawCount = 0;
            updates.wishedSuit = null;
        }

        // Check for win
        if (newHand.length === 0) {
            updates.status = 'finished';
            updates.winner = playerUsername;
        }

        const sanitizedUpdates = sanitizeForFirebase(updates);
        await update(gameRef, sanitizedUpdates);
        return true;
    } catch (error) {
        console.error('Error playing card:', error);
        return false;
    }
}

/**
 * Draw cards in multiplayer game
 */
export async function drawCardsMultiplayer(
    gameId: string,
    playerUsername: string,
    count: number
): Promise<boolean> {
    try {
        const gameRef = ref(database, `games/${gameId}`);
        const snapshot = await get(gameRef);

        if (!snapshot.exists()) return false;

        const currentState = snapshot.val() as MultiplayerGameState;

        // Validate it's player's turn
        if (currentState.currentTurn !== playerUsername) {
            console.error('Not your turn!');
            return false;
        }

        const actualCount = Math.min(count, currentState.deck.length);
        const drawnCards = currentState.deck.slice(0, actualCount);
        const remainingDeck = currentState.deck.slice(actualCount);

        const updates: Partial<MultiplayerGameState> = {
            hands: {
                ...currentState.hands,
                [playerUsername]: [...currentState.hands[playerUsername], ...drawnCards]
            },
            deck: remainingDeck,
            currentTurn: currentState.currentTurn === currentState.players.host
                ? currentState.players.guest
                : currentState.players.host,
            drawCount: 0,
            lastMove: {
                player: playerUsername,
                action: 'draw',
                timestamp: Date.now()
            },
            lastActivity: Date.now()
        };

        const sanitizedUpdates = sanitizeForFirebase(updates);
        await update(gameRef, sanitizedUpdates);
        return true;
    } catch (error) {
        console.error('Error drawing cards:', error);
        return false;
    }
}

/**
 * Clean up finished game
 */
export async function cleanupGame(gameId: string): Promise<void> {
    try {
        await set(ref(database, `games/${gameId}`), null);
    } catch (error) {
        console.error('Error cleaning up game:', error);
    }
}
