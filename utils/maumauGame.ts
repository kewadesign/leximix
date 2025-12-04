// Letter Mau Mau - Game Logic Manager

import {
    Card,
    MauMauGame,
    Player,
    CardSuit,
    ActionType,
    generateDeck,
    drawCards,
    canPlayCard
} from './maumau';

export type { MauMauGame };

// Initialize a new game
export function initializeGame(
    player1Uid: string,
    player1Username: string,
    player2Uid: string | 'AI',
    player2Username: string,
    mode: 'ai' | 'multiplayer' = 'ai'
): MauMauGame {
    const deck = generateDeck();

    // Deal 7 cards to each player
    const { drawn: player1Hand, remaining: afterPlayer1 } = drawCards(deck, 7);
    const { drawn: player2Hand, remaining: afterPlayer2 } = drawCards(afterPlayer1, 7);

    // Draw starting card
    const { drawn: [currentCard], remaining: finalDeck } = drawCards(afterPlayer2, 1);

    return {
        gameId: `game_${Date.now()}`,
        mode,
        players: {
            player1: {
                uid: player1Uid,
                username: player1Username,
                hand: player1Hand,
                saidMau: false
            },
            player2: {
                uid: player2Uid,
                username: player2Username,
                hand: player2Hand,
                saidMau: false
            }
        },
        deck: finalDeck,
        discardPile: [],
        currentCard,
        currentPlayer: 1,
        direction: 1,
        status: 'active',
        startedAt: Date.now()
    };
}

// Play a card
export function playCard(
    game: MauMauGame,
    playerNumber: 1 | 2,
    cardIndex: number,
    wishedSuit?: CardSuit
): { success: boolean; error?: string; game: MauMauGame } {
    const playerKey = `player${playerNumber}` as 'player1' | 'player2';
    const player = game.players[playerKey];

    // Validate turn
    if (game.currentPlayer !== playerNumber) {
        return { success: false, error: 'Not your turn!', game };
    }

    // Get card
    const card = player.hand[cardIndex];
    if (!card) {
        return { success: false, error: 'Invalid card!', game };
    }

    // Validate play
    if (!canPlayCard(card, game.currentCard, game.wishedSuit)) {
        return { success: false, error: 'Card cannot be played!', game };
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);

    // Add to discard pile
    game.discardPile.push(card);
    game.currentCard = card;
    game.wishedSuit = undefined;

    // Handle action cards
    if (card.isAction) {
        handleActionCard(game, card, wishedSuit);
    }

    // Check if player won
    if (player.hand.length === 0) {
        game.status = 'finished';
        game.winner = player.uid;
        game.finishedAt = Date.now();
        return { success: true, game };
    }

    // Reset Mau if more than 1 card again
    if (player.hand.length !== 1) {
        player.saidMau = false;
    }

    // Next turn
    game.currentPlayer = getNextPlayer(game);

    return { success: true, game };
}

// Draw a card
export function drawCard(game: MauMauGame, playerNumber: 1 | 2): MauMauGame {
    const playerKey = `player${playerNumber}` as 'player1' | 'player2';

    if (game.deck.length === 0) {
        // Reshuffle discard pile into deck (keep current card)
        game.deck = shuffleArray([...game.discardPile]);
        game.discardPile = [];
    }

    const { drawn, remaining } = drawCards(game.deck, 1);
    game.players[playerKey].hand.push(...drawn);
    game.deck = remaining;

    // Move to next player
    game.currentPlayer = getNextPlayer(game);

    return game;
}

// Say "Mau"
export function sayMau(game: MauMauGame, playerNumber: 1 | 2): MauMauGame {
    const playerKey = `player${playerNumber}` as 'player1' | 'player2';
    game.players[playerKey].saidMau = true;
    return game;
}

// Handle action card effects
function handleActionCard(game: MauMauGame, card: Card, wishedSuit?: CardSuit): void {
    switch (card.actionType) {
        case ActionType.DRAW_TWO:
            // Next player must draw 2 (7 card)
            const nextPlayer = getNextPlayer(game);
            const nextPlayerKey = `player${nextPlayer}` as 'player1' | 'player2';
            const { drawn, remaining } = drawCards(game.deck, 2);
            game.players[nextPlayerKey].hand.push(...drawn);
            game.deck = remaining;
            // Skip their turn
            game.currentPlayer = getNextPlayer({ ...game, currentPlayer: nextPlayer });
            break;

        case ActionType.SKIP:
            // Skip next player (8 card)
            game.currentPlayer = getNextPlayer({ ...game, currentPlayer: getNextPlayer(game) });
            break;

        case ActionType.WISH:
            // Set wished suit (Jack/Bube)
            if (wishedSuit !== undefined) {
                game.wishedSuit = wishedSuit;
            }
            break;
    }
}

// Get next player
function getNextPlayer(game: MauMauGame): 1 | 2 {
    if (game.direction === 1) {
        return game.currentPlayer === 1 ? 2 : 1;
    } else {
        return game.currentPlayer === 1 ? 2 : 1; // Same in 2-player
    }
}

// Helper: shuffle array
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// AI Logic with difficulty levels
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export class MauMauAI {
    // Main AI turn handler
    static playTurn(game: MauMauGame, difficulty: AIDifficulty = 'easy'): { played: boolean; cardIndex?: number; wishedSuit?: CardSuit } {
        switch (difficulty) {
            case 'easy':
                return this.playTurnEasy(game);
            case 'medium':
                return this.playTurnMedium(game);
            case 'hard':
                return this.playTurnHard(game);
            default:
                return this.playTurnEasy(game);
        }
    }

    // Easy AI: Plays random valid cards
    private static playTurnEasy(game: MauMauGame): { played: boolean; cardIndex?: number; wishedSuit?: CardSuit } {
        const aiPlayer = game.players.player2;
        const playableCards: number[] = [];

        // Find playable cards
        aiPlayer.hand.forEach((card, index) => {
            if (canPlayCard(card, game.currentCard, game.wishedSuit)) {
                playableCards.push(index);
            }
        });

        // No playable cards - must draw
        if (playableCards.length === 0) {
            return { played: false };
        }

        // Play random playable card
        const randomIndex = playableCards[Math.floor(Math.random() * playableCards.length)];
        const card = aiPlayer.hand[randomIndex];

        // If it's a Jack (wish card), choose random suit
        let wishedSuit: CardSuit | undefined;
        if (card.actionType === ActionType.WISH) {
            const suits = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS];
            wishedSuit = suits[Math.floor(Math.random() * suits.length)];
        }

        // Check if AI should say "Mau"
        if (aiPlayer.hand.length === 2 && !aiPlayer.saidMau) {
            game.players.player2.saidMau = true;
        }

        return { played: true, cardIndex: randomIndex, wishedSuit };
    }

    // Medium AI: Prioritizes action cards and makes smarter suit choices
    private static playTurnMedium(game: MauMauGame): { played: boolean; cardIndex?: number; wishedSuit?: CardSuit } {
        const aiPlayer = game.players.player2;
        const playableCards: number[] = [];

        aiPlayer.hand.forEach((card, index) => {
            if (canPlayCard(card, game.currentCard, game.wishedSuit)) {
                playableCards.push(index);
            }
        });

        if (playableCards.length === 0) {
            return { played: false };
        }

        // Prioritize action cards
        const actionCardIndices = playableCards.filter(i => aiPlayer.hand[i].isAction);
        const normalCardIndices = playableCards.filter(i => !aiPlayer.hand[i].isAction);

        let chosenIndex: number;
        if (actionCardIndices.length > 0) {
            // 70% chance to play action card if available
            if (Math.random() < 0.7) {
                chosenIndex = actionCardIndices[Math.floor(Math.random() * actionCardIndices.length)];
            } else {
                chosenIndex = normalCardIndices.length > 0
                    ? normalCardIndices[Math.floor(Math.random() * normalCardIndices.length)]
                    : actionCardIndices[Math.floor(Math.random() * actionCardIndices.length)];
            }
        } else {
            chosenIndex = playableCards[Math.floor(Math.random() * playableCards.length)];
        }

        const card = aiPlayer.hand[chosenIndex];

        // Smarter suit choice: Pick most common suit in hand
        let wishedSuit: CardSuit | undefined;
        if (card.actionType === ActionType.WISH) {
            const suitCounts = new Map<CardSuit, number>();
            aiPlayer.hand.forEach(c => {
                const count = suitCounts.get(c.suit) || 0;
                suitCounts.set(c.suit, count + 1);
            });

            let maxCount = 0;
            let bestSuit = CardSuit.HEARTS;
            suitCounts.forEach((count, suit) => {
                if (count > maxCount) {
                    maxCount = count;
                    bestSuit = suit;
                }
            });
            wishedSuit = bestSuit;
        }

        if (aiPlayer.hand.length === 2 && !aiPlayer.saidMau) {
            game.players.player2.saidMau = true;
        }

        return { played: true, cardIndex: chosenIndex, wishedSuit };
    }

    // Hard AI: Strategic play - blocks opponent, maximizes damage
    private static playTurnHard(game: MauMauGame): { played: boolean; cardIndex?: number; wishedSuit?: CardSuit } {
        const aiPlayer = game.players.player2;
        const opponentPlayer = game.players.player1;
        const playableCards: number[] = [];

        aiPlayer.hand.forEach((card, index) => {
            if (canPlayCard(card, game.currentCard, game.wishedSuit)) {
                playableCards.push(index);
            }
        });

        if (playableCards.length === 0) {
            return { played: false };
        }

        // Strategy: Prioritize based on game state
        let chosenIndex: number;

        // If opponent has few cards, play aggressively (action cards)
        if (opponentPlayer.hand.length <= 3) {
            const actionCards = playableCards.filter(i => aiPlayer.hand[i].isAction);
            if (actionCards.length > 0) {
                // Prioritize DRAW_TWO (7) and SKIP (8) to slow opponent
                const drawTwoCards = actionCards.filter(i => aiPlayer.hand[i].actionType === ActionType.DRAW_TWO);
                const skipCards = actionCards.filter(i => aiPlayer.hand[i].actionType === ActionType.SKIP);

                if (drawTwoCards.length > 0) {
                    chosenIndex = drawTwoCards[0];
                } else if (skipCards.length > 0) {
                    chosenIndex = skipCards[0];
                } else {
                    chosenIndex = actionCards[0];
                }
            } else {
                chosenIndex = playableCards[Math.floor(Math.random() * playableCards.length)];
            }
        } else {
            // Regular play: Save action cards for later, play normal cards
            const normalCards = playableCards.filter(i => !aiPlayer.hand[i].isAction);
            if (normalCards.length > 0) {
                chosenIndex = normalCards[Math.floor(Math.random() * normalCards.length)];
            } else {
                chosenIndex = playableCards[Math.floor(Math.random() * playableCards.length)];
            }
        }

        const card = aiPlayer.hand[chosenIndex];

        // Smart wish: Choose suit that opponent likely doesn't have
        let wishedSuit: CardSuit | undefined;
        if (card.actionType === ActionType.WISH) {
            // Count our suits
            const suitCounts = new Map<CardSuit, number>();
            aiPlayer.hand.forEach(c => {
                const count = suitCounts.get(c.suit) || 0;
                suitCounts.set(c.suit, count + 1);
            });

            // Pick the suit we have most of (aggressive blocking)
            let maxCount = 0;
            let bestSuit = CardSuit.SPADES; // Default to a common suit
            suitCounts.forEach((count, suit) => {
                if (count > maxCount) {
                    maxCount = count;
                    bestSuit = suit;
                }
            });
            wishedSuit = bestSuit;
        }

        if (aiPlayer.hand.length === 2 && !aiPlayer.saidMau) {
            game.players.player2.saidMau = true;
        }

        return { played: true, cardIndex: chosenIndex, wishedSuit };
    }
}

// Calculate rewards
export function calculateRewards(game: MauMauGame, winnerUid: string): { coins: number; xp: number } {
    const duration = (game.finishedAt! - game.startedAt) / 1000; // seconds
    const baseCoins = game.mode === 'ai' ? 150 : 250;
    const baseXP = game.mode === 'ai' ? 75 : 125;

    // Bonus for quick win
    const speedBonus = duration < 120 ? 1.5 : 1.0;

    return {
        coins: Math.floor(baseCoins * speedBonus),
        xp: Math.floor(baseXP * speedBonus)
    };
}
