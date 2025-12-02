
export enum GameMode {
  CLASSIC = 'CLASSIC',
  SPEEDRUN = 'SPEEDRUN',
  CHAIN = 'CHAIN',
  CATEGORY = 'CATEGORY',
  SUDOKU = 'SUDOKU',
  CHALLENGE = 'CHALLENGE',
  RIDDLE = 'RIDDLE',
  LETTER_MAU_MAU = 'LETTER_MAU_MAU',
  SKAT_MAU_MAU = 'SKAT_MAU_MAU',
  CHESS = 'CHESS',
  CHECKERS = 'CHECKERS',
  NINE_MENS_MORRIS = 'NINE_MENS_MORRIS',
  RUMMY = 'RUMMY',
  DECKBUILDER = 'DECKBUILDER',
  SOLITAIRE = 'SOLITAIRE'
}

export enum Tier {
  BEGINNER = 1, // Green
  LEARNER = 2,  // Cyan
  SKILLED = 3,  // Blue
  EXPERT = 4,   // Purple
  MASTER = 5    // Red
}

export enum Language {
  EN = 'EN',
  DE = 'DE',
  ES = 'ES'
}

export interface LevelData {
  id: number;
  tier: Tier;
  targetWord: string; // Used for word games
  hint: string;       // Used for Chain/Category
  sudokuGrid?: string[][]; // Full solution
  sudokuPuzzle?: (string | null)[][]; // Initial state
}

export interface WordData {
  word: string;
  hint: string;
  tier: Tier;
}

export interface UserState {
  xp: number;
  level: number;
  coins: number;
  isPremium: boolean;
  premiumExpiry?: number; // Timestamp when premium expires
  premiumActivatedAt?: number; // Timestamp when premium was activated (for 30-day expiration)
  completedLevels: Record<string, boolean>; // mode_levelId
  playedWords: string[]; // Track used words to prevent repetition
  language: Language;
  name: string;
  age: number;
  avatarId: string;
  ownedAvatars: string[];
  activeFrame?: string; // ID of the equipped frame
  ownedFrames?: string[]; // List of owned frame IDs
  activeFont?: string; // ID of the equipped font for profile name
  ownedFonts?: string[]; // List of owned font IDs
  activeEffect?: string; // ID of the equipped profile effect
  ownedEffects?: string[]; // List of owned effect IDs
  hintBooster?: number; // Level of hint speed booster (0 = none)
  claimedSeasonRewards?: number[]; // Track which FREE season levels have been claimed
  claimedPremiumRewards?: number[]; // Track which PREMIUM season levels have been claimed
  redeemedCodes?: string[]; // Track redeemed gutschein codes
  stickers?: string[]; // Collected stickers (legacy)
  stickerAlbum?: Record<string, string[]>; // Category -> collected sticker IDs
  albumProgress?: number; // Total album completion percentage
  completedCategories?: string[]; // Categories with all stickers collected
  theme: 'light' | 'dark';
  friendCode?: string; // Unique friend code for multiplayer
  friends?: { code: string; username: string }[]; // List of added friends
  // New cosmetics
  ownedTitles?: string[]; // List of owned title IDs
  activeTitle?: string; // ID of the equipped title
  ownedCardBacks?: string[]; // List of owned card back IDs
  activeCardBack?: string; // ID of the equipped card back
  // Deckbuilder Data
  deckbuilderData?: DeckbuilderPlayerState;
}

// Deckbuilder Player State (stored in UserState)
export interface DeckbuilderPlayerState {
  collection: Record<string, { count: number; upgraded: boolean; firstObtained: number }>;
  dust: number;
  gems: number;
  unlockedArchetypes: string[];
  masteryLevel: number;
  masteryXP: number;
  pityCounters: {
    standard: number;
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  stats: {
    runsStarted: number;
    runsCompleted: number;
    bossesKilled: number;
    cardsPlayed: number;
    highestFloor: number;
    fastestRun: number;
  };
  completedDifficulties: Record<string, string[]>; // GameMode -> completed difficulty levels
}

export interface GameConfig {
  mode: GameMode;
  tier: Tier;
  levelId: number;
}

export enum LetterStatus {
  CORRECT = 'correct',
  PRESENT = 'present',
  ABSENT = 'absent',
  EMPTY = 'empty',
  TBD = 'tbd'
}

export interface CellData {
  char: string;
  status: LetterStatus;
  isFixed?: boolean; // For Sudoku fixed cells
}

export type CellStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface TutorialContent {
  title: string;
  text: string;
}

export interface ShopItem {
  id: string;
  type: 'currency' | 'avatar' | 'frame' | 'booster' | 'title' | 'cardback' | 'cardpack' | 'font' | 'bundle';
  name: string;
  cost: number | string; // Number = Coins, String = Real Money (Display)
  value: number | string; // Amount of coins OR Avatar ID OR Frame ID OR Pack ID
  currencyAmount?: number; // For currency packs
  isRealMoney?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  preview?: string;
}

export interface SeasonRewardItem {
  type: 'coins' | 'avatar' | 'cosmetic' | 'booster' | 'mystery' | 'sticker' | 'sticker_pack' | 'effect' | 'frame' | 'font' | 'album_page' | 'title' | 'cardback';
  name: string;
  amount?: number;
  desc?: string;
  value?: string | number;
  preview?: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string; // For stickers: which album category
}

// Profile Frame Definition
export interface ProfileFrame {
  id: string;
  name: string;
  cssClass: string;
  unlockLevel: number;
  isPremium: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  animationClass?: string; // For animated frames
}

// Profile Title Definition
export interface ProfileTitle {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cssClass: string;
  icon?: string;
  unlockLevel: number;
  isPremium: boolean;
}

// Card Back Definition
export interface CardBack {
  id: string;
  name: string;
  preview: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cssClass?: string;
  unlockLevel: number;
  isPremium: boolean;
}

// Profile Font Definition
export interface ProfileFont {
  id: string;
  name: string;
  fontFamily: string;
  unlockLevel: number;
  isPremium: boolean;
}

// Profile Effect Definition
export interface ProfileEffect {
  id: string;
  name: string;
  cssClass: string;
  icon: string;
  unlockLevel: number;
  isPremium: boolean;
}

// Sticker Definition
export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Sticker Category Definition
export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  totalStickers: number;
  rewardFrame?: string; // Frame unlocked when category completed
  rewardCoins: number;
}

export interface SeasonReward {
  level: number;
  free: SeasonRewardItem | null;
  premium: SeasonRewardItem | null;
}
