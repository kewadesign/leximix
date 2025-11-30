// ============================================
// KARTENSCHMIEDE - Main Export
// ============================================

// Types
export * from './types';

// Cards (200+)
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

// Expanded Cards
export {
  ALL_EXPANDED_CARDS,
  EXPANDED_CARD_COUNT,
  FIRE_CARDS_EXPANDED,
  WATER_CARDS_EXPANDED,
  EARTH_CARDS_EXPANDED,
  AIR_CARDS_EXPANDED,
  VOID_CARDS_EXPANDED,
  HYBRID_CARDS,
  COLORLESS_CARDS,
} from './cards_expanded';

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

// Combat System
export {
  initializeCombat,
  startPlayerTurn,
  endPlayerTurn,
  executeEnemyTurn,
  canPlayCard,
  playCard,
  drawCards,
  discardCard,
  exhaustCard,
  addStatus,
  removeStatus,
  hasStatus,
  getStatusStacks,
  isCombatOver,
  getAliveEnemies,
  calculateCombatRewards,
} from './combat';

// Map Generation (250 Floors)
export {
  MAP_CONFIG,
  ACTS,
  ASCENSION_MODIFIERS,
  generateMap,
  getFloorInfo,
  getAvailableNodes,
  visitNode,
  isActComplete,
  getMapProgress,
} from './mapGeneration';

// Enemies (40+ Regular, 15 Bosses)
export {
  ALL_ENEMIES,
  ALL_BOSSES,
  FIRE_ENEMIES,
  WATER_ENEMIES,
  EARTH_ENEMIES,
  AIR_ENEMIES,
  VOID_ENEMIES,
  BOSSES,
  getEnemyById,
  getEnemiesForAct,
  getElitesForAct,
  getBossesForAct,
  getRandomEnemy,
  getRandomBoss,
  scaleEnemyForFloor,
} from './enemies';
