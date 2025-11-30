// ============================================
// KARTENSCHMIEDE - Main Export
// ============================================

// Types
export * from './types';

// Cards
export {
  ALL_CARDS,
  FIRE_CARDS,
  WATER_CARDS,
  EARTH_CARDS,
  AIR_CARDS,
  VOID_CARDS,
  CURSE_CARDS,
  getCardById,
  getCardsByElement,
  getCardsByRarity,
  getStarterDeck,
  getRandomCard,
  getRandomCardWithWeights,
  TOTAL_CARD_COUNT,
} from './cards';

// Gacha System
export {
  CARD_PACKS,
  BASE_DROP_RATES,
  PITY_CONFIG,
  DUST_VALUES,
  openPack,
  rollRandomCardDrop,
  generateDifficultyRewardPack,
  canAffordPack,
  getPackById,
  getAvailablePacks,
  getAdjustedDropRates,
  getCraftCost,
} from './gacha';

// Rewards System
export {
  createDefaultDeckbuilderData,
  processRandomDrop,
  processDifficultyReward,
  addCardToCollection,
  addCardsToCollection,
  markDifficultyCompleted,
  isDifficultyCompleted,
  purchasePack,
  getCollectionStats,
} from './rewards';
