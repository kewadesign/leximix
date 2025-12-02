/**
 * Multiplayer game state synchronization utilities
 * Uses IONOS API with polling instead of Firebase
 */

import { startGamePolling, makeGameMove, createGame, joinGame } from './gamePolling';
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

export interface NineMensMorrisGameState {
    gameId: string;
    players: {
        host: string;
        guest: string;
    };
    board: (string | null)[]; // 24 positions, null = empty, 'white' or 'black'
    currentPlayer: 'white' | 'black';
    phase: 'placing' | 'moving' | 'flying' | 'removing';
    piecesToPlace: { white: number; black: number };
    mustRemove: boolean;
    status: 'playing' | 'finished';
    winner?: string;
    moveHistory: string[];
    createdAt: number;
    lastActivity: number;
}

export interface RummyCard {
    id: string;
    suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
    value: number;
}

export interface RummyGameState {
    gameId: string;
    players: {
        host: string;
        guest: string;
    };
    deck: RummyCard[];
    discardPile: RummyCard[];
    hostHand: RummyCard[];
    guestHand: RummyCard[];
    hostMelds: RummyCard[][];
    guestMelds: RummyCard[][];
    currentPlayer: 'host' | 'guest';
    phase: 'draw' | 'play';
    status: 'playing' | 'finished';
    winner?: string;
    createdAt: number;
    lastActivity: number;
}

/**
 * Initialize a new multiplayer RUMMY game
 */
export async function initializeRummyGame(
    gameId: string,
    hostUsername: string,
    guestUsername: string
): Promise<boolean> {
    console.log('[MultiplayerGame] Initializing RUMMY game:', gameId);
    try {
        // Create and shuffle deck
        const suits: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        const deck: RummyCard[] = [];
        
        for (const suit of suits) {
            for (let value = 1; value <= 13; value++) {
                deck.push({ id: `${suit}-${value}`, suit, value });
            }
        }
        
        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        // Deal 7 cards each
        const hostHand = deck.splice(0, 7);
        const guestHand = deck.splice(0, 7);
        const discardPile = [deck.splice(0, 1)[0]];
        
        const gameState: RummyGameState = {
            gameId,
            players: {
                host: hostUsername,
                guest: guestUsername
            },
            deck,
            discardPile,
            hostHand,
            guestHand,
            hostMelds: [],
            guestMelds: [],
            currentPlayer: 'host',
            phase: 'draw',
            status: 'playing',
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        const result = await createGame('rummy', gameState);
        if (result.success) {
            console.log('[MultiplayerGame] RUMMY Game created successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('[MultiplayerGame] Error initializing rummy game:', error);
        return false;
    }
}

/**
 * Initialize a new multiplayer NINE MENS MORRIS game
 */
export async function initializeNineMensMorrisGame(
    gameId: string,
    hostUsername: string,
    guestUsername: string
): Promise<boolean> {
    console.log('[MultiplayerGame] Initializing NINE MENS MORRIS game:', gameId);
    try {
        const gameState: NineMensMorrisGameState = {
            gameId,
            players: {
                host: hostUsername,
                guest: guestUsername
            },
            board: Array(24).fill(null),
            currentPlayer: 'white', // White (host) starts
            phase: 'placing',
            piecesToPlace: { white: 9, black: 9 },
            mustRemove: false,
            status: 'playing',
            moveHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };

        const result = await createGame('morris', gameState);
        if (result.success) {
            console.log('[MultiplayerGame] MORRIS Game created successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('[MultiplayerGame] Error initializing morris game:', error);
        return false;
    }
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

        const result = await createGame('chess', gameState);
        if (result.success) {
            console.log('[MultiplayerGame] CHESS Game created successfully');
            return true;
        }
        return false;
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

        const result = await createGame('maumau', gameState);
        if (result.success) {
            console.log('[MultiplayerGame] Game created successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('[MultiplayerGame] Error initializing multiplayer game:', error);
        return false;
    }
}

/**
 * Listen to game state changes (using polling)
 */
export function subscribeToGameState(
    gameId: string,
    onUpdate: (state: MultiplayerGameState | ChessGameState | NineMensMorrisGameState | RummyGameState) => void
): () => void {
    return startGamePolling(gameId, onUpdate);
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
        // Get current state first (would need to fetch, but for now we'll pass full state)
        // In practice, the component should pass the updated state
        const currentState = await fetchGameState(gameId);
        if (!currentState) return false;

        const multiplayerState = currentState as MultiplayerGameState;

        // Validate it's player's turn
        if (multiplayerState.currentTurn !== playerUsername) {
            console.error('Not your turn!');
            return false;
        }

        // Update game state
        const updates: Partial<MultiplayerGameState> = {
            ...multiplayerState,
            hands: {
                ...multiplayerState.hands,
                [playerUsername]: newHand
            },
            discardPile: [...multiplayerState.discardPile, card],
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
        const nextPlayer = multiplayerState.currentTurn === multiplayerState.players.host
            ? multiplayerState.players.guest
            : multiplayerState.players.host;

        // Handle special cards
        if (card.rank === CardRank.SEVEN) {
            // 7: Next player must draw 2 (or stack)
            updates.drawCount = (multiplayerState.drawCount || 0) + 2;
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

        const result = await makeGameMove(gameId, updates);
        return result.success;
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
        const currentState = await fetchGameState(gameId);
        if (!currentState) return false;

        const multiplayerState = currentState as MultiplayerGameState;

        // Validate it's player's turn
        if (multiplayerState.currentTurn !== playerUsername) {
            console.error('Not your turn!');
            return false;
        }

        const actualCount = Math.min(count, multiplayerState.deck.length);
        const drawnCards = multiplayerState.deck.slice(0, actualCount);
        const remainingDeck = multiplayerState.deck.slice(actualCount);

        const updates: Partial<MultiplayerGameState> = {
            ...multiplayerState,
            hands: {
                ...multiplayerState.hands,
                [playerUsername]: [...multiplayerState.hands[playerUsername], ...drawnCards]
            },
            deck: remainingDeck,
            currentTurn: multiplayerState.currentTurn === multiplayerState.players.host
                ? multiplayerState.players.guest
                : multiplayerState.players.host,
            drawCount: 0,
            lastMove: {
                player: playerUsername,
                action: 'draw',
                timestamp: Date.now()
            },
            lastActivity: Date.now()
        };

        const result = await makeGameMove(gameId, updates);
        return result.success;
    } catch (error) {
        console.error('Error drawing cards:', error);
        return false;
    }
}

/**
 * Fetch current game state
 */
async function fetchGameState(gameId: string): Promise<any | null> {
    try {
        const token = localStorage.getItem('leximix_session_token');
        if (!token) return null;

        const response = await fetch(`http://leximix.de/api/games/state.php?id=${encodeURIComponent(gameId)}`, {
            headers: {
                'X-Session-Token': token
            }
        });

        const data = await response.json();
        if (data.success && data.state) {
            return data.state;
        }
        return null;
    } catch (error) {
        console.error('Error fetching game state:', error);
        return null;
    }
}

/**
 * Clean up finished game
 */
export async function cleanupGame(gameId: string): Promise<void> {
    // Games are automatically cleaned up by the server after a period of inactivity
    // No explicit cleanup needed
    console.log('[MultiplayerGame] Game cleanup requested:', gameId);
}
