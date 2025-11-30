// ============================================
// KARTENSCHMIEDE - Enemy Definitions
// ============================================
// 40+ unique enemies and 15 bosses across 5 acts

import { Enemy, EnemyIntent, EnemyIntentType } from './types';

// ===================
// HELPER: Create Enemy
// ===================
const createEnemy = (
  id: string,
  name: string,
  nameDE: string,
  maxHp: number,
  intents: EnemyIntent[],
  artwork: string,
  actNumber: 1 | 2 | 3,
  isElite: boolean = false,
  isBoss: boolean = false,
  passiveAbility?: { name: string; description: string }
): Enemy => ({
  id,
  name,
  nameDE,
  maxHp,
  currentHp: maxHp,
  block: 0,
  artwork,
  intents,
  currentIntentIndex: 0,
  passiveAbility: passiveAbility ? { ...passiveAbility, effect: () => {} } : undefined,
  statusEffects: [],
  actNumber,
  isElite,
  isBoss,
});

// ===================
// INTENT HELPERS
// ===================
const attack = (value: number, desc?: string): EnemyIntent => ({
  type: 'attack',
  value,
  description: desc,
  icon: '⚔️',
});

const multiAttack = (value: number, times: number): EnemyIntent => ({
  type: 'attack',
  value,
  description: `${times}x ${value}`,
  icon: '⚔️⚔️',
});

const defend = (value: number): EnemyIntent => ({
  type: 'defend',
  value,
  description: `Gain ${value} Block`,
  icon: '🛡️',
});

const buff = (value: number, desc?: string): EnemyIntent => ({
  type: 'buff',
  value,
  description: desc || `Gain ${value} Strength`,
  icon: '💪',
});

const debuff = (value: number, desc?: string): EnemyIntent => ({
  type: 'debuff',
  value,
  description: desc || `Apply ${value} Vulnerable`,
  icon: '💔',
});

const special = (desc: string): EnemyIntent => ({
  type: 'special',
  description: desc,
  icon: '⭐',
});

const unknown = (): EnemyIntent => ({
  type: 'unknown',
  icon: '❓',
});

// =============================================
// 🔥 ACT 1: FIRE ENEMIES (The Burning Depths)
// =============================================

export const FIRE_ENEMIES: Enemy[] = [
  // COMMON ENEMIES
  createEnemy(
    'fire_minion', 'Fire Imp', 'Feuerteufel',
    25, [attack(6), attack(6), attack(9)],
    '👹🔥', 1
  ),
  createEnemy(
    'fire_soldier', 'Flame Soldier', 'Flammensoldat',
    35, [attack(8), defend(6), attack(11)],
    '🗡️🔥', 1
  ),
  createEnemy(
    'fire_mage', 'Pyromancer', 'Pyromant',
    28, [buff(2, 'Gain 2 Strength'), attack(5), attack(5), multiAttack(3, 3)],
    '🧙🔥', 1
  ),
  createEnemy(
    'fire_hound', 'Hellhound', 'Höllenhund',
    20, [attack(7), attack(7), multiAttack(4, 2)],
    '🐕🔥', 1
  ),
  createEnemy(
    'fire_golem', 'Magma Golem', 'Magmagolem',
    45, [defend(8), attack(12), special('Explode: Deal 15 to all')],
    '🗿🔥', 1
  ),
  createEnemy(
    'fire_spirit', 'Ember Spirit', 'Glutgeist',
    22, [attack(5), debuff(1, 'Apply 1 Burn'), attack(8)],
    '👻🔥', 1
  ),
  createEnemy(
    'fire_cultist', 'Flame Cultist', 'Flammenkultist',
    30, [buff(1), attack(6), attack(10)],
    '🧛🔥', 1
  ),
  createEnemy(
    'fire_champion', 'Inferno Champion', 'Infernochampion',
    55, [attack(10), defend(10), multiAttack(5, 3), buff(3)],
    '👑🔥', 1
  ),
  
  // ELITE ENEMIES
  createEnemy(
    'elite_fire_1', 'Volcanic Brute', 'Vulkanischer Koloss',
    85, [attack(15), defend(12), multiAttack(8, 2), special('Eruption: 20 damage to all')],
    '💪🔥', 1, true, false,
    { name: 'Molten Core', description: 'Gains 2 Strength when damaged' }
  ),
  createEnemy(
    'elite_fire_2', 'Pyroclast Mage', 'Pyroklast-Magier',
    70, [buff(3), multiAttack(5, 4), debuff(2), special('Inferno: 25 damage, apply 3 Burn')],
    '🔮🔥', 1, true, false,
    { name: 'Flame Shield', description: 'Starts with 15 Block' }
  ),
  createEnemy(
    'elite_fire_3', 'Blazing Executioner', 'Lodernder Henker',
    80, [attack(18), attack(22), special('Execute: Deal 30 if below 50% HP')],
    '⚔️🔥', 1, true, false,
    { name: 'Bloodlust', description: 'Gains Strength when enemy dies' }
  ),
];

// =============================================
// 💧 ACT 2: WATER ENEMIES (The Frozen Abyss)
// =============================================

export const WATER_ENEMIES: Enemy[] = [
  // COMMON ENEMIES
  createEnemy(
    'water_minion', 'Ice Sprite', 'Eiselfe',
    28, [attack(6), debuff(1, 'Apply 1 Weak'), attack(8)],
    '🧚💧', 2
  ),
  createEnemy(
    'water_soldier', 'Frost Guard', 'Frostwächter',
    40, [defend(10), attack(9), defend(8), attack(12)],
    '🛡️💧', 2
  ),
  createEnemy(
    'water_mage', 'Ice Mage', 'Eismagier',
    32, [debuff(2, 'Apply 2 Weak'), attack(7), special('Freeze: Skip your next turn')],
    '🧙💧', 2
  ),
  createEnemy(
    'water_fish', 'Abyssal Angler', 'Abgründiger Angler',
    35, [attack(8), attack(8), multiAttack(4, 3)],
    '🐟💧', 2
  ),
  createEnemy(
    'water_elemental', 'Water Elemental', 'Wasserelementar',
    50, [defend(12), attack(10), special('Heal 10 HP')],
    '🌊', 2
  ),
  createEnemy(
    'water_jellyfish', 'Giant Jellyfish', 'Riesenqualle',
    25, [debuff(1, 'Apply 1 Frail'), attack(5), debuff(2)],
    '🎐💧', 2
  ),
  createEnemy(
    'water_crab', 'Frost Crab', 'Frostkrabbe',
    45, [defend(15), attack(8), multiAttack(5, 2)],
    '🦀💧', 2
  ),
  createEnemy(
    'water_champion', 'Tidal Champion', 'Gezeitenchampion',
    60, [attack(12), defend(12), debuff(2), multiAttack(6, 3)],
    '👑💧', 2
  ),
  
  // ELITE ENEMIES
  createEnemy(
    'elite_water_1', 'Frost Giant', 'Frostriese',
    100, [attack(18), defend(20), special('Blizzard: 12 damage to all, apply 2 Weak')],
    '🏔️💧', 2, true, false,
    { name: 'Ice Armor', description: 'Gains 5 Block at start of turn' }
  ),
  createEnemy(
    'elite_water_2', 'Siren', 'Sirene',
    75, [debuff(3, 'Apply 3 Weak'), attack(10), special('Charm: You discard a random card')],
    '🧜💧', 2, true, false,
    { name: 'Alluring Song', description: 'Heals 5 HP each turn' }
  ),
  createEnemy(
    'elite_water_3', 'Deep One', 'Tiefenseher',
    90, [attack(15), multiAttack(7, 3), special('From the Deep: Summon 2 minions')],
    '🐙💧', 2, true, false,
    { name: 'Tentacle Grasp', description: 'Your cards cost 1 more this turn' }
  ),
];

// =============================================
// 🌍 ACT 3: EARTH ENEMIES (The Living Caverns)
// =============================================

export const EARTH_ENEMIES: Enemy[] = [
  // COMMON ENEMIES
  createEnemy(
    'earth_minion', 'Stone Beetle', 'Steinkäfer',
    35, [defend(8), attack(8), attack(10)],
    '🪲🌍', 3
  ),
  createEnemy(
    'earth_soldier', 'Crystal Guardian', 'Kristallwächter',
    50, [defend(12), attack(10), defend(15)],
    '💎🛡️', 3
  ),
  createEnemy(
    'earth_mage', 'Geomancer', 'Geomant',
    38, [buff(2), special('Stone Wall: Gain 20 Block'), attack(12)],
    '🧙🌍', 3
  ),
  createEnemy(
    'earth_worm', 'Cave Worm', 'Höhlenwurm',
    45, [attack(9), attack(9), multiAttack(5, 3)],
    '🪱🌍', 3
  ),
  createEnemy(
    'earth_golem', 'Stone Golem', 'Steingolem',
    70, [defend(15), attack(15), special('Earthquake: 10 damage to all')],
    '🗿', 3
  ),
  createEnemy(
    'earth_mushroom', 'Fungal Horror', 'Pilzschrecken',
    32, [debuff(2, 'Apply 2 Poison'), attack(6), special('Spore Cloud: 3 Poison to all')],
    '🍄🌍', 3
  ),
  createEnemy(
    'earth_treant', 'Ancient Treant', 'Uralter Treant',
    65, [defend(10), special('Heal 15 HP'), attack(14)],
    '🌳', 3
  ),
  createEnemy(
    'earth_champion', 'Mountain King', 'Bergkönig',
    75, [attack(14), defend(18), buff(3), multiAttack(7, 3)],
    '👑🌍', 3
  ),
  
  // ELITE ENEMIES
  createEnemy(
    'elite_earth_1', 'Crystal Colossus', 'Kristallkoloss',
    120, [defend(25), attack(20), special('Shatter: Deal damage equal to Block')],
    '💎🗿', 3, true, false,
    { name: 'Reflective Armor', description: 'Reflects 3 damage when attacked' }
  ),
  createEnemy(
    'elite_earth_2', 'Living Mountain', 'Lebender Berg',
    150, [defend(20), attack(18), attack(18), special('Avalanche: 25 damage to all')],
    '⛰️', 3, true, false,
    { name: 'Immovable', description: 'Cannot be weakened' }
  ),
  createEnemy(
    'elite_earth_3', 'Fungal Queen', 'Pilzkönigin',
    90, [debuff(3, 'Apply 3 Poison'), special('Summon Spore'), attack(12)],
    '🍄👑', 3, true, false,
    { name: 'Toxic Aura', description: 'Apply 1 Poison at start of turn' }
  ),
];

// =============================================
// 💨 ACT 4: AIR ENEMIES (The Ethereal Peaks)
// =============================================

export const AIR_ENEMIES: Enemy[] = [
  // COMMON ENEMIES
  createEnemy(
    'air_minion', 'Wind Wisp', 'Windwicht',
    22, [attack(5), attack(5), multiAttack(3, 4)],
    '💨✨', 3
  ),
  createEnemy(
    'air_soldier', 'Storm Knight', 'Sturmritter',
    45, [attack(10), defend(8), multiAttack(6, 2)],
    '⚔️💨', 3
  ),
  createEnemy(
    'air_mage', 'Tempest Mage', 'Sturmmagier',
    35, [buff(2), attack(8), special('Lightning: 15 damage, ignores Block')],
    '🧙💨', 3
  ),
  createEnemy(
    'air_bird', 'Thunderbird', 'Donnervogel',
    30, [multiAttack(4, 4), attack(12)],
    '🦅⚡', 3
  ),
  createEnemy(
    'air_elemental', 'Air Elemental', 'Luftelementar',
    40, [attack(8), special('Gust: Discard your hand'), attack(12)],
    '🌬️', 3
  ),
  createEnemy(
    'air_harpy', 'Storm Harpy', 'Sturmharpyie',
    38, [debuff(1, 'Apply 1 Weak'), multiAttack(5, 3), attack(10)],
    '🦅💨', 3
  ),
  createEnemy(
    'air_djinn', 'Lesser Djinn', 'Kleiner Dschinn',
    50, [buff(1), attack(10), special('Wish: Heal to full')],
    '🧞💨', 3
  ),
  createEnemy(
    'air_champion', 'Sky Lord', 'Himmelsfürst',
    70, [multiAttack(8, 3), defend(15), special('Tornado: 20 damage, apply 2 Weak')],
    '👑💨', 3
  ),
  
  // ELITE ENEMIES
  createEnemy(
    'elite_air_1', 'Storm Dragon', 'Sturmdrache',
    130, [attack(20), multiAttack(10, 3), special('Lightning Breath: 25 to all')],
    '🐉⚡', 3, true, false,
    { name: 'Flight', description: 'Takes 25% less damage' }
  ),
  createEnemy(
    'elite_air_2', 'Wind Titan', 'Windtitan',
    110, [defend(20), attack(18), special('Cyclone: 15 damage to all, discard 1 card')],
    '💨🗿', 3, true, false,
    { name: 'Evasive', description: '20% chance to dodge attacks' }
  ),
  createEnemy(
    'elite_air_3', 'Thunder God\'s Avatar', 'Avatar des Donnergottes',
    100, [buff(4), multiAttack(8, 4), special('Divine Storm: 30 damage, Stun')],
    '⚡👑', 3, true, false,
    { name: 'Divine Protection', description: 'Gains 10 Block when buffing' }
  ),
];

// =============================================
// 🌑 ACT 5: VOID ENEMIES (The Void Heart)
// =============================================

export const VOID_ENEMIES: Enemy[] = [
  // COMMON ENEMIES
  createEnemy(
    'void_minion', 'Void Spawn', 'Leerenbrut',
    30, [attack(8), debuff(1, 'Apply 1 Vulnerable'), attack(10)],
    '👾🌑', 3
  ),
  createEnemy(
    'void_soldier', 'Void Knight', 'Leerenritter',
    55, [attack(12), defend(10), multiAttack(7, 2)],
    '⚔️🌑', 3
  ),
  createEnemy(
    'void_mage', 'Entropy Mage', 'Entropiemagier',
    40, [special('Corrupt: Add 2 Curses to deck'), attack(10), debuff(2)],
    '🧙🌑', 3
  ),
  createEnemy(
    'void_horror', 'Abyssal Horror', 'Abgrundschrecken',
    60, [attack(15), multiAttack(6, 3), special('Fear: Exhaust 2 cards')],
    '👹🌑', 3
  ),
  createEnemy(
    'void_wraith', 'Void Wraith', 'Leerengeist',
    35, [debuff(2, 'Apply 2 Frail'), attack(8), special('Life Drain: Deal 10, heal 10')],
    '👻🌑', 3
  ),
  createEnemy(
    'void_devourer', 'Card Devourer', 'Kartenverschlinger',
    50, [special('Devour: Exhaust top 2 cards of draw pile'), attack(12)],
    '😈🌑', 3
  ),
  createEnemy(
    'void_aberration', 'Chaos Aberration', 'Chaosaberration',
    45, [unknown(), unknown(), unknown()], // Random intents
    '🎭🌑', 3
  ),
  createEnemy(
    'void_champion', 'Void Champion', 'Leerenchampion',
    80, [attack(16), defend(15), multiAttack(8, 3), special('Annihilate: 35 damage')],
    '👑🌑', 3
  ),
  
  // ELITE ENEMIES
  createEnemy(
    'elite_void_1', 'Entropy Incarnate', 'Inkarnation der Entropie',
    140, [special('Corrupt All: Add Curse to hand'), attack(22), multiAttack(10, 3)],
    '💀🌑', 3, true, false,
    { name: 'Chaos Field', description: 'Your cards cost 1 more' }
  ),
  createEnemy(
    'elite_void_2', 'Void Colossus', 'Leerenkoloss',
    160, [defend(30), attack(25), special('Void Crush: 40 damage')],
    '🗿🌑', 3, true, false,
    { name: 'Void Armor', description: 'Immune to debuffs' }
  ),
  createEnemy(
    'elite_void_3', 'Mind Flayer', 'Gedankenschinder',
    100, [debuff(3), special('Mind Control: Play your top card against you'), attack(15)],
    '🐙🌑', 3, true, false,
    { name: 'Psychic Link', description: 'Copies buffs you gain' }
  ),
];

// =============================================
// 💀 BOSSES (3 per Act = 15 total)
// =============================================

export const BOSSES: Enemy[] = [
  // ACT 1 BOSSES (Fire)
  createEnemy(
    'boss_flame_phoenix', 'Flame Phoenix', 'Flammenphönix',
    180, [
      attack(15),
      multiAttack(8, 3),
      buff(3, 'Gain 3 Strength'),
      special('Rebirth: If killed, revive with 50 HP once'),
    ],
    '🦅🔥', 1, false, true,
    { name: 'Burning Aura', description: 'Deal 3 damage to player at end of turn' }
  ),
  createEnemy(
    'boss_molten_giant', 'Molten Giant', 'Geschmolzener Riese',
    220, [
      defend(20),
      attack(25),
      special('Lava Pool: Create hazard dealing 5/turn'),
      multiAttack(10, 3),
    ],
    '🗿🔥', 1, false, true,
    { name: 'Molten Body', description: 'Attackers take 5 damage' }
  ),
  createEnemy(
    'boss_fire_wyrm', 'Ancient Fire Wyrm', 'Uralter Feuerwurm',
    200, [
      attack(20),
      multiAttack(6, 5),
      special('Fire Breath: 30 damage to all'),
      buff(4),
    ],
    '🐉🔥', 1, false, true,
    { name: 'Scales', description: 'Takes 25% less damage from attacks' }
  ),

  // ACT 2 BOSSES (Water)
  createEnemy(
    'boss_ice_queen', 'Ice Queen', 'Eiskönigin',
    200, [
      debuff(3, 'Apply 3 Weak'),
      attack(18),
      special('Blizzard: 20 damage, apply 2 Frail to all'),
      defend(25),
    ],
    '👑❄️', 2, false, true,
    { name: 'Frozen Heart', description: 'Immune to Burn' }
  ),
  createEnemy(
    'boss_kraken', 'The Kraken', 'Der Kraken',
    280, [
      multiAttack(8, 4),
      special('Tentacle Grab: Discard 2 cards'),
      attack(22),
      defend(15),
    ],
    '🐙🌊', 2, false, true,
    { name: 'Regeneration', description: 'Heals 10 HP per turn' }
  ),
  createEnemy(
    'boss_frost_titan', 'Frost Titan', 'Frosttitan',
    260, [
      defend(30),
      attack(28),
      special('Absolute Zero: Freeze player for 1 turn'),
      multiAttack(12, 3),
    ],
    '🏔️❄️', 2, false, true,
    { name: 'Permafrost', description: 'Block doesn\'t expire' }
  ),

  // ACT 3 BOSSES (Earth)
  createEnemy(
    'boss_stone_golem', 'Ancient Stone Golem', 'Uralter Steingolem',
    300, [
      defend(35),
      attack(30),
      special('Earthquake: 25 damage to all, apply 2 Vulnerable'),
      buff(5),
    ],
    '🗿👑', 3, false, true,
    { name: 'Stone Skin', description: 'Takes 5 less damage from all sources' }
  ),
  createEnemy(
    'boss_crystal_hydra', 'Crystal Hydra', 'Kristallhydra',
    240, [
      multiAttack(12, 3),
      special('Regrow Head: Gain 50 HP, +5 Strength'),
      attack(20),
      defend(20),
    ],
    '🐉💎', 3, false, true,
    { name: 'Multiple Heads', description: 'Attacks twice per turn' }
  ),
  createEnemy(
    'boss_world_tree', 'Corrupted World Tree', 'Verdorbener Weltenbaum',
    350, [
      special('Root: Player loses 1 energy'),
      attack(15),
      special('Life Drain: Deal 20, heal 20'),
      special('Summon Treants'),
    ],
    '🌳👹', 3, false, true,
    { name: 'Deep Roots', description: 'Cannot be moved or stunned' }
  ),

  // ACT 4 BOSSES (Air)
  createEnemy(
    'boss_storm_lord', 'Storm Lord', 'Sturmfürst',
    280, [
      multiAttack(10, 4),
      special('Chain Lightning: 15 damage x3 random'),
      buff(4),
      special('Wind Wall: Gain 40 Block'),
    ],
    '⚡👑', 3, false, true,
    { name: 'Eye of the Storm', description: 'Draw 1 less card per turn' }
  ),
  createEnemy(
    'boss_thunder_dragon', 'Thunder Dragon', 'Donnerdrache',
    320, [
      attack(25),
      multiAttack(8, 5),
      special('Thunder Breath: 35 damage, Stun'),
      defend(25),
    ],
    '🐉⚡', 3, false, true,
    { name: 'Flight', description: '30% chance to dodge attacks' }
  ),
  createEnemy(
    'boss_sky_serpent', 'Sky Serpent', 'Himmelsschlange',
    250, [
      multiAttack(7, 6),
      special('Coil: Next attack deals double'),
      attack(30),
      debuff(4, 'Apply 4 Weak'),
    ],
    '🐍💨', 3, false, true,
    { name: 'Constrict', description: 'Player takes 5 damage when playing cards' }
  ),

  // ACT 5 BOSSES (Void)
  createEnemy(
    'boss_void_emperor', 'Void Emperor', 'Leerenkaiser',
    350, [
      special('Erase: Exhaust 3 cards from deck'),
      attack(28),
      multiAttack(12, 4),
      special('Reality Tear: Add 5 Curses to deck'),
    ],
    '👑🌑', 3, false, true,
    { name: 'Void Presence', description: 'Cards cost 1 more' }
  ),
  createEnemy(
    'boss_entropy_incarnate', 'Entropy Incarnate', 'Inkarnation der Entropie',
    400, [
      special('Unmake: Transform random card into Curse'),
      multiAttack(15, 3),
      debuff(5, 'Apply 5 Vulnerable'),
      special('End of Time: Skip next 2 turns, then deal 100'),
    ],
    '💀🌑', 3, false, true,
    { name: 'Entropic Field', description: 'All healing reduced by 50%' }
  ),
  createEnemy(
    'boss_the_end', 'The End', 'Das Ende',
    500, [
      attack(30),
      special('Oblivion: Exhaust entire hand'),
      multiAttack(10, 6),
      special('Final Strike: Deal 999 damage (after 10 turns)'),
      buff(5),
    ],
    '☠️🌑', 3, false, true,
    { name: 'Inevitability', description: 'Gains 1 Strength each turn' }
  ),
];

// =============================================
// ALL ENEMIES COMBINED
// =============================================

export const ALL_ENEMIES: Enemy[] = [
  ...FIRE_ENEMIES,
  ...WATER_ENEMIES,
  ...EARTH_ENEMIES,
  ...AIR_ENEMIES,
  ...VOID_ENEMIES,
];

export const ALL_BOSSES: Enemy[] = BOSSES;

// =============================================
// HELPER FUNCTIONS
// =============================================

export function getEnemyById(id: string): Enemy | undefined {
  return [...ALL_ENEMIES, ...ALL_BOSSES].find(e => e.id === id);
}

export function getEnemiesForAct(actNumber: number): Enemy[] {
  return ALL_ENEMIES.filter(e => e.actNumber === actNumber && !e.isElite && !e.isBoss);
}

export function getElitesForAct(actNumber: number): Enemy[] {
  return ALL_ENEMIES.filter(e => e.actNumber === actNumber && e.isElite);
}

export function getBossesForAct(actNumber: number): Enemy[] {
  const actThemes: Record<number, string> = {
    1: 'fire',
    2: 'water', 
    3: 'earth',
    4: 'air',
    5: 'void',
  };
  const theme = actThemes[actNumber];
  return ALL_BOSSES.filter(b => b.id.includes(theme) || (actNumber === 5 && b.id.includes('void')));
}

export function getRandomEnemy(actNumber: number, isElite: boolean = false): Enemy {
  const pool = isElite ? getElitesForAct(actNumber) : getEnemiesForAct(actNumber);
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getRandomBoss(actNumber: number): Enemy {
  const bosses = getBossesForAct(actNumber);
  return { ...bosses[Math.floor(Math.random() * bosses.length)] };
}

export function scaleEnemyForFloor(enemy: Enemy, floor: number, ascension: number = 0): Enemy {
  const scaled = { ...enemy };
  
  // Scale HP based on floor
  const hpMultiplier = 1 + (floor / 100) * 0.5;
  scaled.maxHp = Math.floor(scaled.maxHp * hpMultiplier);
  scaled.currentHp = scaled.maxHp;
  
  // Apply ascension modifiers
  if (ascension > 0) {
    const ascensionHpBonus = 1 + (ascension * 0.05);
    scaled.maxHp = Math.floor(scaled.maxHp * ascensionHpBonus);
    scaled.currentHp = scaled.maxHp;
    
    // Scale intents
    scaled.intents = scaled.intents.map(intent => {
      if (intent.type === 'attack' && intent.value) {
        const damageBonus = 1 + (ascension * 0.03);
        return { ...intent, value: Math.floor(intent.value * damageBonus) };
      }
      return intent;
    });
  }
  
  return scaled;
}

// Enemy count logging
const regularCount = ALL_ENEMIES.filter(e => !e.isElite).length;
const eliteCount = ALL_ENEMIES.filter(e => e.isElite).length;
const bossCount = ALL_BOSSES.length;

console.log(`[Deckbuilder] Loaded ${ALL_ENEMIES.length + ALL_BOSSES.length} enemies:
  - Regular: ${regularCount}
  - Elite: ${eliteCount}
  - Bosses: ${bossCount}
`);

export default {
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
};
