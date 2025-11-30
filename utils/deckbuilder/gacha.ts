// ============================================
// KARTENSCHMIEDE - Gacha / Pack System
// ============================================
// Card pack definitions, pity system, and drop rates

import { 
  DeckbuilderCard, 
  CardRarity, 
  CardElement, 
  PackType, 
  CardPack, 
  PackOpeningResult,
  DeckbuilderPlayerData 
} from './types';
import { ALL_CARDS, getRandomCard, getCardsByElement, getCardsByRarity } from './cards';

// ===================
// PACK DEFINITIONS
// ===================
export const CARD_PACKS: CardPack[] = [
  {
    id: 'basic',
    name: 'Basic Pack',
    nameDE: 'Basis-Paket',
    description: '3 cards with 1 Uncommon+ guaranteed',
    descriptionDE: '3 Karten, 1 Ungewöhnliche+ garantiert',
    cardCount: 3,
    coinsCost: 500,
    gemsCost: 50,
    guaranteedRarity: 'uncommon',
    icon: '📦',
  },
  {
    id: 'standard',
    name: 'Standard Pack',
    nameDE: 'Standard-Paket',
    description: '5 cards with 1 Rare+ guaranteed',
    descriptionDE: '5 Karten, 1 Seltene+ garantiert',
    cardCount: 5,
    coinsCost: 1000,
    gemsCost: 100,
    guaranteedRarity: 'rare',
    icon: '🎁',
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    nameDE: 'Premium-Paket',
    description: '10 cards with 2 Rare+ and 1 Legendary guaranteed',
    descriptionDE: '10 Karten, 2 Seltene+ und 1 Legendäre garantiert',
    cardCount: 10,
    coinsCost: null,  // Premium only
    gemsCost: 500,
    guaranteedRarity: 'legendary',
    icon: '👑',
  },
  {
    id: 'element_fire',
    name: 'Fire Pack',
    nameDE: 'Feuer-Paket',
    description: '5 Fire cards with 1 Rare+ guaranteed',
    descriptionDE: '5 Feuer-Karten, 1 Seltene+ garantiert',
    cardCount: 5,
    coinsCost: 800,
    gemsCost: 80,
    guaranteedRarity: 'rare',
    elementFilter: 'fire',
    icon: '🔥',
  },
  {
    id: 'element_water',
    name: 'Water Pack',
    nameDE: 'Wasser-Paket',
    description: '5 Water cards with 1 Rare+ guaranteed',
    descriptionDE: '5 Wasser-Karten, 1 Seltene+ garantiert',
    cardCount: 5,
    coinsCost: 800,
    gemsCost: 80,
    guaranteedRarity: 'rare',
    elementFilter: 'water',
    icon: '💧',
  },
  {
    id: 'element_earth',
    name: 'Earth Pack',
    nameDE: 'Erde-Paket',
    description: '5 Earth cards with 1 Rare+ guaranteed',
    descriptionDE: '5 Erde-Karten, 1 Seltene+ garantiert',
    cardCount: 5,
    coinsCost: 800,
    gemsCost: 80,
    guaranteedRarity: 'rare',
    elementFilter: 'earth',
    icon: '🌍',
  },
  {
    id: 'element_air',
    name: 'Air Pack',
    nameDE: 'Luft-Paket',
    description: '5 Air cards with 1 Rare+ guaranteed',
    descriptionDE: '5 Luft-Karten, 1 Seltene+ garantiert',
    cardCount: 5,
    coinsCost: 800,
    gemsCost: 80,
    guaranteedRarity: 'rare',
    elementFilter: 'air',
    icon: '💨',
  },
];

// ===================
// DROP RATES
// ===================
export const BASE_DROP_RATES: Record<CardRarity, number> = {
  starter: 0,      // Never drops from packs
  common: 55,      // 55%
  uncommon: 30,    // 30%
  rare: 12,        // 12%
  legendary: 3,    // 3%
};

// Pity system thresholds
export const PITY_CONFIG = {
  softPityStart: 60,       // Increased legendary chance starts here
  hardPity: 90,            // Guaranteed legendary at this pull count
  softPityBonus: 5,        // +5% legendary chance per pull after soft pity
  elementPityReset: 40,    // Element packs reset after this many pulls
};

// Dust values for duplicates
export const DUST_VALUES: Record<CardRarity, { duplicate: number; craft: number }> = {
  starter: { duplicate: 1, craft: 10 },
  common: { duplicate: 5, craft: 50 },
  uncommon: { duplicate: 20, craft: 150 },
  rare: { duplicate: 50, craft: 400 },
  legendary: { duplicate: 200, craft: 1600 },
};

// ===================
// GACHA FUNCTIONS
// ===================

/**
 * Calculate adjusted drop rates based on pity counter
 */
export function getAdjustedDropRates(pityCount: number): Record<CardRarity, number> {
  const rates = { ...BASE_DROP_RATES };
  
  // Hard pity - guaranteed legendary
  if (pityCount >= PITY_CONFIG.hardPity) {
    return {
      starter: 0,
      common: 0,
      uncommon: 0,
      rare: 0,
      legendary: 100,
    };
  }
  
  // Soft pity - increased legendary chance
  if (pityCount >= PITY_CONFIG.softPityStart) {
    const bonusPulls = pityCount - PITY_CONFIG.softPityStart;
    const legendaryBonus = bonusPulls * PITY_CONFIG.softPityBonus;
    
    rates.legendary = Math.min(rates.legendary + legendaryBonus, 100);
    
    // Redistribute from common/uncommon
    const totalReduction = legendaryBonus;
    rates.common = Math.max(rates.common - totalReduction * 0.7, 0);
    rates.uncommon = Math.max(rates.uncommon - totalReduction * 0.3, 0);
  }
  
  return rates;
}

/**
 * Roll for a single card rarity
 */
export function rollRarity(pityCount: number): CardRarity {
  const rates = getAdjustedDropRates(pityCount);
  const roll = Math.random() * 100;
  
  let cumulative = 0;
  for (const [rarity, chance] of Object.entries(rates)) {
    cumulative += chance;
    if (roll < cumulative) {
      return rarity as CardRarity;
    }
  }
  
  return 'common';
}

/**
 * Get a random card from pool based on element filter
 */
function getCardFromPool(
  rarity: CardRarity,
  elementFilter?: CardElement,
  excludeIds: string[] = []
): DeckbuilderCard {
  let pool = ALL_CARDS.filter(c => 
    c.rarity === rarity && 
    c.type !== 'curse' && 
    c.type !== 'status' &&
    !excludeIds.includes(c.id)
  );
  
  if (elementFilter) {
    pool = pool.filter(c => c.element === elementFilter);
  }
  
  // Fallback if pool is empty
  if (pool.length === 0) {
    pool = ALL_CARDS.filter(c => 
      c.rarity === rarity && 
      c.type !== 'curse' && 
      c.type !== 'status'
    );
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Open a card pack
 */
export function openPack(
  pack: CardPack,
  playerData: DeckbuilderPlayerData
): PackOpeningResult {
  const cards: DeckbuilderCard[] = [];
  const newCards: string[] = [];
  let dustGained = 0;
  const drawnIds: string[] = [];
  
  // Get current pity count
  let pityCount = playerData.pityCounters.standard;
  if (pack.elementFilter) {
    pityCount = playerData.pityCounters[pack.elementFilter as keyof typeof playerData.pityCounters] || 0;
  }
  
  // Determine how many guaranteed slots we need
  let guaranteedLegendary = pack.guaranteedRarity === 'legendary' ? 1 : 0;
  let guaranteedRare = pack.guaranteedRarity === 'rare' ? 1 : (guaranteedLegendary > 0 ? 2 : 0);
  let guaranteedUncommon = pack.guaranteedRarity === 'uncommon' ? 1 : 0;
  
  // Generate cards
  for (let i = 0; i < pack.cardCount; i++) {
    let rarity: CardRarity;
    
    // Check if we need to fulfill guarantees
    const remainingSlots = pack.cardCount - i;
    const neededGuarantees = guaranteedLegendary + guaranteedRare + guaranteedUncommon;
    
    if (remainingSlots <= guaranteedLegendary && guaranteedLegendary > 0) {
      rarity = 'legendary';
      guaranteedLegendary--;
    } else if (remainingSlots <= guaranteedLegendary + guaranteedRare && guaranteedRare > 0) {
      rarity = 'rare';
      guaranteedRare--;
    } else if (remainingSlots <= neededGuarantees && guaranteedUncommon > 0) {
      rarity = 'uncommon';
      guaranteedUncommon--;
    } else {
      // Roll normally
      rarity = rollRarity(pityCount);
      
      // Update pity counter
      if (rarity === 'legendary') {
        pityCount = 0;  // Reset on legendary
      } else {
        pityCount++;
      }
    }
    
    // Get card
    const card = getCardFromPool(rarity, pack.elementFilter, drawnIds);
    cards.push(card);
    drawnIds.push(card.id);
    
    // Check if new or duplicate
    if (!playerData.collection[card.id]) {
      newCards.push(card.id);
    } else {
      // Calculate dust from duplicate
      dustGained += DUST_VALUES[card.rarity].duplicate;
    }
  }
  
  // Sort cards by rarity (legendary first)
  const rarityOrder: Record<CardRarity, number> = {
    legendary: 5,
    rare: 4,
    uncommon: 3,
    common: 2,
    starter: 1,
  };
  cards.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
  
  return {
    cards,
    newCards,
    dustGained,
    pityProgress: pityCount,
  };
}

/**
 * Get a random card drop (for game mode rewards)
 * 10% base chance, 20% on win
 */
export function rollRandomCardDrop(didWin: boolean = false): DeckbuilderCard | null {
  const dropChance = didWin ? 0.20 : 0.10;
  
  if (Math.random() > dropChance) {
    return null;  // No drop
  }
  
  // Roll rarity with reduced legendary chance
  const dropRates = {
    common: 70,
    uncommon: 25,
    rare: 4,
    legendary: 1,
  };
  
  const roll = Math.random() * 100;
  let rarity: CardRarity = 'common';
  let cumulative = 0;
  
  for (const [r, chance] of Object.entries(dropRates)) {
    cumulative += chance;
    if (roll < cumulative) {
      rarity = r as CardRarity;
      break;
    }
  }
  
  return getCardFromPool(rarity);
}

/**
 * Generate reward pack for completing a difficulty level
 * Guaranteed 5 cards with at least 1 Rare on first completion
 */
export function generateDifficultyRewardPack(
  isFirstCompletion: boolean = false
): DeckbuilderCard[] {
  const cards: DeckbuilderCard[] = [];
  const drawnIds: string[] = [];
  
  // Guarantees based on completion type
  const guarantees = isFirstCompletion 
    ? { rare: 1, uncommon: 2, common: 2 }
    : { rare: 0, uncommon: 1, common: 4 };
  
  // Generate guaranteed cards
  for (let i = 0; i < guarantees.rare; i++) {
    const card = getCardFromPool('rare', undefined, drawnIds);
    cards.push(card);
    drawnIds.push(card.id);
  }
  
  for (let i = 0; i < guarantees.uncommon; i++) {
    const card = getCardFromPool('uncommon', undefined, drawnIds);
    cards.push(card);
    drawnIds.push(card.id);
  }
  
  for (let i = 0; i < guarantees.common; i++) {
    const card = getCardFromPool('common', undefined, drawnIds);
    cards.push(card);
    drawnIds.push(card.id);
  }
  
  // Sort by rarity
  const rarityOrder: Record<CardRarity, number> = {
    legendary: 5,
    rare: 4,
    uncommon: 3,
    common: 2,
    starter: 1,
  };
  cards.sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]);
  
  return cards;
}

/**
 * Calculate cost to craft a card from dust
 */
export function getCraftCost(rarity: CardRarity): number {
  return DUST_VALUES[rarity].craft;
}

/**
 * Check if player can afford a pack
 */
export function canAffordPack(
  pack: CardPack, 
  coins: number, 
  gems: number,
  payWithGems: boolean = false
): boolean {
  if (payWithGems && pack.gemsCost !== null) {
    return gems >= pack.gemsCost;
  }
  if (!payWithGems && pack.coinsCost !== null) {
    return coins >= pack.coinsCost;
  }
  return false;
}

/**
 * Get pack by ID
 */
export function getPackById(id: PackType): CardPack | undefined {
  return CARD_PACKS.find(p => p.id === id);
}

/**
 * Get all available packs
 */
export function getAvailablePacks(): CardPack[] {
  return CARD_PACKS;
}

// Export for use
export default {
  CARD_PACKS,
  BASE_DROP_RATES,
  PITY_CONFIG,
  DUST_VALUES,
  openPack,
  rollRandomCardDrop,
  generateDifficultyRewardPack,
  canAffordPack,
  getPackById,
};
