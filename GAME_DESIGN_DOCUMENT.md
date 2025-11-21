
# LexiMix - Game Design Document

**Version:** 1.1  
**Platform:** Web (PWA/React), Mobile Optimized  
**Genre:** Puzzle / Word Game / RPG Elements  
**Target Audience:** Ages 12+, Word Game Enthusiasts, Completionists

---

## 1. Executive Summary

**LexiMix** is a high-fidelity, modern word puzzle game that evolves the standard "Wordle" formula. It introduces RPG-like progression, a Season Pass system, and multiple game modes ranging from relaxed to time-attack. 

The core aesthetic is "Cyber-Noir" – dark backgrounds, neon accents (Fuchsia/Cyan/Gold), glassmorphism, and fluid animations.

---

## 2. Core Gameplay Loop

1.  **Home:** Player views Season Rank, Avatar, and selects a Game Mode.
2.  **Mode Selection:** Player chooses a mode (Classic, Speedrun, etc.).
3.  **Level Selection:** Player selects a level from 5 Tiers of difficulty.
4.  **Game Phase:**
    *   Player guesses a word based on Topic and Description.
    *   Letters provide feedback (Green/Yellow/Gray).
    *   Hints can be purchased by watching "Ads" (simulated).
5.  **Resolution:**
    *   **Win:** Earn XP, Stars, unlock next level.
    *   **Loss:** Retry or return to menu.
6.  **Progression:** XP levels up the Season Pass, unlocking cosmetic rewards.

---

## 3. Game Modes

### 3.1 Classic Mode
*   **Objective:** Guess the word in 6 tries.
*   **Constraint:** None.
*   **Difficulty:** Standard.

### 3.2 Speedrun Mode
*   **Objective:** Guess the word before the timer runs out.
*   **Constraint:** Time limit based on word length (e.g., 4s-8s).
*   **Pressure:** Timer resets on correct guess, but fails level if it hits 0.

### 3.3 Chain Mode
*   **Objective:** Guess a word where the previous answer provides a clue.
*   **Constraint:** The previous word is displayed as the "Chain Link".

### 3.4 Category Mode (Themen-Rätsel)
*   **Objective:** Guess words strictly related to a specific topic.
*   **Helper:** Topic is displayed prominently.

### 3.5 Letter Sudoku (Buchstaben-Sudoku)
*   **Objective:** Fill a 9x9 grid with letters A-I.
*   **Constraint:** No letter can repeat in a row, column, or 3x3 subgrid.
*   **Difficulty:** Controlled by the number of pre-filled cells (Tiers remove more cells).

---

## 4. Progression & Difficulty Tiers

The game features **5 Tiers** of difficulty. Each tier contains **50 Levels**, totaling 250+ levels per mode.

| Tier | Levels | Name (EN/DE) | Color | Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **1** | 1-50 | Beginner / Anfänger | Green | Common words, 4-5 letters. Sudoku: Easy. |
| **2** | 51-100 | Learner / Fortgeschritten | Cyan | Common words, 5-6 letters. Sudoku: Moderate. |
| **3** | 101-150 | Skilled / Erfahren | Blue | Abstract concepts, 6-7 letters. Sudoku: Hard. |
| **4** | 151-200 | Expert / Experte | Purple | Scientific/Academic terms. Sudoku: Very Hard. |
| **5** | 201+ | Master / Meister | Red | Rare, archaic, or complex words. Sudoku: Expert. |

---

## 5. Season Pass System

*   **Structure:** 100 Levels.
*   **XP:** Earned by winning levels. 100 XP = 1 Level.
*   **Rewards:**
    *   **Currency:** Coins (Virtual).
    *   **Avatars:** Animals/Symbols unlocked every 10 levels.
    *   **Borders:** Profile colors unlocked every 5 levels.
    *   **Premium:** Every even level is "Premium" (locked unless bought).
*   **Monetization (Simulated):** "Buy Premium" button ($4.99 mock).

---

## 6. Monetization & Ad Simulation

### Hint System
*   **Mechanic:** Hints are not free.
*   **Cost:** User must watch an "Ad".
*   **Ad Implementation:** An overlay appears with a wobbly clock.
*   **Ad Duration:** Starts at 5 seconds. Increases by 5 seconds for every subsequent hint used in a session.
*   **Visual:** "Hier wäre Werbung" (Here would be ads).
*   **Result:** 
    *   **Word Games:** A letter is permanently revealed in the grid (Golden Cell).
    *   **Sudoku:** A random empty cell is correctly filled and locked.

---

## 7. Technical Architecture

### Stack
*   **Framework:** React 19 (TypeScript)
*   **Styling:** Tailwind CSS + Framer Motion (Animations)
*   **Build:** Vite
*   **Audio:** Web Audio API (Custom `utils/audio.ts` synthesizer, no external mp3s).

### Data Structure
*   **Language:** Strict separation of `WORDS_EN` and `WORDS_DE`.
*   **State:**
    *   `user` (Profile, XP, Premium status)
    *   `progress` (Unlocked levels, stars)
    *   `gameState` (Current grid, Sudoku board, status)
*   **Persistence:** `localStorage`.

---

## 8. UI/UX Design

*   **Color Palette:** Dark Purple (`#0f0718`) background, Fuchsia primary, Cyan/Yellow accents.
*   **Typography:** 'Inter' for UI, 'JetBrains Mono' for Grid/Code.
*   **Feedback:**
    *   Shake on invalid word.
    *   Confetti on win.
    *   Pulse animations on hints.
    *   Sound effects (Synth) for typing, winning, losing.

---

## 9. Future Scope

*   **Multiplayer:** Live 1v1 Speedrun.
*   **Daily Quests:** Specific challenges for XP.
*   **Cloud Save:** Firebase integration.
