// Classic Mau Mau - Traditional Playing Cards

// Card Suits (Farben)
export enum CardSuit {
    SPADES = 0,   // Pik ♠
    HEARTS = 1,   // Herz ♥
    DIAMONDS = 2, // Karo ♦
    CLUBS = 3     // Kreuz ♣
}

// Card Ranks (Werte)
export enum CardRank {
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,   // Bube
    QUEEN = 12,  // Dame
    KING = 13,   // König
    ACE = 14     // As
}

// Action Types
export enum ActionType {
    NONE = 'none',
    DRAW_TWO = 'draw_two',    // 7
    SKIP = 'skip',             // 8
    WISH = 'wish'              // Bube (Jack)
}

// Card Interface
export interface Card {
    id: string;
    suit: CardSuit;
    rank: CardRank;
    points: number;
    isAction: boolean;
    actionType?: ActionType;
}

// Player Interface
export interface Player {
    uid: string;
    username: string;
    hand: Card[];
    saidMau: boolean;
}

// Game State
export interface MauMauGame {
    gameId: string;
    mode: 'ai' | 'multiplayer';
    players: {
        player1: Player;
        player2: Player;
    };
    deck: Card[];
    discardPile: Card[];
    currentCard: Card;
    currentPlayer: 1 | 2;
    direction: 1 | -1;
    wishedSuit?: CardSuit;
    status: 'active' | 'finished';
    winner?: string;
    startedAt: number;
    finishedAt?: number;
}

// Generate a standard 32-card deck (German style: 7-Ace, 4 suits)
export function generateDeck(): Card[] {
    const deck: Card[] = [];
    const suits = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS];
    const ranks = [CardRank.SEVEN, CardRank.EIGHT, CardRank.NINE, CardRank.TEN,
    CardRank.JACK, CardRank.QUEEN, CardRank.KING, CardRank.ACE];

    suits.forEach(suit => {
        ranks.forEach(rank => {
            let actionType: ActionType | undefined;
            let isAction = false;

            // Assign action types
            if (rank === CardRank.SEVEN) {
                actionType = ActionType.DRAW_TWO;
                isAction = true;
            } else if (rank === CardRank.EIGHT) {
                actionType = ActionType.SKIP;
                isAction = true;
            } else if (rank === CardRank.JACK) {
                actionType = ActionType.WISH;
                isAction = true;
            }

            deck.push({
                id: `${CardSuit[suit]}_${rank}`,
                suit,
                rank,
                points: rank >= CardRank.JACK ? 10 : rank,
                isAction,
                actionType
            });
        });
    });

    return shuffleDeck(deck);
}

// Shuffle deck
export function shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Draw cards from deck
export function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
    const drawn = deck.slice(0, count);
    const remaining = deck.slice(count);
    return { drawn, remaining };
}

// Check if a card can be played
export function canPlayCard(card: Card, currentCard: Card, wishedSuit?: CardSuit): boolean {
    // Jack (Bube) can always be played
    if (card.rank === CardRank.JACK) {
        return true;
    }

    // If a suit was wished, must match that suit (unless playing Jack)
    if (wishedSuit !== undefined) {
        return card.suit === wishedSuit;
    }

    // Otherwise, must match suit or rank
    return card.suit === currentCard.suit || card.rank === currentCard.rank;
}

// Helper: Get suit color (for styling)
export function getSuitColor(suit: CardSuit): string {
    switch (suit) {
        case CardSuit.SPADES:
        case CardSuit.CLUBS:
            return '#000000'; // Black
        case CardSuit.HEARTS:
        case CardSuit.DIAMONDS:
            return '#DC143C'; // Crimson red
    }
}

// Helper: Get suit symbol
export function getSuitSymbol(suit: CardSuit): string {
    switch (suit) {
        case CardSuit.SPADES: return '♠';
        case CardSuit.HEARTS: return '♥';
        case CardSuit.DIAMONDS: return '♦';
        case CardSuit.CLUBS: return '♣';
    }
}

// Helper: Get rank name (for display)
export function getRankName(rank: CardRank, lang: 'en' | 'de' | 'es' = 'de'): string {
    if (lang === 'de') {
        switch (rank) {
            case CardRank.SEVEN: return '7';
            case CardRank.EIGHT: return '8';
            case CardRank.NINE: return '9';
            case CardRank.TEN: return '10';
            case CardRank.JACK: return 'Bube';
            case CardRank.QUEEN: return 'Dame';
            case CardRank.KING: return 'König';
            case CardRank.ACE: return 'As';
        }
    } else if (lang === 'en') {
        switch (rank) {
            case CardRank.SEVEN: return '7';
            case CardRank.EIGHT: return '8';
            case CardRank.NINE: return '9';
            case CardRank.TEN: return '10';
            case CardRank.JACK: return 'Jack';
            case CardRank.QUEEN: return 'Queen';
            case CardRank.KING: return 'King';
            case CardRank.ACE: return 'Ace';
        }
    } else { // es
        switch (rank) {
            case CardRank.SEVEN: return '7';
            case CardRank.EIGHT: return '8';
            case CardRank.NINE: return '9';
            case CardRank.TEN: return '10';
            case CardRank.JACK: return 'Sota';
            case CardRank.QUEEN: return 'Reina';
            case CardRank.KING: return 'Rey';
            case CardRank.ACE: return 'As';
        }
    }
}

// Helper: Get suit name
export function getSuitName(suit: CardSuit, lang: 'en' | 'de' | 'es' = 'de'): string {
    if (lang === 'de') {
        switch (suit) {
            case CardSuit.SPADES: return 'Pik';
            case CardSuit.HEARTS: return 'Herz';
            case CardSuit.DIAMONDS: return 'Karo';
            case CardSuit.CLUBS: return 'Kreuz';
        }
    } else if (lang === 'en') {
        switch (suit) {
            case CardSuit.SPADES: return 'Spades';
            case CardSuit.HEARTS: return 'Hearts';
            case CardSuit.DIAMONDS: return 'Diamonds';
            case CardSuit.CLUBS: return 'Clubs';
        }
    } else { // es
        switch (suit) {
            case CardSuit.SPADES: return 'Picas';
            case CardSuit.HEARTS: return 'Corazones';
            case CardSuit.DIAMONDS: return 'Diamantes';
            case CardSuit.CLUBS: return 'Tréboles';
        }
    }
}
