# Implementation Plan: New Game Modes (Checkers, Scrabble, Rummy) & Enhanced Multiplayer

This plan outlines the step-by-step implementation of three new game modes: **Checkers (Dame)**, **Scrabble**, and **Rummy (Rommé)**. It also includes a significant enhancement to the multiplayer system to support random matchmaking in addition to friend invites.

All new modes will support:
- **Singleplayer**: Campaign with 150 levels (increasing difficulty).
- **Multiplayer**: Friend invites AND Random Matchmaking.
- **Languages**: English (EN), German (DE), Spanish (ES).
- **Neo-Brutalist Design**: Consistent with the existing app aesthetic.

---

## Phase 1: Multiplayer Random Matchmaking System
Before adding new games, we need to upgrade the multiplayer infrastructure to support random matchmaking.

- [ ] **Database Schema Update**
    - [ ] Create `matchmakingQueue/{gameMode}` node in Firebase.
    - [ ] Define queue entry structure: `{ userId, timestamp, mmr/level, language }`.
- [ ] **Backend Logic (Client-Side Handling)**
    - [ ] Implement `joinQueue(gameMode)` function: Adds user to the queue and listens for a match.
    - [ ] Implement `findMatch(gameMode)` logic: Checks queue for an available opponent.
    - [ ] If opponent found -> Create game -> Remove both from queue -> Redirect to game.
    - [ ] If no opponent -> Wait in queue.
- [ ] **UI Updates**
    - [ ] Update `MultiplayerLobby`: Add "Find Random Opponent" button alongside "Invite Friend".
    - [ ] Add "Searching for opponent..." loading screen with cancel button.

---

## Phase 2: Checkers (Dame) Implementation
**Position**: Right of Chess in the menu.

### 2.1 Core Game Logic
- [ ] **Game Engine**
    - [ ] Create `utils/checkersEngine.ts`: Board representation (8x8), movement rules, capture logic (forced jumps?), king promotion.
    - [ ] Implement `isValidMove`, `makeMove`, `isGameOver`, `getWinner`.
- [ ] **AI Opponent**
    - [ ] Create `utils/checkersAI.ts`.
    - [ ] Implement Minimax with Alpha-Beta pruning (similar to Chess but optimized for Checkers).
    - [ ] Implement difficulty scaling (Depth 1-6) mapped to 150 levels.

### 2.2 UI & Components
- [ ] **Component Creation**
    - [ ] Create `components/CheckersGame.tsx`.
    - [ ] Design board (8x8, alternating colors).
    - [ ] Design pieces (Simple circles with Neo-Brutalist borders/shadows). Kings get a crown icon.
    - [ ] Add animations for moves and captures.
- [ ] **Integration**
    - [ ] Add `CHECKERS` to `GameMode` enum in `types.ts`.
    - [ ] Add translations (DE: Dame, EN: Checkers, ES: Damas) in `constants.ts`.
    - [ ] Add `GameCard` for Checkers in `App.tsx` (renderHome).
    - [ ] Add Checkers routing in `App.tsx` (`renderGame`).

### 2.3 Singleplayer Campaign
- [ ] **Level Design**
    - [ ] Define logic for 150 levels in `utils/levelData.ts` (or procedural generation based on ID).
    - [ ] Level 1-10: Easy AI.
    - [ ] Level 11-50: Medium AI.
    - [ ] Level 51-100: Hard AI.
    - [ ] Level 101-150: Expert/Master AI + Time limits?

### 2.4 Multiplayer Integration
- [ ] **Firebase Integration**
    - [ ] Implement `initializeCheckersGame` in `utils/multiplayerGame.ts`.
    - [ ] Sync moves, turn, board state, and captures.
    - [ ] Handle "Random Match" for Checkers.

---

## Phase 3: Scrabble (Word Builder) Implementation
**Position**: Right of Checkers.

### 3.1 Core Game Logic
- [ ] **Game Engine**
    - [ ] Create `utils/scrabbleEngine.ts`.
    - [ ] Board layout (15x15) with bonus squares (DL, TL, DW, TW).
    - [ ] Tile bag logic (distribution of letters per language).
    - [ ] Move validation: Dictionary check, placement rules (connected, crosswords).
    - [ ] Scoring system calculation.
- [ ] **Dictionary Integration**
    - [ ] Integrate efficient dictionary lookup for EN, DE, ES. (Re-use existing word lists if possible or fetch larger ones).

### 3.2 AI Opponent
- [ ] **AI Logic**
    - [ ] Implement AI that finds valid moves from a rack.
    - [ ] Difficulty scaling:
        - [ ] Easy: Low score moves, simple words.
        - [ ] Hard: Maximizes bonus squares, uses large vocabulary.

### 3.3 UI & Components
- [ ] **Component Creation**
    - [ ] Create `components/ScrabbleGame.tsx`.
    - [ ] Design Board Grid with bonus labels.
    - [ ] Design Tile Rack (draggable tiles).
    - [ ] Design "Exchange Tiles" and "Pass" controls.
- [ ] **Integration**
    - [ ] Add `SCRABBLE` to `GameMode` enum.
    - [ ] Add translations.
    - [ ] Add `GameCard` in `App.tsx`.

### 3.4 Singleplayer & Multiplayer
- [ ] **Campaign**: 150 Levels (Score targets to beat AI, or specific challenges like "Use X letter").
- [ ] **Multiplayer**: Turn-based sync via Firebase. Handle tile bag sync carefully (server-side or host-managed to prevent cheating, simplistic host-managed for now).

---

## Phase 4: Rummy (Rommé) Implementation
**Position**: Right of Scrabble.

### 4.1 Core Game Logic
- [ ] **Game Engine**
    - [ ] Create `utils/rummyEngine.ts`.
    - [ ] Deck logic (2 decks + Jokers).
    - [ ] Meld validation (Sets/Groups and Runs/Sequences).
    - [ ] "Initial Meld" rule (e.g., must equal 30/40 points).
    - [ ] Drawing (Draw pile or Discard pile) and Discarding logic.
- [ ] **AI Opponent**
    - [ ] Implement AI capable of sorting hand and finding optimal melds.

### 4.2 UI & Components
- [ ] **Component Creation**
    - [ ] Create `components/RummyGame.tsx`.
    - [ ] Design Card UI (re-use or adapt MauMau cards).
    - [ ] Design Table area for laying down melds.
    - [ ] Hand sorting/grouping UI.
- [ ] **Integration**
    - [ ] Add `RUMMY` to `GameMode` enum.
    - [ ] Add translations.
    - [ ] Add `GameCard`.

### 4.3 Singleplayer & Multiplayer
- [ ] **Campaign**: 150 Levels (Win against AI with varying skill/luck factors).
- [ ] **Multiplayer**: Real-time sync.

---

## Phase 5: Final Polish & Deployment
- [ ] **Testing**
    - [ ] Test all 3 new modes in Singleplayer (Win/Loss states, AI behavior).
    - [ ] Test Multiplayer Friend Invites for all 3.
    - [ ] Test Random Matchmaking for all supported modes.
- [ ] **Asset Optimization**
    - [ ] Ensure icons/assets are optimized.
- [x] **Deployment**
    - [x] Build production version.
    - [x] Update changelog.
    - [x] Deploy to Ionos.
