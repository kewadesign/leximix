# LexiMix - Game Design Document (GDD)

**Version:** 2.0 (Codebase-Synced)
**Date:** November 2025
**Platform:** Android (via Capacitor), Web
**Language:** English, German (Fully Localized)

---

## 1. Game Overview

**LexiMix** (also referred to as "Puzzle Pal" in-app) is a comprehensive word puzzle application designed for daily mental training. It combines multiple puzzle mechanics into a single cohesive experience, wrapped in a modern, high-fidelity "Black Market" / "Cyber" aesthetic.

### Core Pillars
1.  **Variety:** Multiple distinct game modes catering to different cognitive skills (vocabulary, logic, speed).
2.  **Progression:** A deep tier-based system with XP, levels, and a Season Pass ("Genesis").
3.  **Accessibility:** Fully localized in English and German with adaptive difficulty tiers.
4.  **Premium Feel:** High-quality UI with animations, dark mode aesthetics, and haptic feedback.

---

## 2. Game Modes

The application features 6 distinct game modes, unlocked or accessed via the main dashboard.

### 2.1 CLASSIC (The Standard)
*   **Mechanic:** Traditional Wordle-style gameplay.
*   **Goal:** Guess the target word within 6 attempts.
*   **Feedback:**
    *   **Green:** Correct letter, correct spot.
    *   **Yellow:** Correct letter, wrong spot.
    *   **Gray:** Letter not in word.
*   **Difficulty:** Scales with Tiers (Beginner to Master).

### 2.2 SPEEDRUN (Race Against Time)
*   **Mechanic:** Time-attack word guessing.
*   **Constraint:** Players have a limited time window to solve the puzzle.
*   **Time Logic:** Time is calculated based on word length (e.g., `length * 5` seconds).
*   **Failure Condition:** Timer reaches zero before the word is solved.

### 2.3 CHAIN (Link Words)
*   **Mechanic:** Associative word chain.
*   **Flow:** The answer to the previous puzzle becomes the *hint* for the next one.
*   **Example:**
    *   Hint: "RAIN" -> Target: "BOW"
    *   Next Round Hint: "BOW" -> Target: "TIE" (Hypothetical example)
*   **Data Source:** Specific "Chain Pairs" defined in constants (e.g., RAIN->BOW, SUN->LIGHT).

### 2.4 CATEGORY (Context Based)
*   **Mechanic:** Theme-based word guessing.
*   **Structure:** Players select a category (e.g., SPACE, FOOD, TECH).
*   **Gameplay:** All target words belong to the selected category.
*   **Hints:** Hints are context-specific definitions.

### 2.5 SUDOKU (Letter Sudoku)
*   **Mechanic:** Logic puzzle using letters A-I instead of numbers 1-9.
*   **Grid:** 9x9 grid divided into 3x3 subgrids.
*   **Rules:** Each row, column, and 3x3 box must contain unique letters A through I.
*   **Input:** Custom keyboard with letters A-I.

### 2.6 CHALLENGE (Premium)
*   **Access:** Restricted to **Premium Pass** holders.
*   **Content:** High-difficulty tasks and Math challenges.
*   **Math Mode:** Players solve arithmetic equations (e.g., "12 + 5", "10 * 2") instead of words.
*   **Rewards:** Higher XP and Coin yields.

---

## 3. Progression System

### 3.1 Tiers (Difficulty Levels)
The game uses a 5-tier system to categorize difficulty and visual themes.
1.  **BEGINNER (Green):** Common, simple words (e.g., APPLE, HOUSE).
2.  **LEARNER (Cyan):** Slightly longer, less concrete (e.g., PLANET, TRAVEL).
3.  **SKILLED (Blue):** Abstract concepts (e.g., THEORY, ENERGY).
4.  **EXPERT (Purple):** Scientific/Complex terms (e.g., QUANTUM, JUSTICE).
5.  **MASTER (Red):** Obscure/Specific terms (e.g., ZEPHYR, SPHINX).

### 3.2 User Stats
*   **XP (Experience Points):** Gained by winning games. Unlocks Season Pass levels.
*   **Level:** Global player level derived from total XP.
*   **Coins:** Soft currency earned via gameplay or purchased.

### 3.3 Season Pass ("Season I: Genesis")
A dual-track battle pass system.
*   **Free Track:** Available to all players. Rewards include basic Coin packs.
*   **Premium Track:** Requires purchase (4.99€).
    *   **Benefits:**
        *   Exclusive Skins/Avatars.
        *   Faster Hint cooldowns.
        *   Golden Name Color.
        *   Access to Challenge Mode.
*   **Progression:** Levels 1-100.

---

## 4. Economy & Monetization

### 4.1 Currency (Coins)
*   **Earned:** By completing levels (amount varies by Tier/Mode).
*   **Spent:**
    *   Buying Hints in-game.
    *   Purchasing Avatars in the Shop.

### 4.2 The Shop ("Black Market")
*   **Coin Packs:** Purchase bundles of coins (Simulated or Real Money links).
*   **Avatar Terminal:** Buy and equip new player avatars using Coins.
*   **Items:**
    *   "Rare Item" (Placeholder/Future content).

### 4.3 Ads & Hints
*   **Hint System:**
    *   **Cost:** Costs Coins OR watching an Ad.
    *   **Ad Simulation:** Currently features a simulated "Ad Space" overlay that rewards the player after a wait time.
    *   **Effect:** Reveals a letter or provides a definition hint.

### 4.4 Code Redemption
*   **System:** In-app modal to enter alphanumeric codes.
*   **Rewards:** Can grant Premium status, Coins, or XP boosts.

---

## 5. User Interface & UX

### 5.1 Onboarding
*   **Flow:** Language Selection -> Name Entry -> Age Verification (1-120) -> Avatar Selection.
*   **Validation:** Strict checks on Age and Name length.

### 5.2 Main Menu (Home)
*   **Header:** Player Name, Level, Coin Balance, Settings.
*   **Dashboard:** Grid of Game Mode cards with icons and descriptions.
*   **Season Banner:** Prominent display of current Season progress.

### 5.3 Profile
*   **Editable:** Name, Avatar.
*   **Actions:** Save Profile, Delete Profile (with confirmation).
*   **Visuals:** Displays current Avatar and "Member since" data.

### 5.4 Localization
*   **Languages:** English (EN) and German (DE).
*   **Scope:** 100% text coverage including UI labels, buttons, error messages, tutorial text, and *all* word lists/hints.

---

## 6. Technical Architecture

### 6.1 Stack
*   **Frontend:** React 18 with TypeScript.
*   **Build Tool:** Vite.
*   **Styling:** Tailwind CSS (Utility-first).
*   **Mobile Wrapper:** Capacitor (for Android APK generation).

### 6.2 Data Structures
*   **`WordData`:** `{ word: string, hint: string, tier: Tier }`
*   **`UserState`:** Stores XP, Coins, Premium Status, Completed Levels, Inventory.
*   **`LevelData`:** Defines specific level configurations.

### 6.3 Persistence
*   **Local Storage:** Primary method for saving UserState.
*   **Cloud Sync:** Hooks exist (`handleCloudLogin`) for future Firebase/Backend integration.

### 6.4 Security
*   **Anti-Cheat:** Basic validation on inputs.
*   **Obfuscation:** Production builds are minified.
*   **APK Signing:** Android builds are signed with a release key.

---

## 7. Content Library

### 7.1 Word Lists
*   **English:** ~250+ words categorized by Tier.
*   **German:** ~250+ words categorized by Tier.
*   **Categories:** Space, Food, Tech (in both languages).

### 7.2 Math Challenges
*   Pre-defined set of arithmetic problems (e.g., "12 * 12", "100 - 33") for the Challenge mode.

### 7.3 Chain Pairs
*   Curated list of word associations for Chain mode (e.g., "Rain" -> "Bow", "Hand" -> "Schuh").
