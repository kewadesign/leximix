
export enum GameMode {
  CLASSIC = 'CLASSIC',
  SPEEDRUN = 'SPEEDRUN',
  CHAIN = 'CHAIN',
  CATEGORY = 'CATEGORY',
  SUDOKU = 'SUDOKU',
  CHALLENGE = 'CHALLENGE'
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
  hintBooster?: number; // Level of hint speed booster (0 = none)
  claimedSeasonRewards?: number[]; // Track which FREE season levels have been claimed
  claimedPremiumRewards?: number[]; // Track which PREMIUM season levels have been claimed
  redeemedCodes?: string[]; // Track redeemed gutschein codes
  stickers?: string[]; // Collected stickers
  theme: 'light' | 'dark';
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
  type: 'currency' | 'avatar' | 'frame' | 'booster';
  name: string;
  cost: number | string; // Number = Coins, String = Real Money (Display)
  value: number | string; // Amount of coins OR Avatar ID OR Frame ID
  currencyAmount?: number; // For currency packs
  isRealMoney?: boolean;
  paypalLink?: string;
}

export interface SeasonRewardItem {
  type: 'coins' | 'avatar' | 'cosmetic' | 'booster' | 'mystery' | 'sticker' | 'effect';
  name: string;
  amount?: number;
  desc?: string;
  value?: string | number;
  preview?: string;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface SeasonReward {
  level: number;
  free: SeasonRewardItem | null;
  premium: SeasonRewardItem | null;
}
