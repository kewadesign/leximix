// ============================================
// KARTENSCHMIEDE - Reward System
// ============================================
// Handles card rewards from game modes and difficulty completions

import { DeckbuilderCard, DeckbuilderPlayerState } from './types';
import { rollRandomCardDrop, generateDifficultyRewardPack, openPack, getPackById } from './gacha';
import { getCardById } from './cards';

// ===================
// DEFAULT PLAYER DATA
// ===================
export function createDefaultDeckbuilderData(): DeckbuilderPlayerState {
  return {
    collection: {},
    dust: 0,
    gems: 100, // Starting gems
    unlockedArchetypes: ['fire_starter'],
    masteryLevel: 1,
    masteryXP: 0,
    pityCounters: {
      standard: 0,
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
    },
    stats: {
      runsStarted: 0,
      runsCompleted: 0,
      bossesKilled: 0,
      cardsPlayed: 0,
      highestFloor: 0,
      fastestRun: 0,
    },
    completedDifficulties: {},
  };
}

// ===================
// REWARD PROCESSING
// ===================

/**
 * Process random card drop after game completion
 * @param didWin Whether the player won the game
 * @returns The dropped card or null
 */
export function processRandomDrop(didWin: boolean = false): DeckbuilderCard | null {
  return rollRandomCardDrop(didWin);
}

/**
 * Process difficulty completion reward (5-card pack)
 * @param gameMode The game mode that was completed
 * @param difficulty The difficulty level (e.g., 'easy', 'medium', 'hard', 'expert')
 * @param playerData Current player data
 * @returns Object containing cards and whether it was first completion
 */
export function processDifficultyReward(
  gameMode: string,
  difficulty: string,
  playerData: DeckbuilderPlayerState
): { cards: DeckbuilderCard[]; isFirstCompletion: boolean } {
  // Check if this is first completion
  const completedDifficulties = playerData.completedDifficulties[gameMode] || [];
  const isFirstCompletion = !completedDifficulties.includes(difficulty);
  
  // Generate reward pack
  const cards = generateDifficultyRewardPack(isFirstCompletion);
  
  return { cards, isFirstCompletion };
}

/**
 * Add card to player collection
 * @param playerData Current player data
 * @param card Card to add
 * @returns Updated player data and dust gained from duplicate
 */
export function addCardToCollection(
  playerData: DeckbuilderPlayerState,
  card: DeckbuilderCard
): { updatedData: DeckbuilderPlayerState; dustGained: number; isNew: boolean } {
  const existing = playerData.collection[card.id];
  let dustGained = 0;
  let isNew = false;
  
  // Dust values for duplicates
  const dustValues: Record<string, number> = {
    starter: 1,
    common: 5,
    uncommon: 20,
    rare: 50,
    legendary: 200,
  };
  
  if (existing) {
    // Duplicate - give dust
    dustGained = dustValues[card.rarity] || 5;
    playerData.collection[card.id] = {
      ...existing,
      count: existing.count + 1,
    };
  } else {
    // New card
    isNew = true;
    playerData.collection[card.id] = {
      count: 1,
      upgraded: false,
      firstObtained: Date.now(),
    };
  }
  
  return {
    updatedData: {
      ...playerData,
      dust: playerData.dust + dustGained,
    },
    dustGained,
    isNew,
  };
}

/**
 * Add multiple cards to collection (e.g., from pack)
 */
export function addCardsToCollection(
  playerData: DeckbuilderPlayerState,
  cards: DeckbuilderCard[]
): { updatedData: DeckbuilderPlayerState; dustGained: number; newCards: string[] } {
  let totalDust = 0;
  const newCards: string[] = [];
  let data = { ...playerData };
  
  for (const card of cards) {
    const result = addCardToCollection(data, card);
    data = result.updatedData;
    totalDust += result.dustGained;
    if (result.isNew) {
      newCards.push(card.id);
    }
  }
  
  return { updatedData: data, dustGained: totalDust, newCards };
}

/**
 * Mark difficulty as completed
 */
export function markDifficultyCompleted(
  playerData: DeckbuilderPlayerState,
  gameMode: string,
  difficulty: string
): DeckbuilderPlayerState {
  const completedDifficulties = { ...playerData.completedDifficulties };
  if (!completedDifficulties[gameMode]) {
    completedDifficulties[gameMode] = [];
  }
  if (!completedDifficulties[gameMode].includes(difficulty)) {
    completedDifficulties[gameMode].push(difficulty);
  }
  
  return {
    ...playerData,
    completedDifficulties,
  };
}

/**
 * Check if difficulty was completed before
 */
export function isDifficultyCompleted(
  playerData: DeckbuilderPlayerState,
  gameMode: string,
  difficulty: string
): boolean {
  return playerData.completedDifficulties[gameMode]?.includes(difficulty) || false;
}

/**
 * Purchase a card pack with coins or gems
 */
export function purchasePack(
  playerData: DeckbuilderPlayerState,
  packId: string,
  payWithGems: boolean,
  currentCoins: number
): { 
  success: boolean; 
  updatedData?: DeckbuilderPlayerState; 
  cards?: DeckbuilderCard[]; 
  newCards?: string[];
  dustGained?: number;
  coinsSpent?: number;
  gemsSpent?: number;
  error?: string;
} {
  const pack = getPackById(packId as any);
  if (!pack) {
    return { success: false, error: 'Pack not found' };
  }
  
  // Check if can afford
  if (payWithGems) {
    if (pack.gemsCost === null) {
      return { success: false, error: 'Pack not available for gems' };
    }
    if (playerData.gems < pack.gemsCost) {
      return { success: false, error: 'Not enough gems' };
    }
  } else {
    if (pack.coinsCost === null) {
      return { success: false, error: 'Pack not available for coins' };
    }
    if (currentCoins < pack.coinsCost) {
      return { success: false, error: 'Not enough coins' };
    }
  }
  
  // Open pack
  const result = openPack(pack, playerData);
  
  // Add cards to collection
  const collectionResult = addCardsToCollection(playerData, result.cards);
  
  // Update pity counters
  const updatedData = {
    ...collectionResult.updatedData,
    gems: payWithGems ? playerData.gems - (pack.gemsCost || 0) : playerData.gems,
    pityCounters: {
      ...playerData.pityCounters,
      [pack.elementFilter || 'standard']: result.pityProgress,
    },
  };
  
  return {
    success: true,
    updatedData,
    cards: result.cards,
    newCards: collectionResult.newCards,
    dustGained: collectionResult.dustGained,
    coinsSpent: payWithGems ? 0 : (pack.coinsCost || 0),
    gemsSpent: payWithGems ? (pack.gemsCost || 0) : 0,
  };
}

/**
 * Get collection stats
 */
export function getCollectionStats(playerData: DeckbuilderPlayerState) {
  const totalCards = Object.keys(playerData.collection).length;
  const totalCopies = Object.values(playerData.collection).reduce((sum, c) => sum + c.count, 0);
  
  return {
    uniqueCards: totalCards,
    totalCopies,
    dust: playerData.dust,
    gems: playerData.gems,
    masteryLevel: playerData.masteryLevel,
    masteryXP: playerData.masteryXP,
  };
}

// Export everything
export default {
  createDefaultDeckbuilderData,
  processRandomDrop,
  processDifficultyReward,
  addCardToCollection,
  addCardsToCollection,
  markDifficultyCompleted,
  isDifficultyCompleted,
  purchasePack,
  getCollectionStats,
};
