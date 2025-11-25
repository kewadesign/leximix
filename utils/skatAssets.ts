import { Card, CardRank, CardSuit } from './maumau';

// Map internal suit to filename prefix
const SUIT_MAP: Record<CardSuit, string> = {
    [CardSuit.HEARTS]: 'herz',
    [CardSuit.DIAMONDS]: 'karo',
    [CardSuit.CLUBS]: 'kreuz',
    [CardSuit.SPADES]: 'pik'
};

// Map internal rank to filename suffix
const RANK_MAP: Record<CardRank, string> = {
    [CardRank.SEVEN]: '7',
    [CardRank.EIGHT]: '8',
    [CardRank.NINE]: '9',
    [CardRank.TEN]: '10',
    [CardRank.JACK]: 'bube',
    [CardRank.QUEEN]: 'dame',
    [CardRank.KING]: 'koenig',
    [CardRank.ACE]: 'ass'
};

export function getCardAssetPath(card: Card): string {
    const suit = SUIT_MAP[card.suit];
    const rank = RANK_MAP[card.rank];
    
    // Assuming assets are served from /assets/skat_karten/ relative to public or handled by import
    // In Vite/React, we usually import images or use a public path.
    // Since the user pointed to /Users/kewa/Downloads/leximix/assets/skat_karten, 
    // I need to make sure these are accessible to the app.
    // I will assume they are moved to public/assets/skat_karten or imported.
    
    // For now, I'll assume they will be in the public folder: /assets/skat_karten/
    return `/assets/skat_karten/${suit}_${rank}.png`;
}
