# Skat Mau Mau - Implementation Plan

## Overview
Implementation of the classic Mau Mau card game using standard Skat cards (32 cards).

---

## Game Modes

### 1. Singleplayer (vs AI)
- Play against a computer opponent.
- Simple AI logic initially.

### 2. Multiplayer (vs Player) - *Future Phase*
- Real-time play using Firebase.

---

## Core Game Logic

### Card Structure
```typescript
enum Suit {
  HERZ = 'herz',   // Hearts
  KARO = 'karo',   // Diamonds
  KREUZ = 'kreuz', // Clubs
  PIK = 'pik'      // Spades
}

enum Rank {
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  BUBE = 'bube',   // Jack
  DAME = 'dame',   // Queen
  KOENIG = 'koenig', // King
  ASS = 'ass'      // Ace
}

interface SkatCard {
  id: string;
  suit: Suit;
  rank: Rank;
  imagePath: string;
}
```

### Rules
- **Matching:** Same Suit or Same Rank.
- **7:** Next player must draw 2 cards. (If they have a 7, they can play it to pass the penalty to the next player - optional, let's start simple: draw 2 and turn ends).
- **8:** Skip next player.
- **Bube (Jack):** Wild card. Can be played on anything (except maybe another Jack). Player wishes a suit.
- **Winning:** First player to empty their hand wins.

### Game State
```typescript
interface SkatMauMauGame {
  deck: SkatCard[];
  discardPile: SkatCard[];
  currentCard: SkatCard;
  players: {
    human: SkatCard[];
    ai: SkatCard[];
  };
  currentPlayer: 'human' | 'ai';
  wishSuit: Suit | null; // If a Jack was played
  drawPenalty: number;   // Accumulated cards to draw (from 7s)
  gameOver: boolean;
  winner: 'human' | 'ai' | null;
}
```

---

## Implementation Phases

### Phase 1: Core Logic & Assets
- [x] Define card data structure and load assets.
- [x] Implement game state management (deck shuffling, dealing, drawing).
- [x] Implement rules (valid moves, special card effects).
- [x] Basic AI (plays first valid card).

### Phase 2: UI Implementation
- [x] Display player hand.
- [x] Display opponent hand (card backs).
- [x] Display draw pile and discard pile.
- [x] Suit selection UI for Jack.
- [x] Game over screen.

### Phase 3: Polish
- [x] Animations for card movements.
- [x] Sound effects.
- [x] Improved AI.
- [x] Dark Mode UI (App consistent).
- [x] Global Friends System.
- [x] Changelog & Version Bump.

---

## Assets Mapping
/Users/kewa/Downloads/leximix/assets/skat_karten/
- herz_7.png, herz_8.png, ...
- karo_7.png, ...
- kreuz_7.png, ...
- pik_7.png, ...
