# Letter Mau Mau - Implementation Plan

## Overview
Klassisches Mau Mau Kartenspiel mit Buchstaben, spielbar gegen KI oder echte Spieler (Multiplayer).

---

## Game Modes

### 1. Singleplayer (vs KI)
- Sofort spielbar
- 3 Schwierigkeiten: Easy, Medium, Hard
- Offline-fähig
- Rewards: Coins + XP

### 2. Multiplayer (vs Spieler)
- Firebase Realtime Database für Live-Matches
- Freunde oder zufällige Gegner
- Ranked & Casual Modes
- Bessere Rewards

---

## Core Game Logic

### Card Structure
```typescript
enum CardCategory {
  VOWEL = 'vowel',        // 🔴 A, E, I, O, U
  COMMON = 'common',      // 🔵 N, R, S, T, L, D, H
  MEDIUM = 'medium',      // 🟢 M, G, B, F, W, K, P, V, Z
  RARE = 'rare'           // 🟡 C, J, Q, X, Y
}

enum CardRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

interface Card {
  id: string;
  letter: string;           // A-Z
  category: CardCategory;
  isAction: boolean;        // W, Z, S, A
  actionType?: 'wish' | 'draw2' | 'skip' | 'reverse';
  rarity: CardRarity;
}
```

### Game State
```typescript
interface MauMauGame {
  gameId: string;
  mode: 'ai' | 'multiplayer';
  
  // Players
  players: {
    player1: {
      uid: string;
      username: string;
      hand: Card[];
      saidMau: boolean;
    };
    player2: {
      uid: string | 'AI';
      username: string;
      hand: Card[];
      saidMau: boolean;
    };
  };
  
  // Game state
  deck: Card[];              // Draw pile
  discardPile: Card[];       // Played cards
  currentCard: Card;         // Top card
  currentPlayer: 1 | 2;
  direction: 1 | -1;         // For reverse
  wishCategory?: CardCategory; // When W played
  
  // Match info
  status: 'waiting' | 'active' | 'finished';
  winner?: string;
  startedAt: number;
  finishedAt?: number;
}
```

### Game Rules Engine
```typescript
class MauMauRules {
  // Check if card can be played
  static canPlay(card: Card, currentCard: Card, wishCategory?: CardCategory): boolean {
    // Action cards always playable
    if (card.isAction) return true;
    
    // If category wished, must match
    if (wishCategory) {
      return card.category === wishCategory;
    }
    
    // Same letter or same category
    return card.letter === currentCard.letter || 
           card.category === currentCard.category;
  }
  
  // Execute action card effects
  static executeAction(game: MauMauGame, card: Card): void {
    switch (card.actionType) {
      case 'draw2':
        // Next player draws 2
        break;
      case 'skip':
        // Skip next player
        break;
      case 'reverse':
        game.direction *= -1;
        break;
      case 'wish':
        // Player chooses category
        break;
    }
  }
}
```

---

## AI Implementation

### AI Difficulty Levels

```typescript
class MauMauAI {
  static playTurn(game: MauMauGame, difficulty: 'easy' | 'medium' | 'hard'): Card | null {
    const aiHand = game.players.player2.hand;
    const playableCards = aiHand.filter(c => 
      MauMauRules.canPlay(c, game.currentCard, game.wishCategory)
    );
    
    if (playableCards.length === 0) return null; // Must draw
    
    switch (difficulty) {
      case 'easy':
        return this.playEasy(playableCards);
      case 'medium':
        return this.playMedium(playableCards, game);
      case 'hard':
        return this.playHard(playableCards, game);
    }
  }
  
  private static playEasy(cards: Card[]): Card {
    // Random card
    return cards[Math.floor(Math.random() * cards.length)];
  }
  
  private static playMedium(cards: Card[], game: MauMauGame): Card {
    // Prioritize action cards
    const actionCards = cards.filter(c => c.isAction);
    if (actionCards.length > 0) {
      return actionCards[0];
    }
    return cards[0];
  }
  
  private static playHard(cards: Card[], game: MauMauGame): Card {
    // Optimal strategy:
    // 1. Play action cards when beneficial
    // 2. Save matching cards for later
    // 3. Get rid of high-value cards
    // 4. Card counting
    
    // Complex algorithm here...
    return cards[0]; // Placeholder
  }
}
```

---

## Multiplayer System

### Firebase Structure

```
/maumau/
  /lobbies/
    /{lobbyId}/
      type: 'ranked' | 'casual' | 'friend'
      hostUid: string
      guestUid: string | null
      status: 'waiting' | 'full' | 'playing'
      createdAt: timestamp
      
  /games/
    /{gameId}/
      // MauMauGame structure
      
  /friends/
    /{uid}/
      /requests/
        /{fromUid}/
          username: string
          status: 'pending' | 'accepted' | 'rejected'
          timestamp: number
      /list/
        /{friendUid}: true
        
  /online/
    /{uid}: timestamp  // Last activity
```

### Matchmaking Flow

```typescript
// 1. Create/Join Lobby
async function createLobby(type: 'ranked' | 'casual' | 'friend'): Promise<string> {
  const lobbyRef = ref(database, `maumau/lobbies/${generateId()}`);
  await set(lobbyRef, {
    type,
    hostUid: auth.currentUser!.uid,
    guestUid: null,
    status: 'waiting',
    createdAt: Date.now()
  });
  return lobbyRef.key!;
}

// 2. Join Lobby
async function joinLobby(lobbyId: string): Promise<void> {
  const lobbyRef = ref(database, `maumau/lobbies/${lobbyId}`);
  await update(lobbyRef, {
    guestUid: auth.currentUser!.uid,
    status: 'full'
  });
}

// 3. Start Game
async function startGame(lobbyId: string): Promise<void> {
  const lobby = await get(ref(database, `maumau/lobbies/${lobbyId}`));
  const gameId = generateId();
  
  const game: MauMauGame = {
    gameId,
    mode: 'multiplayer',
    players: {
      player1: {
        uid: lobby.val().hostUid,
        username: await getUsername(lobby.val().hostUid),
        hand: dealCards(7),
        saidMau: false
      },
      player2: {
        uid: lobby.val().guestUid,
        username: await getUsername(lobby.val().guestUid),
        hand: dealCards(7),
        saidMau: false
      }
    },
    deck: generateDeck(),
    discardPile: [],
    currentCard: drawCard(),
    currentPlayer: 1,
    direction: 1,
    status: 'active',
    startedAt: Date.now()
  };
  
  await set(ref(database, `maumau/games/${gameId}`), game);
  await update(lobbyRef, { status: 'playing', gameId });
}

// 4. Listen to Game Updates
function subscribeToGame(gameId: string, callback: (game: MauMauGame) => void): void {
  const gameRef = ref(database, `maumau/games/${gameId}`);
  onValue(gameRef, (snapshot) => {
    callback(snapshot.val());
  });
}
```

### Turn-Based System

```typescript
async function playCard(gameId: string, cardIndex: number): Promise<void> {
  const gameRef = ref(database, `maumau/games/${gameId}`);
  const snapshot = await get(gameRef);
  const game: MauMauGame = snapshot.val();
  
  // Validate turn
  const myUid = auth.currentUser!.uid;
  const isMyTurn = (game.currentPlayer === 1 && game.players.player1.uid === myUid) ||
                   (game.currentPlayer === 2 && game.players.player2.uid === myUid);
  
  if (!isMyTurn) {
    throw new Error('Not your turn!');
  }
  
  // Get card and validate
  const playerKey = game.currentPlayer === 1 ? 'player1' : 'player2';
  const card = game.players[playerKey].hand[cardIndex];
  
  if (!MauMauRules.canPlay(card, game.currentCard, game.wishCategory)) {
    throw new Error('Invalid card!');
  }
  
  // Play card
  game.players[playerKey].hand.splice(cardIndex, 1);
  game.discardPile.push(card);
  game.currentCard = card;
  
  // Execute action
  if (card.isAction) {
    MauMauRules.executeAction(game, card);
  }
  
  // Check win
  if (game.players[playerKey].hand.length === 0) {
    game.status = 'finished';
    game.winner = myUid;
    game.finishedAt = Date.now();
    await awardRewards(game);
  } else {
    // Next turn
    game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
  }
  
  await set(gameRef, game);
}
```

---

## Friends System

### Friend Request Flow

```typescript
// Send friend request
async function sendFriendRequest(targetUsername: string): Promise<void> {
  const myUid = auth.currentUser!.uid;
  const myUsername = await getMyUsername();
  
  // Find user by username
  const targetUid = await findUserByUsername(targetUsername);
  if (!targetUid) {
    throw new Error('User not found');
  }
  
  // Create request
  const requestRef = ref(database, `maumau/friends/${targetUid}/requests/${myUid}`);
  await set(requestRef, {
    username: myUsername,
    status: 'pending',
    timestamp: Date.now()
  });
}

// Accept friend request
async function acceptFriendRequest(fromUid: string): Promise<void> {
  const myUid = auth.currentUser!.uid;
  
  // Update request status
  await update(ref(database, `maumau/friends/${myUid}/requests/${fromUid}`), {
    status: 'accepted'
  });
  
  // Add to friend lists (both ways)
  await set(ref(database, `maumau/friends/${myUid}/list/${fromUid}`), true);
  await set(ref(database, `maumau/friends/${fromUid}/list/${myUid}`), true);
}

// Get friend list
async function getFriends(): Promise<Friend[]> {
  const myUid = auth.currentUser!.uid;
  const friendsRef = ref(database, `maumau/friends/${myUid}/list`);
  const snapshot = await get(friendsRef);
  
  if (!snapshot.exists()) return [];
  
  const friendUids = Object.keys(snapshot.val());
  const friends: Friend[] = [];
  
  for (const uid of friendUids) {
    const username = await getUsername(uid);
    const isOnline = await checkOnline(uid);
    friends.push({ uid, username, isOnline });
  }
  
  return friends;
}

// Challenge friend
async function challengeFriend(friendUid: string): Promise<string> {
  const lobbyId = await createLobby('friend');
  
  // Send notification to friend
  await set(ref(database, `maumau/challenges/${friendUid}/${lobbyId}`), {
    from: auth.currentUser!.uid,
    fromUsername: await getMyUsername(),
    lobbyId,
    timestamp: Date.now()
  });
  
  return lobbyId;
}
```

---

## UI Components

### 1. Main Menu
```
┌─────────────────────────────────┐
│  🎴 LETTER MAU MAU              │
│                                 │
│  [🤖 VS KI]                     │
│  [👥 MULTIPLAYER]               │
│  [👫 FREUNDE]                   │
│  [📦 KARTEN PACKS]              │
│  [🏆 RANGLISTE]                 │
│                                 │
│  [← ZURÜCK]                     │
└─────────────────────────────────┘
```

### 2. KI Mode Selection
```
┌─────────────────────────────────┐
│  GEGNER WÄHLEN                  │
│                                 │
│  [🟢 EINFACH]                   │
│  Perfekt zum Lernen             │
│                                 │
│  [🟡 MITTEL]                    │
│  Faire Herausforderung          │
│                                 │
│  [🔴 SCHWER]                    │
│  Für Profis                     │
│  +50% Rewards                   │
│                                 │
│  [← ZURÜCK]                     │
└─────────────────────────────────┘
```

### 3. Multiplayer Lobby
```
┌─────────────────────────────────┐
│  MULTIPLAYER                    │
│                                 │
│  [⚡ SCHNELLSPIEL]              │
│  Zufälliger Gegner              │
│                                 │
│  [🏆 RANKED]                    │
│  Um Punkte spielen              │
│                                 │
│  [👫 FREUND HERAUSFORDERN]      │
│  Spiel mit Freunden             │
│                                 │
│  AKTIVE SPIELE: 127             │
│  ONLINE SPIELER: 1,432          │
│                                 │
│  [← ZURÜCK]                     │
└─────────────────────────────────┘
```

### 4. Friends List
```
┌─────────────────────────────────┐
│  FREUNDE (12)                   │
│                                 │
│  🟢 MaxMustermann   [⚔️ 1v1]    │
│  🟢 WordNinja_99    [⚔️ 1v1]    │
│  ⚫ CoolPlayer123               │
│  🟢 LetterKing      [⚔️ 1v1]    │
│                                 │
│  ANFRAGEN (2)                   │
│  NewPlayer42  [✓ ✗]            │
│  ProGamer_XY  [✓ ✗]            │
│                                 │
│  [➕ FREUND HINZUFÜGEN]         │
│  [← ZURÜCK]                     │
└─────────────────────────────────┘
```

### 5. Game Screen
```
┌─────────────────────────────────┐
│  MaxMustermann 🟢  [4 cards]    │
│     [🎴] [🎴] [🎴] [🎴]          │
│                                 │
│   Ablage     │    Nachziehen    │
│     [R]      │      [🎴]        │
│   🔵 Common  │                  │
│                                 │
│     [A] [E] [R] [S] [T]         │
│     🔴 🔴 🔵 🔵 🔵              │
│  YOU [5 cards]                  │
│                                 │
│  [SPIELEN] [ZIEHEN] [MAU] [💬]  │
└─────────────────────────────────┘
```

---

## Rewards System

### Match Rewards

**VS KI:**
```typescript
{
  easy: {
    win: { coins: 100, xp: 50 },
    loss: { coins: 25, xp: 10 }
  },
  medium: {
    win: { coins: 200, xp: 100 },
    loss: { coins: 40, xp: 20 }
  },
  hard: {
    win: { coins: 300, xp: 150 },
    loss: { coins: 50, xp: 25 }
  }
}
```

**Multiplayer:**
```typescript
{
  casual: {
    win: { coins: 250, xp: 125 },
    loss: { coins: 50, xp: 25 }
  },
  ranked: {
    win: { coins: 400, xp: 200, rp: +25 },
    loss: { coins: 75, xp: 35, rp: -10 }
  }
}
```

### Card Packs
```typescript
interface CardPack {
  type: 'bronze' | 'silver' | 'gold';
  cost: number;
  guaranteedCards: number;
  dropRates: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

const CARD_PACKS = {
  bronze: {
    cost: 100,
    guaranteedCards: 5,
    dropRates: { common: 70, rare: 25, epic: 5, legendary: 0 }
  },
  silver: {
    cost: 250,
    guaranteedCards: 7,
    dropRates: { common: 50, rare: 35, epic: 12, legendary: 3 }
  },
  gold: {
    cost: 500,
    guaranteedCards: 10,
    dropRates: { common: 30, rare: 40, epic: 20, legendary: 10 }
  }
};
```

---

## Implementation Phases

### Phase 1: Core Game (Week 1-2)
- [x] Card system & game logic
- [x] Basic UI components
- [x] KI opponent (Easy only)
- [x] Singleplayer mode
- [x] Basic rewards

### Phase 2: Multiplayer (Week 3-4)
- [ ] Firebase integration
- [ ] Lobby system
- [ ] Turn-based multiplayer
- [ ] Real-time sync
- [ ] Matchmaking

### Phase 3: Social Features (Week 5)
- [ ] Friends system
- [ ] Friend requests
- [ ] Online status
- [ ] Challenge friends
- [ ] Chat (optional)

### Phase 4: Progression (Week 6)
- [ ] Card packs
- [ ] Rarity system
- [ ] Collection management
- [ ] Custom decks
- [ ] Achievements

### Phase 5: Ranked & Polish (Week 7-8)
- [ ] Ranked mode
- [ ] Leaderboards
- [ ] Daily challenges
- [ ] Better KI (Medium, Hard)
- [ ] Animations & effects
- [ ] Sound effects

---

## Technical Stack

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Framer Motion (animations)

**Backend:**
- Firebase Realtime Database
- Firebase Authentication
- Cloud Functions (anti-cheat, validation)

**Assets:**
- Custom card designs
- Sound effects
- Particle effects

---

## Security & Anti-Cheat

### Server-Side Validation
```typescript
// Cloud Function to validate moves
export const validateMove = functions.database
  .ref('/maumau/games/{gameId}')
  .onUpdate(async (change, context) => {
    const before = change.before.val();
    const after = change.after.val();
    
    // Verify it's the correct player's turn
    // Verify the card is valid
    // Verify hand count
    // Detect suspicious patterns
    
    if (!isValidMove(before, after)) {
      await change.after.ref.set(before); // Revert
      await banPlayer(/* ... */);
    }
  });
```

---

## Testing Plan

**Unit Tests:**
- Card rules validation
- AI decision making
- Reward calculations

**Integration Tests:**
- Multiplayer flow
- Friend system
- Database sync

**Manual Testing:**
- Full game vs KI
- Full game vs player
- Edge cases (disconnects, etc.)

---

## Rollout Strategy

1. **Beta Test** (100 users)
   - Friends only
   - KI mode only initially
   - Collect feedback

2. **Soft Launch** (1000 users)
   - Add multiplayer
   - Monitor performance
   - Fix issues

3. **Full Release**
   - All features
   - Marketing push
   - Season Pass integration

---

## Success Metrics

**Engagement:**
- Games per day per user
- Average session length
- Retention (D1, D7, D30)

**Monetization:**
- Card pack purchases
- Season Pass conversions

**Social:**
- Friend requests sent/accepted
- Multiplayer game %
- Chat messages (if implemented)

---

## Future Enhancements

- **Tournaments** - Weekly events
- **Spectator Mode** - Watch friends play
- **Emotes** - Quick reactions
- **Card Trading** - P2P marketplace
- **Custom Rules** - House rules lobby
