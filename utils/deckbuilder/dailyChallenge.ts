// ============================================
// KARTENSCHMIEDE - Daily Challenge System
// ============================================
// Seeded daily runs with leaderboards

import { DeckbuilderCard, DeckbuilderRun, RunModifier, DailyChallenge, LeaderboardEntry } from './types';
import { generateMap, ACTS } from './mapGeneration';
import { getStarterDeck } from './cards';

// ===================
// DAILY SEED GENERATION
// ===================

/**
 * Generate a deterministic seed for today's challenge
 */
export function getTodaysSeed(): number {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
}

/**
 * Get today's date string for challenge ID
 */
export function getTodaysDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ===================
// CHALLENGE MODIFIERS
// ===================

export const CHALLENGE_MODIFIERS: RunModifier[] = [
  // Difficulty Modifiers
  {
    id: 'mod_glass_cannon',
    name: 'Glass Cannon',
    description: 'Deal 50% more damage, but take 50% more damage',
    effect: 'damage_modifier',
  },
  {
    id: 'mod_no_healing',
    name: 'No Healing',
    description: 'Cannot heal during the run',
    effect: 'no_healing',
  },
  {
    id: 'mod_elite_swarm',
    name: 'Elite Swarm',
    description: 'Elite encounters appear twice as often',
    effect: 'elite_frequency',
  },
  {
    id: 'mod_curse_collector',
    name: 'Curse Collector',
    description: 'Start with 3 Curses, but gain 50% more gold',
    effect: 'curse_start',
  },
  {
    id: 'mod_time_pressure',
    name: 'Time Pressure',
    description: 'Each turn must be completed in 30 seconds',
    effect: 'turn_timer',
  },
  
  // Fun Modifiers
  {
    id: 'mod_big_deck',
    name: 'Big Deck Energy',
    description: 'Start with 15 cards instead of 8',
    effect: 'big_deck',
  },
  {
    id: 'mod_one_element',
    name: 'Elemental Focus',
    description: 'Only cards of one element appear',
    effect: 'element_lock',
  },
  {
    id: 'mod_relic_rush',
    name: 'Relic Rush',
    description: 'Start with 3 random relics, but -20 Max HP',
    effect: 'relic_start',
  },
  {
    id: 'mod_combo_master',
    name: 'Combo Master',
    description: 'Playing 3+ cards in one turn grants +3 energy next turn',
    effect: 'combo_bonus',
  },
  {
    id: 'mod_all_or_nothing',
    name: 'All or Nothing',
    description: 'Cards either cost 0 or 3 (random each draw)',
    effect: 'random_cost',
  },
  
  // Challenge Modifiers
  {
    id: 'mod_boss_rush',
    name: 'Boss Rush',
    description: 'Fight all 3 act bosses in sequence',
    effect: 'boss_rush',
  },
  {
    id: 'mod_minimalist',
    name: 'Minimalist',
    description: 'Cannot add cards to deck, start with 2 random rares',
    effect: 'minimalist',
  },
  {
    id: 'mod_chaos',
    name: 'Chaos Mode',
    description: 'Random modifier applied each floor',
    effect: 'chaos',
  },
];

// ===================
// DAILY CHALLENGE GENERATION
// ===================

/**
 * Generate today's daily challenge
 */
export function generateDailyChallenge(): DailyChallenge {
  const seed = getTodaysSeed();
  const date = getTodaysDateString();
  const rng = seededRandom(seed);
  
  // Select 2-3 random modifiers
  const numModifiers = 2 + Math.floor(rng() * 2);
  const shuffledMods = [...CHALLENGE_MODIFIERS].sort(() => rng() - 0.5);
  const selectedModifiers = shuffledMods.slice(0, numModifiers);
  
  return {
    id: `daily_${date}`,
    date,
    seed,
    modifiers: selectedModifiers,
    leaderboard: [],
  };
}

/**
 * Create a run from daily challenge
 */
export function createDailyChallengeRun(challenge: DailyChallenge, playerId: string): DeckbuilderRun {
  const rng = seededRandom(challenge.seed);
  
  // Determine starting element based on seed
  const elements: Array<'fire' | 'water' | 'earth' | 'air'> = ['fire', 'water', 'earth', 'air'];
  const startElement = elements[Math.floor(rng() * elements.length)];
  
  // Generate starter deck
  let deck = getStarterDeck(startElement);
  
  // Apply modifier effects to deck
  for (const mod of challenge.modifiers) {
    if (mod.id === 'mod_big_deck') {
      // Double the deck
      deck = [...deck, ...deck.slice(0, 7)];
    }
  }
  
  // Calculate starting HP
  let maxHp = 80;
  for (const mod of challenge.modifiers) {
    if (mod.id === 'mod_relic_rush') {
      maxHp -= 20;
    }
  }
  
  // Generate map with seed
  const map = generateMap(1, challenge.seed);
  
  return {
    id: `run_${challenge.id}_${playerId}`,
    seed: challenge.seed,
    startedAt: Date.now(),
    currentAct: 1,
    currentFloor: 1,
    player: {
      hp: maxHp,
      maxHp,
      gold: 100,
    },
    deck,
    relics: [],
    map,
    score: 0,
    isDaily: true,
    modifiers: challenge.modifiers,
  };
}

// ===================
// SCORING SYSTEM
// ===================

export interface ScoreBreakdown {
  floorsCleared: number;
  floorsScore: number;
  enemiesKilled: number;
  enemiesScore: number;
  elitesKilled: number;
  elitesScore: number;
  bossesKilled: number;
  bossesScore: number;
  perfectFloors: number;
  perfectScore: number;
  goldCollected: number;
  goldScore: number;
  cardsPlayed: number;
  cardsScore: number;
  timeBonus: number;
  modifierBonus: number;
  totalScore: number;
}

/**
 * Calculate score for a completed run
 */
export function calculateRunScore(
  run: DeckbuilderRun,
  stats: {
    enemiesKilled: number;
    elitesKilled: number;
    bossesKilled: number;
    perfectFloors: number; // Floors completed without taking damage
    goldCollected: number;
    cardsPlayed: number;
    timeElapsed: number; // In seconds
  }
): ScoreBreakdown {
  const floorsCleared = run.currentFloor;
  const floorsScore = floorsCleared * 50;
  
  const enemiesScore = stats.enemiesKilled * 10;
  const elitesScore = stats.elitesKilled * 100;
  const bossesScore = stats.bossesKilled * 500;
  
  const perfectScore = stats.perfectFloors * 200;
  const goldScore = Math.floor(stats.goldCollected / 10);
  const cardsScore = Math.floor(stats.cardsPlayed / 5);
  
  // Time bonus: More points for faster completion
  const expectedTime = floorsCleared * 120; // 2 minutes per floor
  const timeRatio = Math.max(0, expectedTime - stats.timeElapsed) / expectedTime;
  const timeBonus = Math.floor(timeRatio * floorsCleared * 25);
  
  // Modifier bonus: Each modifier adds 10% to total score
  const modifierMultiplier = 1 + (run.modifiers?.length || 0) * 0.1;
  
  const baseScore = floorsScore + enemiesScore + elitesScore + bossesScore + 
                    perfectScore + goldScore + cardsScore + timeBonus;
  
  const modifierBonus = Math.floor(baseScore * (modifierMultiplier - 1));
  const totalScore = Math.floor(baseScore * modifierMultiplier);
  
  return {
    floorsCleared,
    floorsScore,
    enemiesKilled: stats.enemiesKilled,
    enemiesScore,
    elitesKilled: stats.elitesKilled,
    elitesScore,
    bossesKilled: stats.bossesKilled,
    bossesScore,
    perfectFloors: stats.perfectFloors,
    perfectScore,
    goldCollected: stats.goldCollected,
    goldScore,
    cardsPlayed: stats.cardsPlayed,
    cardsScore,
    timeBonus,
    modifierBonus,
    totalScore,
  };
}

// ===================
// LEADERBOARD
// ===================

/**
 * Add entry to leaderboard
 */
export function addToLeaderboard(
  leaderboard: LeaderboardEntry[],
  entry: LeaderboardEntry,
  maxEntries: number = 100
): LeaderboardEntry[] {
  const newLeaderboard = [...leaderboard, entry];
  
  // Sort by score descending
  newLeaderboard.sort((a, b) => b.score - a.score);
  
  // Limit to max entries
  return newLeaderboard.slice(0, maxEntries);
}

/**
 * Get player's rank on leaderboard
 */
export function getPlayerRank(leaderboard: LeaderboardEntry[], odvisitorId: string): number {
  const index = leaderboard.findIndex(e => e.odvisitorId === odvisitorId);
  return index === -1 ? -1 : index + 1;
}

/**
 * Get surrounding entries for a player (for display)
 */
export function getSurroundingEntries(
  leaderboard: LeaderboardEntry[],
  odvisitorId: string,
  range: number = 5
): { entries: LeaderboardEntry[]; playerIndex: number } {
  const playerIndex = leaderboard.findIndex(e => e.odvisitorId === odvisitorId);
  
  if (playerIndex === -1) {
    // Player not on leaderboard, return top entries
    return {
      entries: leaderboard.slice(0, range * 2 + 1),
      playerIndex: -1,
    };
  }
  
  const start = Math.max(0, playerIndex - range);
  const end = Math.min(leaderboard.length, playerIndex + range + 1);
  
  return {
    entries: leaderboard.slice(start, end),
    playerIndex: playerIndex - start,
  };
}

// ===================
// WEEKLY CHALLENGE
// ===================

export interface WeeklyChallenge extends DailyChallenge {
  weekNumber: number;
  specialReward: {
    type: 'card' | 'cosmetic' | 'currency';
    value: string | number;
  };
}

/**
 * Generate this week's special challenge
 */
export function generateWeeklyChallenge(): WeeklyChallenge {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((today.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
  
  const seed = today.getFullYear() * 100 + weekNumber;
  const rng = seededRandom(seed);
  
  // Weekly challenges have more modifiers
  const shuffledMods = [...CHALLENGE_MODIFIERS].sort(() => rng() - 0.5);
  const selectedModifiers = shuffledMods.slice(0, 4);
  
  // Special reward based on week
  const rewardTypes: Array<{ type: 'card' | 'cosmetic' | 'currency'; value: string | number }> = [
    { type: 'currency', value: 500 },
    { type: 'card', value: 'random_rare' },
    { type: 'card', value: 'random_legendary' },
    { type: 'cosmetic', value: 'weekly_frame' },
  ];
  const specialReward = rewardTypes[weekNumber % rewardTypes.length];
  
  return {
    id: `weekly_${today.getFullYear()}_w${weekNumber}`,
    date: getTodaysDateString(),
    seed,
    modifiers: selectedModifiers,
    leaderboard: [],
    weekNumber,
    specialReward,
  };
}

// ===================
// CHALLENGE REWARDS
// ===================

export interface ChallengeReward {
  rank: number;
  gems: number;
  dust: number;
  packType?: string;
  specialCard?: string;
}

export const DAILY_REWARDS: ChallengeReward[] = [
  { rank: 1, gems: 200, dust: 100, packType: 'premium', specialCard: 'random_legendary' },
  { rank: 2, gems: 150, dust: 75, packType: 'standard' },
  { rank: 3, gems: 100, dust: 50, packType: 'standard' },
  { rank: 10, gems: 75, dust: 40 },
  { rank: 25, gems: 50, dust: 30 },
  { rank: 50, gems: 40, dust: 25 },
  { rank: 100, gems: 30, dust: 20 },
];

export const WEEKLY_REWARDS: ChallengeReward[] = [
  { rank: 1, gems: 1000, dust: 500, packType: 'premium', specialCard: 'weekly_exclusive' },
  { rank: 2, gems: 750, dust: 400, packType: 'premium' },
  { rank: 3, gems: 500, dust: 300, packType: 'premium' },
  { rank: 10, gems: 300, dust: 200, packType: 'standard' },
  { rank: 25, gems: 200, dust: 150 },
  { rank: 50, gems: 150, dust: 100 },
  { rank: 100, gems: 100, dust: 75 },
];

/**
 * Get reward for a given rank
 */
export function getRewardForRank(rank: number, isWeekly: boolean = false): ChallengeReward | null {
  const rewards = isWeekly ? WEEKLY_REWARDS : DAILY_REWARDS;
  
  for (const reward of rewards) {
    if (rank <= reward.rank) {
      return reward;
    }
  }
  
  // Participation reward for completing
  return { rank: 0, gems: 20, dust: 10 };
}

// ===================
// UTILITY
// ===================

function seededRandom(seed: number): () => number {
  let state = seed;
  
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

/**
 * Check if player has completed today's challenge
 */
export function hasCompletedTodaysChallenge(
  completedChallenges: string[],
  date: string = getTodaysDateString()
): boolean {
  return completedChallenges.includes(`daily_${date}`);
}

/**
 * Get time until next daily challenge
 */
export function getTimeUntilNextDaily(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
}

// Export all
export default {
  getTodaysSeed,
  getTodaysDateString,
  CHALLENGE_MODIFIERS,
  generateDailyChallenge,
  createDailyChallengeRun,
  calculateRunScore,
  addToLeaderboard,
  getPlayerRank,
  getSurroundingEntries,
  generateWeeklyChallenge,
  DAILY_REWARDS,
  WEEKLY_REWARDS,
  getRewardForRank,
  hasCompletedTodaysChallenge,
  getTimeUntilNextDaily,
};
