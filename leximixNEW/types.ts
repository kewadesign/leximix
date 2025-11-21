
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
  DE = 'DE'
}

export interface LevelData {
  id: number;
  tier: Tier;
  targetWord: string; // Used for word games
  hint: string;       // Used for Chain/Category
  sudokuGrid?: string[][]; // Full solution
  sudokuPuzzle?: (string | null)[][]; // Initial state
}

export interface UserState {
  xp: number;
  level: number;
  coins: number;
  isPremium: boolean;
  completedLevels: Record<string, boolean>; // mode_levelId
  language: Language;
  name: string;
  age: number;
  avatarId: string;
  ownedAvatars: string[];
}

export interface GameConfig {
  mode: GameMode;
  tier: Tier;
  levelId: number;
}

export type CellStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface TutorialContent {
  title: string;
  text: string;
}

export interface ShopItem {
  id: string;
  type: 'currency' | 'avatar';
  name: string;
  cost: number | string; // Number = Coins, String = Real Money (Display)
  value: number | string; // Amount of coins OR Avatar ID
  currencyAmount?: number; // For currency packs
  isRealMoney?: boolean;
}