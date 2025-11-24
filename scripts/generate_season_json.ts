import fs from 'fs';
import path from 'path';

// --- Types ---
interface SeasonAvatar {
  level: number;
  name: string;
  id: string;
  dicebear: string;
  desc: string;
}

interface SeasonColors {
  primary: string;
  secondary: string;
  accent: string;
  bgDark: string;
  bgCard: string;
}

interface Season {
  id: number;
  name: string;
  theme: string;
  startDate: number;
  endDate: number;
  colors: SeasonColors;
  avatars: SeasonAvatar[];
  rewards: any[]; // We'll generate this
}

// --- Data ---
const SEASON_1_AVATARS: SeasonAvatar[] = [
  { level: 10, name: 'Space Explorer', id: 'space_explorer', dicebear: 'SpaceExplorer', desc: 'Cosmic wanderer' },
  { level: 20, name: 'Cyberpunk Warrior', id: 'cyberpunk_warrior', dicebear: 'CyberpunkWarrior', desc: 'Neon fighter' },
  { level: 30, name: 'Fantasy Wizard', id: 'fantasy_wizard', dicebear: 'FantasyWizard', desc: 'Arcane master' },
  { level: 40, name: 'Ocean Guardian', id: 'ocean_guardian', dicebear: 'Ocean', desc: 'Deep sea protector' },
  { level: 50, name: 'Mountain Sage', id: 'mountain_sage', dicebear: 'Sage', desc: 'Ancient wisdom' },
  { level: 60, name: 'Forest Spirit', id: 'forest_spirit', dicebear: 'Spirit', desc: 'Nature voice' },
  { level: 70, name: 'Desert Nomad', id: 'desert_nomad', dicebear: 'Nomad', desc: 'Sand walker' },
  { level: 80, name: 'Arctic Hunter', id: 'arctic_hunter', dicebear: 'Hunter', desc: 'Ice stalker' },
  { level: 90, name: 'Lava Titan', id: 'lava_titan', dicebear: 'Titan', desc: 'Molten fury' },
  { level: 100, name: 'Storm Caller', id: 'storm_caller', dicebear: 'Storm', desc: 'Lightning master' }
];

const SEASON_2_AVATARS: SeasonAvatar[] = [
  { level: 10, name: 'Nano Scout', id: 'nano_banana_pro_1', dicebear: 'nano_banana_pro_1', desc: 'Recon Unit' },
  { level: 20, name: 'Cyber Banana', id: 'nano_banana_pro_2', dicebear: 'nano_banana_pro_2', desc: 'Enhanced organic' },
  { level: 30, name: 'Neon Ape', id: 'nano_banana_pro_3', dicebear: 'nano_banana_pro_3', desc: 'City dweller' },
  { level: 40, name: 'Glitch Monkey', id: 'nano_banana_pro_4', dicebear: 'nano_banana_pro_4', desc: 'System error' },
  { level: 50, name: 'Mecha Kong', id: 'nano_banana_pro_5', dicebear: 'nano_banana_pro_5', desc: 'Heavy hitter' },
  { level: 60, name: 'Circuit Simian', id: 'nano_banana_pro_6', dicebear: 'nano_banana_pro_6', desc: 'Network flow' },
  { level: 70, name: 'Data Chimp', id: 'nano_banana_pro_7', dicebear: 'nano_banana_pro_7', desc: 'Info broker' },
  { level: 80, name: 'Void Primate', id: 'nano_banana_pro_8', dicebear: 'nano_banana_pro_8', desc: 'Dark sector' },
  { level: 90, name: 'Quantum Gorilla', id: 'nano_banana_pro_9', dicebear: 'nano_banana_pro_9', desc: 'Reality bender' },
  { level: 100, name: 'Nano Banana God', id: 'nano_banana_pro_10', dicebear: 'nano_banana_pro_10', desc: 'Ascended' }
];

// --- Logic ---
const generateSeasonRewards = (season: Omit<Season, 'rewards'>) => {
  return Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    let freeReward = null;
    let premiumReward = null;

    // --- FREE TRACK ---
    const lastDigit = level % 10;
    if ([1, 3, 6, 9].includes(lastDigit) || level === 50 || level === 100) {
      if (level % 10 === 0) {
        freeReward = { type: 'coins', amount: 500, name: 'Big Coin Stash', icon: 'coins_large' };
      } else if (level % 3 === 0) {
        freeReward = { type: 'coins', amount: 100, name: 'Coin Pouch', icon: 'coins_small' };
      } else {
        freeReward = { type: 'coins', amount: 50, name: 'Loose Change', icon: 'coins_small' };
      }
    }

    // --- PREMIUM TRACK ---
    
    // 1. Avatars
    if (level % 10 === 0) {
      const avatarReward = season.avatars.find(a => a.level === level);
      premiumReward = {
        type: 'avatar',
        name: avatarReward?.name || 'Mystery Avatar',
        desc: avatarReward?.desc || 'Exclusive Season Avatar',
        value: avatarReward?.id,
        preview: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${avatarReward?.dicebear || 'mystery'}`,
        icon: 'avatar_legendary',
        rarity: 'legendary'
      };
    }
    // Extra avatars at mid-points (5, 15...)
    else if (level % 10 === 5) {
      const avatarIndex = Math.floor(level / 10) + 10;
      premiumReward = {
        type: 'avatar',
        name: `Agent #${level}`,
        desc: 'Exclusive Agent Avatar',
        value: `avatar_${level}`,
        preview: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=agent${level}`,
        icon: 'avatar_epic',
        rarity: 'epic'
      };
    }
    // 2. Cosmetics / Effects
    else if (level % 3 === 0) {
      const allEffects = [
        { id: 'glow', name: 'Glow', desc: 'Pulsing magical border' },
        { id: 'fire', name: 'Fire', desc: 'Rotating fire gradient' },
        { id: 'ice', name: 'Ice', desc: 'Shimmering icy border' },
        { id: 'neon', name: 'Neon', desc: 'Flickering neon effect' },
        { id: 'sparkle', name: 'Sparkle', desc: 'Gold sparkle border' },
        { id: 'flame_burst', name: 'Flame Burst', desc: 'Animated flames' },
        { id: 'frost_aura', name: 'Frost Aura', desc: 'Icy particles' },
        { id: 'lightning_arc', name: 'Lightning', desc: 'Electric sparks' },
        { id: 'water_ripple', name: 'Water Ripple', desc: 'Flowing water' },
        { id: 'galaxy_swirl', name: 'Galaxy Swirl', desc: 'Rotating galaxy' },
        { id: 'star_field', name: 'Star Field', desc: 'Twinkling stars' },
        { id: 'nebula_glow', name: 'Nebula', desc: 'Colorful nebula' },
        { id: 'void_edge', name: 'Void Edge', desc: 'Dark matter' },
        { id: 'rainbow_pulse', name: 'Rainbow', desc: 'Shifting rainbow' },
        { id: 'gold_luxury', name: 'Gold Luxury', desc: 'Ornate gold' },
        { id: 'diamond_shine', name: 'Diamond', desc: 'Crystal shine' },
        { id: 'shadow_flame', name: 'Shadow Flame', desc: 'Dark fire' },
        { id: 'aurora_wave', name: 'Aurora', desc: 'Northern lights' },
        { id: 'pixel_glitch', name: 'Pixel Glitch', desc: 'Retro pixels' },
        { id: 'holo_shimmer', name: 'Holographic', desc: 'Holo shine' },
        { id: 'wave_motion', name: 'Wave Motion', desc: 'Flowing waves' },
        { id: 'color_morph', name: 'Color Morph', desc: 'Rainbow cycle' },
        { id: 'matrix_rain', name: 'Matrix Rain', desc: 'Code cascade' },
        { id: 'prism_split', name: 'Prism Split', desc: 'RGB split' },
        { id: 'glitch_wild', name: 'Glitch Wild', desc: 'Chaotic glitch' },
        { id: 'lava_flow', name: 'Lava Flow', desc: 'Molten lava' },
        { id: 'electric_pulse', name: 'Electric', desc: 'Lightning zaps' },
        { id: 'oil_slick', name: 'Oil Slick', desc: 'Iridescent oil' },
        { id: 'chromatic_abberation', name: 'Chromatic', desc: 'Color split' },
        { id: 'quantum_flux', name: 'Quantum', desc: 'Phase shift' }
      ];
      const effectIndex = Math.floor((level / 3) - 1) % allEffects.length;
      const effect = allEffects[effectIndex];
      premiumReward = {
        type: 'effect',
        name: `${effect.name} Frame`,
        desc: effect.desc,
        value: `effect_${effect.id}`,
        icon: 'magic_wand',
        rarity: effectIndex < 5 ? 'rare' : effectIndex < 20 ? 'epic' : 'legendary'
      };
    }
    // 3. XP Boosters
    else if (level % 4 === 0) {
      premiumReward = {
        type: 'booster',
        name: 'XP Booster (1h)',
        desc: 'Double XP for 1 hour',
        value: 'xp_boost_1h',
        icon: 'booster_pack',
        rarity: 'rare'
      };
    }
    // 4. Filler
    else {
      premiumReward = {
        type: 'coins',
        amount: 250 * (Math.floor(level / 20) + 1),
        name: 'Premium Coins',
        icon: 'coin_pile_huge'
      };
    }

    return { level, free: freeReward, premium: premiumReward };
  });
};

const overrides: Record<number, any> = {
  1: { premium: { type: 'avatar', name: 'Nano Scout', value: 'nano_banana_pro_1', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_1' } },
  2: { premium: { type: 'effect', name: 'Rainbow Pulse', value: 'effect_rainbow', icon: '🌈' } },
  4: { premium: { type: 'avatar', name: 'Space Explorer', value: 'space_explorer', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=SpaceExplorer' } },
  5: { premium: { type: 'effect', name: 'Gold Luxury', value: 'effect_gold', icon: '👑' } },
  6: { premium: { type: 'avatar', name: 'Cyber Banana', value: 'nano_banana_pro_2', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_2' } },
  7: { premium: { type: 'effect', name: 'Diamond Shine', value: 'effect_diamond', icon: '💎' } },
  8: { premium: { type: 'effect', name: 'Matrix Rain', value: 'effect_matrix', icon: '💻' } },
  9: { premium: { type: 'avatar', name: 'Neon Ape', value: 'nano_banana_pro_3', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_3' } },
  10: { premium: { type: 'effect', name: 'Glitch Wild', value: 'effect_glitch_wild', icon: '👾' } },
  11: { premium: { type: 'avatar', name: 'Glitch Monkey', value: 'nano_banana_pro_4', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_4' } },
  12: { premium: { type: 'effect', name: 'Holo Shimmer', value: 'effect_holo', icon: '💿' } },
  14: { premium: { type: 'avatar', name: 'Mecha Kong', value: 'nano_banana_pro_5', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_5' } },
  15: { premium: { type: 'effect', name: 'Quantum Flux', value: 'effect_quantum', icon: '⚛️' } }
};

const SEASONS: Omit<Season, 'rewards'>[] = [
  {
    id: 1,
    name: 'Genesis',
    theme: 'space',
    startDate: Date.parse('2025-11-24T00:00:00Z'),
    endDate: Date.parse('2025-12-31T00:00:00Z'),
    colors: {
      primary: '#d946ef',
      secondary: '#a855f7',
      accent: '#3b82f6',
      bgDark: '#0f172a',
      bgCard: '#1e293b'
    },
    avatars: SEASON_1_AVATARS
  },
  {
    id: 2,
    name: 'Neon Uprising',
    theme: 'cyberpunk',
    startDate: Date.parse('2026-01-01T00:00:00Z'),
    endDate: Date.parse('2026-03-31T23:59:59Z'),
    colors: {
      primary: '#00ff9f',
      secondary: '#ff00ff',
      accent: '#00d4ff',
      bgDark: '#0a0e1a',
      bgCard: '#1a1f3a'
    },
    avatars: SEASON_2_AVATARS
  }
];

const seasonsWithRewards = SEASONS.map(season => {
  const rewards = generateSeasonRewards(season);
  
  if (season.id === 2) {
     return {
      ...season,
      rewards: rewards.map(r => {
        const ov = overrides[r.level];
        return ov ? { ...r, ...ov } : r;
      })
    };
  }
  
  return {
    ...season,
    rewards
  };
});

const output = {
  currentSeasonId: 1,
  seasons: seasonsWithRewards
};

fs.writeFileSync(path.join(process.cwd(), 'public/season_settings.json'), JSON.stringify(output, null, 2));
console.log('Generated public/season_settings.json');
