/**
 * Reward System Utilities
 * Handles sticker drops, album rewards, and cosmetic unlocking
 */

import { UserState, Sticker, SeasonRewardItem } from '../types';
import { STICKERS, STICKER_CATEGORIES, getStickersByCategory, getFrameById } from '../constants';

// Rarity drop weights
const RARITY_WEIGHTS = {
  common: 60,    // 60% chance
  rare: 25,      // 25% chance
  epic: 12,      // 12% chance
  legendary: 3   // 3% chance
};

/**
 * Get a random sticker based on rarity weights
 */
export const getRandomSticker = (excludeIds: string[] = []): Sticker | null => {
  const availableStickers = STICKERS.filter(s => !excludeIds.includes(s.id));
  if (availableStickers.length === 0) return null;

  // Calculate weighted probabilities
  const weightedStickers: { sticker: Sticker; weight: number }[] = availableStickers.map(sticker => ({
    sticker,
    weight: RARITY_WEIGHTS[sticker.rarity]
  }));

  const totalWeight = weightedStickers.reduce((sum, ws) => sum + ws.weight, 0);
  let random = Math.random() * totalWeight;

  for (const ws of weightedStickers) {
    random -= ws.weight;
    if (random <= 0) {
      return ws.sticker;
    }
  }

  return availableStickers[0];
};

/**
 * Get multiple random stickers (for sticker packs)
 */
export const getRandomStickers = (count: number, userAlbum: Record<string, string[]> = {}): Sticker[] => {
  const collectedIds = Object.values(userAlbum).flat();
  const stickers: Sticker[] = [];
  
  for (let i = 0; i < count; i++) {
    // 70% chance to get new sticker, 30% chance for duplicate
    const preferNew = Math.random() < 0.7;
    const excludeIds = preferNew ? collectedIds : [];
    
    const sticker = getRandomSticker(excludeIds);
    if (sticker) {
      stickers.push(sticker);
      // Don't exclude the same sticker from appearing twice in one pack
    }
  }
  
  return stickers;
};

/**
 * Generate sticker reward after winning a game
 * Returns 1-3 stickers based on game difficulty
 */
export const generateGameStickerReward = (
  levelId: number,
  userAlbum: Record<string, string[]> = {}
): { stickers: Sticker[]; duplicateBonus: number } => {
  // More stickers for higher levels
  let stickerCount = 1;
  if (levelId >= 50) stickerCount = 3;
  else if (levelId >= 25) stickerCount = 2;
  
  const stickers = getRandomStickers(stickerCount, userAlbum);
  const collectedIds = Object.values(userAlbum).flat();
  
  // Calculate duplicate bonus
  const duplicateBonus = stickers.filter(s => collectedIds.includes(s.id)).length * 5;
  
  return { stickers, duplicateBonus };
};

/**
 * Add stickers to user's album
 */
export const addStickersToAlbum = (
  currentAlbum: Record<string, string[]>,
  stickers: Sticker[]
): { newAlbum: Record<string, string[]>; newStickers: Sticker[]; duplicates: Sticker[] } => {
  const newAlbum = { ...currentAlbum };
  const newStickers: Sticker[] = [];
  const duplicates: Sticker[] = [];
  
  for (const sticker of stickers) {
    if (!newAlbum[sticker.category]) {
      newAlbum[sticker.category] = [];
    }
    
    if (!newAlbum[sticker.category].includes(sticker.id)) {
      newAlbum[sticker.category] = [...newAlbum[sticker.category], sticker.id];
      newStickers.push(sticker);
    } else {
      duplicates.push(sticker);
    }
  }
  
  return { newAlbum, newStickers, duplicates };
};

/**
 * Calculate album progress
 */
export const calculateAlbumProgress = (album: Record<string, string[]>): number => {
  const totalStickers = STICKERS.length;
  const collectedStickers = Object.values(album).flat().length;
  return Math.round((collectedStickers / totalStickers) * 100);
};

/**
 * Check if a category is complete
 */
export const isCategoryComplete = (categoryId: string, album: Record<string, string[]>): boolean => {
  const category = STICKER_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return false;
  
  const collected = album[categoryId] || [];
  return collected.length >= category.totalStickers;
};

/**
 * Get category completion reward
 */
export const getCategoryReward = (categoryId: string): { frameId: string | null; coins: number } | null => {
  const category = STICKER_CATEGORIES.find(c => c.id === categoryId);
  if (!category) return null;
  
  return {
    frameId: category.rewardFrame || null,
    coins: category.rewardCoins
  };
};

/**
 * Process a season reward claim
 */
export const processSeasonReward = (
  reward: SeasonRewardItem,
  user: UserState
): Partial<UserState> => {
  const updates: Partial<UserState> = {};
  
  switch (reward.type) {
    case 'coins':
      updates.coins = (user.coins || 0) + (reward.amount || 0);
      break;
      
    case 'sticker':
      const sticker = getRandomSticker(Object.values(user.stickerAlbum || {}).flat());
      if (sticker) {
        const newAlbum = { ...user.stickerAlbum };
        if (!newAlbum[sticker.category]) newAlbum[sticker.category] = [];
        if (!newAlbum[sticker.category].includes(sticker.id)) {
          newAlbum[sticker.category] = [...newAlbum[sticker.category], sticker.id];
        } else {
          // Duplicate = bonus coins
          updates.coins = (user.coins || 0) + 5;
        }
        updates.stickerAlbum = newAlbum;
      }
      break;
      
    case 'sticker_pack':
      const packStickers = getRandomStickers(reward.amount || 3, user.stickerAlbum);
      const result = addStickersToAlbum(user.stickerAlbum || {}, packStickers);
      updates.stickerAlbum = result.newAlbum;
      if (result.duplicates.length > 0) {
        updates.coins = (user.coins || 0) + (result.duplicates.length * 5);
      }
      break;
      
    case 'frame':
      const frameValue = String(reward.value);
      updates.ownedFrames = [...(user.ownedFrames || []), frameValue];
      break;
      
    case 'font':
      const fontValue = String(reward.value);
      updates.ownedFonts = [...(user.ownedFonts || []), fontValue];
      break;
      
    case 'effect':
      const effectValue = String(reward.value);
      updates.ownedEffects = [...(user.ownedEffects || []), effectValue];
      break;
      
    case 'avatar':
      const avatarValue = String(reward.value);
      updates.ownedAvatars = [...(user.ownedAvatars || []), avatarValue];
      break;
      
    default:
      break;
  }
  
  return updates;
};

/**
 * Get rarity color for display
 */
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#06FFA5';
    case 'rare': return '#0096FF';
    case 'epic': return '#8338EC';
    case 'legendary': return '#FFBE0B';
    default: return '#CCC';
  }
};

/**
 * Get rarity display name
 */
export const getRarityName = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'Gewöhnlich';
    case 'rare': return 'Selten';
    case 'epic': return 'Episch';
    case 'legendary': return 'Legendär';
    default: return rarity;
  }
};
