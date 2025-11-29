// Utility for full playing card deck assets (52 cards + jokers)
// Used by MauMau and Rummy games

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

// Map suit to German filename prefix
const SUIT_MAP: Record<Suit, string> = {
    'hearts': 'herz',
    'diamonds': 'karo',
    'clubs': 'kreuz',
    'spades': 'pik'
};

// Map card value to German filename suffix
const VALUE_MAP: Record<CardValue, string> = {
    1: 'ass',      // Ace
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: 'bube',    // Jack
    12: 'dame',    // Queen
    13: 'koenig'   // King
};

// Get the asset path for a playing card
export function getPlayingCardAssetPath(suit: Suit, value: CardValue): string {
    const suitName = SUIT_MAP[suit];
    const valueName = VALUE_MAP[value];
    return `/assets/playing_cards/${suitName}_${valueName}.png`;
}

// Get joker asset path
export function getJokerAssetPath(color: 'black' | 'red'): string {
    return `/assets/playing_cards/joker_${color === 'black' ? 'schwarz' : 'rot'}.png`;
}

// Get card back asset path
export function getCardBackAssetPath(): string {
    return '/assets/playing_cards/card_back.png';
}

// Simplified interface for card with image
export interface PlayingCardWithImage {
    suit: Suit;
    value: CardValue;
    id: string;
    imagePath: string;
}

// Create a card object with image path
export function createCardWithImage(suit: Suit, value: CardValue): PlayingCardWithImage {
    return {
        suit,
        value,
        id: `${suit}-${value}`,
        imagePath: getPlayingCardAssetPath(suit, value)
    };
}

// Create a full deck (52 cards)
export function createFullDeckWithImages(): PlayingCardWithImage[] {
    const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const deck: PlayingCardWithImage[] = [];
    
    for (const suit of suits) {
        for (let value = 1; value <= 13; value++) {
            deck.push(createCardWithImage(suit, value as CardValue));
        }
    }
    
    return deck;
}
