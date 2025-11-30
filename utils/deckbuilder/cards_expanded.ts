// ============================================
// KARTENSCHMIEDE - Expanded Card Definitions
// ============================================
// Additional 100+ cards for deeper gameplay

import { DeckbuilderCard, CardElement, CardType, CardRarity, CardEffect } from './types';

// ===================
// HELPER: Create Card
// ===================
const createCard = (
  id: string,
  name: string,
  nameDE: string,
  element: CardElement,
  type: CardType,
  rarity: CardRarity,
  cost: number,
  value: number,
  description: string,
  descriptionDE: string,
  effects: CardEffect[],
  artwork: string,
  keywords?: DeckbuilderCard['keywords'],
  upgradedVersion?: Partial<DeckbuilderCard>
): DeckbuilderCard => ({
  id,
  name,
  nameDE,
  element,
  type,
  rarity,
  cost,
  baseCost: cost,
  value,
  baseValue: value,
  description,
  descriptionDE,
  effects,
  upgraded: false,
  upgradedVersion,
  keywords,
  artwork,
});

// =============================================
// 🔥 EXPANDED FIRE CARDS
// =============================================
export const FIRE_CARDS_EXPANDED: DeckbuilderCard[] = [
  // COMMON
  createCard(
    'fire_spark', 'Spark', 'Funke',
    'fire', 'attack', 'common', 0, 3,
    'Deal 3 damage. Draw 1 card if enemy is Burning.', 'Verursache 3 Schaden. Ziehe 1 Karte wenn Gegner brennt.',
    [{ type: 'damage', target: 'enemy', value: 3 }],
    '⚡'
  ),
  createCard(
    'fire_ritual', 'Fire Ritual', 'Feuerritual',
    'fire', 'skill', 'common', 1, 2,
    'Gain 2 Strength. Exhaust.', 'Erhalte 2 Stärke. Erschöpfung.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '🕯️',
    ['exhaust']
  ),
  createCard(
    'singe', 'Singe', 'Versengen',
    'fire', 'attack', 'common', 1, 5,
    'Deal 5 damage. Apply 2 Burn.', 'Verursache 5 Schaden. Füge 2 Verbrennung zu.',
    [
      { type: 'damage', target: 'enemy', value: 5 },
      { type: 'debuff', target: 'enemy', value: 2, duration: 2 }
    ],
    '🔥'
  ),
  createCard(
    'flame_barrier', 'Flame Barrier', 'Flammenbarriere',
    'fire', 'skill', 'common', 2, 8,
    'Gain 8 Block. Deal 4 damage to attackers this turn.', 'Erhalte 8 Block. Verursache 4 Schaden an Angreifern diese Runde.',
    [
      { type: 'block', target: 'self', value: 8 },
      { type: 'buff', target: 'self', value: 4 }
    ],
    '🛡️🔥'
  ),
  createCard(
    'combustion', 'Combustion', 'Verbrennung',
    'fire', 'skill', 'common', 0, 3,
    'Lose 3 HP. Deal 3 damage to ALL enemies.', 'Verliere 3 LP. Verursache 3 Schaden an ALLEN Gegnern.',
    [
      { type: 'damage', target: 'self', value: 3 },
      { type: 'damage', target: 'all_enemies', value: 3 }
    ],
    '💥'
  ),

  // UNCOMMON
  createCard(
    'fire_chain', 'Fire Chain', 'Feuerkette',
    'fire', 'attack', 'uncommon', 1, 6,
    'Deal 6 damage. If this kills, deal 6 to another enemy.', 'Verursache 6 Schaden. Bei Tötung 6 an anderen Gegner.',
    [{ type: 'damage', target: 'enemy', value: 6 }],
    '⛓️🔥'
  ),
  createCard(
    'molten_armor', 'Molten Armor', 'Geschmolzene Rüstung',
    'fire', 'skill', 'uncommon', 2, 10,
    'Gain 10 Block. Gain 3 Thorns.', 'Erhalte 10 Block. Erhalte 3 Dornen.',
    [
      { type: 'block', target: 'self', value: 10 },
      { type: 'buff', target: 'self', value: 3 }
    ],
    '🔶'
  ),
  createCard(
    'pyromaniac', 'Pyromaniac', 'Pyromane',
    'fire', 'power', 'uncommon', 2, 3,
    'When you apply Burn, deal 3 additional damage.', 'Wenn du Verbrennung zufügst, verursache 3 zusätzlichen Schaden.',
    [{ type: 'buff', target: 'self', value: 3 }],
    '😈🔥'
  ),
  createCard(
    'firestorm', 'Firestorm', 'Feuersturm',
    'fire', 'attack', 'uncommon', 2, 5,
    'Deal 5 damage to ALL enemies 2 times.', 'Verursache 2x 5 Schaden an ALLEN Gegnern.',
    [
      { type: 'damage', target: 'all_enemies', value: 5 },
      { type: 'damage', target: 'all_enemies', value: 5 }
    ],
    '🌪️🔥'
  ),
  createCard(
    'smelt', 'Smelt', 'Schmelzen',
    'fire', 'skill', 'uncommon', 1, 0,
    'Upgrade a random card in your hand.', 'Verbessere eine zufällige Karte in deiner Hand.',
    [{ type: 'special', target: 'self', value: 0 }],
    '⚒️'
  ),
  createCard(
    'flame_dancer', 'Flame Dancer', 'Flammentänzer',
    'fire', 'attack', 'uncommon', 1, 3,
    'Deal 3 damage 3 times.', 'Verursache 3x 3 Schaden.',
    [
      { type: 'damage', target: 'enemy', value: 3 },
      { type: 'damage', target: 'enemy', value: 3 },
      { type: 'damage', target: 'enemy', value: 3 }
    ],
    '💃🔥'
  ),

  // RARE
  createCard(
    'blazing_heart', 'Blazing Heart', 'Brennendes Herz',
    'fire', 'power', 'rare', 2, 1,
    'At the start of each turn, apply 1 Burn to ALL enemies.', 'Zu Beginn jeder Runde füge ALLEN Gegnern 1 Verbrennung zu.',
    [{ type: 'debuff', target: 'all_enemies', value: 1 }],
    '❤️‍🔥'
  ),
  createCard(
    'volcanic_slam', 'Volcanic Slam', 'Vulkanschlag',
    'fire', 'attack', 'rare', 3, 28,
    'Deal 28 damage. Apply 4 Vulnerable.', 'Verursache 28 Schaden. Füge 4 Verwundbar zu.',
    [
      { type: 'damage', target: 'enemy', value: 28 },
      { type: 'debuff', target: 'enemy', value: 4, duration: 4 }
    ],
    '🌋'
  ),
  createCard(
    'fire_soul', 'Fire Soul', 'Feuerseele',
    'fire', 'power', 'rare', 3, 0,
    'Fire cards cost 1 less.', 'Feuerkarten kosten 1 weniger.',
    [{ type: 'special', target: 'self', value: 1 }],
    '👻🔥'
  ),
  createCard(
    'cremation', 'Cremation', 'Einäscherung',
    'fire', 'attack', 'rare', 2, 0,
    'Deal damage equal to enemy Burn x5Jean. Remove Burn.', 'Verursache Schaden gleich Gegner-Verbrennung x5. Entferne Verbrennung.',
    [{ type: 'damage', target: 'enemy', value: 0 }],
    '⚱️'
  ),

  // LEGENDARY
  createCard(
    'solar_flare', 'Solar Flare', 'Sonneneruption',
    'fire', 'attack', 'legendary', 4, 35,
    'Deal 35 damage to ALL. Apply 5 Burn to ALL.', 'Verursache 35 Schaden an ALLEN. Füge ALLEN 5 Verbrennung zu.',
    [
      { type: 'damage', target: 'all_enemies', value: 35 },
      { type: 'debuff', target: 'all_enemies', value: 5, duration: 5 }
    ],
    '☀️💥'
  ),
  createCard(
    'ifrit_summon', 'Summon Ifrit', 'Ifrit beschwören',
    'fire', 'power', 'legendary', 3, 8,
    'At end of turn, deal 8 damage to a random enemy.', 'Am Ende der Runde verursache 8 Schaden an zufälligem Gegner.',
    [{ type: 'damage', target: 'random', value: 8 }],
    '🧞‍♂️🔥'
  ),
];

// =============================================
// 💧 EXPANDED WATER CARDS
// =============================================
export const WATER_CARDS_EXPANDED: DeckbuilderCard[] = [
  // COMMON
  createCard(
    'ripple', 'Ripple', 'Wellenring',
    'water', 'attack', 'common', 0, 2,
    'Deal 2 damage. Gain 2 Block.', 'Verursache 2 Schaden. Erhalte 2 Block.',
    [
      { type: 'damage', target: 'enemy', value: 2 },
      { type: 'block', target: 'self', value: 2 }
    ],
    '💧'
  ),
  createCard(
    'mist_form', 'Mist Form', 'Nebelgestalt',
    'water', 'skill', 'common', 1, 4,
    'Gain 4 Block. Apply 1 Weak to attacker.', 'Erhalte 4 Block. Füge Angreifer 1 Schwach zu.',
    [
      { type: 'block', target: 'self', value: 4 },
      { type: 'debuff', target: 'enemy', value: 1, duration: 1 }
    ],
    '🌫️'
  ),
  createCard(
    'water_jet', 'Water Jet', 'Wasserstrahl',
    'water', 'attack', 'common', 1, 7,
    'Deal 7 damage. Apply 1 Weak.', 'Verursache 7 Schaden. Füge 1 Schwach zu.',
    [
      { type: 'damage', target: 'enemy', value: 7 },
      { type: 'debuff', target: 'enemy', value: 1, duration: 1 }
    ],
    '💦'
  ),
  createCard(
    'soothe', 'Soothe', 'Beruhigen',
    'water', 'skill', 'common', 1, 6,
    'Heal 6 HP.', 'Heile 6 LP.',
    [{ type: 'heal', target: 'self', value: 6 }],
    '💆'
  ),
  createCard(
    'aqua_shield', 'Aqua Shield', 'Wasserschild',
    'water', 'skill', 'common', 2, 12,
    'Gain 12 Block.', 'Erhalte 12 Block.',
    [{ type: 'block', target: 'self', value: 12 }],
    '🛡️💧'
  ),

  // UNCOMMON
  createCard(
    'riptide', 'Riptide', 'Unterströmung',
    'water', 'attack', 'uncommon', 2, 10,
    'Deal 10 damage. Draw 2 cards.', 'Verursache 10 Schaden. Ziehe 2 Karten.',
    [
      { type: 'damage', target: 'enemy', value: 10 },
      { type: 'draw', target: 'self', value: 2 }
    ],
    '🌊'
  ),
  createCard(
    'cold_snap', 'Cold Snap', 'Kälteschock',
    'water', 'attack', 'uncommon', 1, 8,
    'Deal 8 damage. Apply 2 Frail.', 'Verursache 8 Schaden. Füge 2 Gebrechlich zu.',
    [
      { type: 'damage', target: 'enemy', value: 8 },
      { type: 'debuff', target: 'enemy', value: 2, duration: 2 }
    ],
    '❄️'
  ),
  createCard(
    'fountain', 'Fountain', 'Brunnen',
    'water', 'power', 'uncommon', 2, 3,
    'At the end of each turn, heal 3 HP.', 'Am Ende jeder Runde heile 3 LP.',
    [{ type: 'heal', target: 'self', value: 3 }],
    '⛲'
  ),
  createCard(
    'water_clone', 'Water Clone', 'Wasserklon',
    'water', 'skill', 'uncommon', 1, 0,
    'Add a copy of a random Water card to your hand.', 'Füge eine Kopie einer zufälligen Wasserkarte deiner Hand hinzu.',
    [{ type: 'special', target: 'self', value: 0 }],
    '👥💧'
  ),
  createCard(
    'deep_freeze', 'Deep Freeze', 'Tiefkühlen',
    'water', 'skill', 'uncommon', 2, 15,
    'Gain 15 Block. Apply 2 Weak to ALL enemies.', 'Erhalte 15 Block. Füge ALLEN Gegnern 2 Schwach zu.',
    [
      { type: 'block', target: 'self', value: 15 },
      { type: 'debuff', target: 'all_enemies', value: 2, duration: 2 }
    ],
    '🥶'
  ),
  createCard(
    'monsoon', 'Monsoon', 'Monsun',
    'water', 'attack', 'uncommon', 2, 6,
    'Deal 6 damage to ALL enemies. Heal 3 HP.', 'Verursache 6 Schaden an ALLEN Gegnern. Heile 3 LP.',
    [
      { type: 'damage', target: 'all_enemies', value: 6 },
      { type: 'heal', target: 'self', value: 3 }
    ],
    '🌧️'
  ),

  // RARE
  createCard(
    'water_spirit', 'Water Spirit', 'Wassergeist',
    'water', 'power', 'rare', 2, 5,
    'Whenever you Block, heal 5 HP.', 'Immer wenn du blockst, heile 5 LP.',
    [{ type: 'heal', target: 'self', value: 5 }],
    '🧚💧'
  ),
  createCard(
    'flood', 'Flood', 'Flut',
    'water', 'attack', 'rare', 3, 18,
    'Deal 18 damage to ALL enemies. Apply 2 Weak to ALL.', 'Verursache 18 Schaden an ALLEN. Füge ALLEN 2 Schwach zu.',
    [
      { type: 'damage', target: 'all_enemies', value: 18 },
      { type: 'debuff', target: 'all_enemies', value: 2, duration: 2 }
    ],
    '🌊🌊'
  ),
  createCard(
    'aquatic_form', 'Aquatic Form', 'Aquatische Form',
    'water', 'power', 'rare', 3, 0,
    'At start of turn, gain Block equal to cards in hand.', 'Zu Beginn der Runde erhalte Block gleich Karten in Hand.',
    [{ type: 'block', target: 'self', value: 0, scaling: { stat: 'hand_size', multiplier: 1 } }],
    '🐠'
  ),
  createCard(
    'ice_prison', 'Ice Prison', 'Eisgefängnis',
    'water', 'skill', 'rare', 2, 0,
    'Enemy loses next turn.', 'Gegner verliert nächsten Zug.',
    [{ type: 'special', target: 'enemy', value: 0 }],
    '🧊'
  ),

  // LEGENDARY
  createCard(
    'poseidon_wrath', 'Poseidon\'s Wrath', 'Poseidons Zorn',
    'water', 'attack', 'legendary', 4, 45,
    'Deal 45 damage. Apply 3 Weak, 3 Frail.', 'Verursache 45 Schaden. Füge 3 Schwach, 3 Gebrechlich zu.',
    [
      { type: 'damage', target: 'enemy', value: 45 },
      { type: 'debuff', target: 'enemy', value: 3, duration: 3 },
      { type: 'debuff', target: 'enemy', value: 3, duration: 3 }
    ],
    '🔱'
  ),
  createCard(
    'eternal_tide', 'Eternal Tide', 'Ewige Gezeiten',
    'water', 'power', 'legendary', 3, 0,
    'At end of turn, shuffle your discard into your deck and draw 2.', 'Am Ende der Runde mische deinen Ablagestapel ins Deck und ziehe 2.',
    [{ type: 'draw', target: 'self', value: 2 }],
    '♾️💧'
  ),
];

// =============================================
// 🌍 EXPANDED EARTH CARDS
// =============================================
export const EARTH_CARDS_EXPANDED: DeckbuilderCard[] = [
  // COMMON
  createCard(
    'pebble', 'Pebble', 'Kieselstein',
    'earth', 'attack', 'common', 0, 4,
    'Deal 4 damage. Gain 2 Block.', 'Verursache 4 Schaden. Erhalte 2 Block.',
    [
      { type: 'damage', target: 'enemy', value: 4 },
      { type: 'block', target: 'self', value: 2 }
    ],
    '🪨'
  ),
  createCard(
    'root_grip', 'Root Grip', 'Wurzelgriff',
    'earth', 'skill', 'common', 1, 6,
    'Gain 6 Block. Apply 1 Vulnerable.', 'Erhalte 6 Block. Füge 1 Verwundbar zu.',
    [
      { type: 'block', target: 'self', value: 6 },
      { type: 'debuff', target: 'enemy', value: 1, duration: 1 }
    ],
    '🌿'
  ),
  createCard(
    'mud_slap', 'Mud Slap', 'Schlammklatscher',
    'earth', 'attack', 'common', 1, 6,
    'Deal 6 damage. Apply 1 Weak.', 'Verursache 6 Schaden. Füge 1 Schwach zu.',
    [
      { type: 'damage', target: 'enemy', value: 6 },
      { type: 'debuff', target: 'enemy', value: 1, duration: 1 }
    ],
    '💩'
  ),
  createCard(
    'harden', 'Harden', 'Verhärten',
    'earth', 'skill', 'common', 1, 2,
    'Gain 2 Dexterity this turn.', 'Erhalte 2 Geschicklichkeit diese Runde.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '💎'
  ),
  createCard(
    'earth_spike', 'Earth Spike', 'Erddorn',
    'earth', 'attack', 'common', 1, 9,
    'Deal 9 damage.', 'Verursache 9 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 9 }],
    '🗡️🌍'
  ),

  // UNCOMMON
  createCard(
    'sandstorm', 'Sandstorm', 'Sandsturm',
    'earth', 'attack', 'uncommon', 2, 8,
    'Deal 8 damage to ALL. Apply 1 Weak to ALL.', 'Verursache 8 Schaden an ALLEN. Füge ALLEN 1 Schwach zu.',
    [
      { type: 'damage', target: 'all_enemies', value: 8 },
      { type: 'debuff', target: 'all_enemies', value: 1, duration: 1 }
    ],
    '🏜️'
  ),
  createCard(
    'stalactite', 'Stalactite', 'Stalaktit',
    'earth', 'attack', 'uncommon', 2, 16,
    'Deal 16 damage. Gain 6 Block.', 'Verursache 16 Schaden. Erhalte 6 Block.',
    [
      { type: 'damage', target: 'enemy', value: 16 },
      { type: 'block', target: 'self', value: 6 }
    ],
    '🦷'
  ),
  createCard(
    'earth_armor', 'Earth Armor', 'Erdrüstung',
    'earth', 'power', 'uncommon', 2, 3,
    'Gain 3 Dexterity permanently.', 'Erhalte 3 Geschicklichkeit permanent.',
    [{ type: 'buff', target: 'self', value: 3 }],
    '🏔️'
  ),
  createCard(
    'rockslide', 'Rockslide', 'Steinlawine',
    'earth', 'attack', 'uncommon', 2, 12,
    'Deal 12 damage to ALL enemies.', 'Verursache 12 Schaden an ALLEN Gegnern.',
    [{ type: 'damage', target: 'all_enemies', value: 12 }],
    '🪨🪨'
  ),
  createCard(
    'deep_roots', 'Deep Roots', 'Tiefe Wurzeln',
    'earth', 'skill', 'uncommon', 1, 4,
    'Gain 4 Thorns.', 'Erhalte 4 Dornen.',
    [{ type: 'buff', target: 'self', value: 4 }],
    '🌳'
  ),
  createCard(
    'earthquake_prep', 'Seismic Charge', 'Seismische Ladung',
    'earth', 'skill', 'uncommon', 1, 0,
    'Next attack deals double damage.', 'Nächster Angriff verursacht doppelten Schaden.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '⚡🌍'
  ),

  // RARE
  createCard(
    'meteor_strike', 'Meteor Strike', 'Meteoriteneinschlag',
    'earth', 'attack', 'rare', 4, 40,
    'Deal 40 damage. Apply 3 Vulnerable.', 'Verursache 40 Schaden. Füge 3 Verwundbar zu.',
    [
      { type: 'damage', target: 'enemy', value: 40 },
      { type: 'debuff', target: 'enemy', value: 3, duration: 3 }
    ],
    '☄️'
  ),
  createCard(
    'petrify', 'Petrify', 'Versteinern',
    'earth', 'skill', 'rare', 2, 0,
    'Enemy cannot attack next turn.', 'Gegner kann nächste Runde nicht angreifen.',
    [{ type: 'special', target: 'enemy', value: 0 }],
    '🗿'
  ),
  createCard(
    'natures_blessing', 'Nature\'s Blessing', 'Segen der Natur',
    'earth', 'skill', 'rare', 2, 10,
    'Heal 10 HP. Gain 10 Block.', 'Heile 10 LP. Erhalte 10 Block.',
    [
      { type: 'heal', target: 'self', value: 10 },
      { type: 'block', target: 'self', value: 10 }
    ],
    '🍀'
  ),
  createCard(
    'crystal_cave', 'Crystal Cave', 'Kristallhöhle',
    'earth', 'power', 'rare', 3, 5,
    'At end of turn, gain 5 Block and 1 Thorns.', 'Am Ende der Runde erhalte 5 Block und 1 Dornen.',
    [
      { type: 'block', target: 'self', value: 5 },
      { type: 'buff', target: 'self', value: 1 }
    ],
    '💎🏔️'
  ),

  // LEGENDARY
  createCard(
    'gaia_avatar', 'Avatar of Gaia', 'Avatar von Gaia',
    'earth', 'power', 'legendary', 4, 0,
    'At start of turn, gain 15 Block. Heal 5 HP.', 'Zu Beginn der Runde erhalte 15 Block. Heile 5 LP.',
    [
      { type: 'block', target: 'self', value: 15 },
      { type: 'heal', target: 'self', value: 5 }
    ],
    '🌎👑'
  ),
  createCard(
    'primordial_stone', 'Primordial Stone', 'Urstein',
    'earth', 'attack', 'legendary', 5, 60,
    'Deal 60 damage. Gain 30 Block.', 'Verursache 60 Schaden. Erhalte 30 Block.',
    [
      { type: 'damage', target: 'enemy', value: 60 },
      { type: 'block', target: 'self', value: 30 }
    ],
    '🪨⭐'
  ),
];

// =============================================
// 💨 EXPANDED AIR CARDS
// =============================================
export const AIR_CARDS_EXPANDED: DeckbuilderCard[] = [
  // COMMON
  createCard(
    'breeze', 'Breeze', 'Brise',
    'air', 'skill', 'common', 0, 1,
    'Draw 1 card.', 'Ziehe 1 Karte.',
    [{ type: 'draw', target: 'self', value: 1 }],
    '🍃'
  ),
  createCard(
    'air_blade', 'Air Blade', 'Luftklinge',
    'air', 'attack', 'common', 1, 6,
    'Deal 6 damage. Draw 1 card.', 'Verursache 6 Schaden. Ziehe 1 Karte.',
    [
      { type: 'damage', target: 'enemy', value: 6 },
      { type: 'draw', target: 'self', value: 1 }
    ],
    '🗡️💨'
  ),
  createCard(
    'deflect', 'Deflect', 'Ablenken',
    'air', 'skill', 'common', 0, 4,
    'Gain 4 Block.', 'Erhalte 4 Block.',
    [{ type: 'block', target: 'self', value: 4 }],
    '↩️'
  ),
  createCard(
    'feather_fall', 'Feather Fall', 'Federsturz',
    'air', 'skill', 'common', 1, 0,
    'Gain 1 Energy. Draw 1 card.', 'Erhalte 1 Energie. Ziehe 1 Karte.',
    [
      { type: 'energy', target: 'self', value: 1 },
      { type: 'draw', target: 'self', value: 1 }
    ],
    '🪶'
  ),
  createCard(
    'swift_strike', 'Swift Strike', 'Schneller Schlag',
    'air', 'attack', 'common', 0, 5,
    'Deal 5 damage.', 'Verursache 5 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 5 }],
    '⚡'
  ),

  // UNCOMMON
  createCard(
    'cyclone', 'Cyclone', 'Zyklon',
    'air', 'attack', 'uncommon', 2, 5,
    'Deal 5 damage to ALL enemies 2 times.', 'Verursache 2x 5 Schaden an ALLEN Gegnern.',
    [
      { type: 'damage', target: 'all_enemies', value: 5 },
      { type: 'damage', target: 'all_enemies', value: 5 }
    ],
    '🌀'
  ),
  createCard(
    'wind_walk', 'Wind Walk', 'Windgang',
    'air', 'skill', 'uncommon', 1, 3,
    'Draw 3 cards. Discard 1 card.', 'Ziehe 3 Karten. Wirf 1 Karte ab.',
    [{ type: 'draw', target: 'self', value: 3 }],
    '🚶💨'
  ),
  createCard(
    'chain_lightning', 'Chain Lightning', 'Kettenblitz',
    'air', 'attack', 'uncommon', 2, 8,
    'Deal 8 damage. Hits a random enemy 3 times.', 'Verursache 8 Schaden. Trifft 3x zufällige Gegner.',
    [
      { type: 'damage', target: 'random', value: 8 },
      { type: 'damage', target: 'random', value: 8 },
      { type: 'damage', target: 'random', value: 8 }
    ],
    '⚡⚡'
  ),
  createCard(
    'updraft', 'Updraft', 'Aufwind',
    'air', 'skill', 'uncommon', 1, 2,
    'Gain 2 Energy.', 'Erhalte 2 Energie.',
    [{ type: 'energy', target: 'self', value: 2 }],
    '⬆️💨'
  ),
  createCard(
    'precision', 'Precision', 'Präzision',
    'air', 'power', 'uncommon', 1, 2,
    'Gain 2 Dexterity.', 'Erhalte 2 Geschicklichkeit.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '🎯'
  ),
  createCard(
    'thousand_cuts', 'Thousand Cuts', 'Tausend Schnitte',
    'air', 'power', 'uncommon', 2, 1,
    'Whenever you play a card, deal 1 damage to ALL enemies.', 'Immer wenn du eine Karte spielst, verursache 1 Schaden an ALLEN.',
    [{ type: 'damage', target: 'all_enemies', value: 1 }],
    '🗡️🗡️🗡️'
  ),

  // RARE
  createCard(
    'storm_caller', 'Storm Caller', 'Sturmrufer',
    'air', 'power', 'rare', 2, 8,
    'At end of turn, deal 8 damage to random enemy.', 'Am Ende der Runde verursache 8 Schaden an zufälligem Gegner.',
    [{ type: 'damage', target: 'random', value: 8 }],
    '🌩️'
  ),
  createCard(
    'hurricane', 'Hurricane', 'Hurrikan',
    'air', 'attack', 'rare', 3, 10,
    'Deal 10 damage to ALL enemies 3 times.', 'Verursache 3x 10 Schaden an ALLEN Gegnern.',
    [
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'damage', target: 'all_enemies', value: 10 }
    ],
    '🌀💨'
  ),
  createCard(
    'pressure_point', 'Pressure Point', 'Druckpunkt',
    'air', 'attack', 'rare', 1, 0,
    'Apply 10 Mark. Deal damage equal to Mark.', 'Füge 10 Markierung zu. Verursache Schaden gleich Markierung.',
    [{ type: 'damage', target: 'enemy', value: 10 }],
    '👆'
  ),
  createCard(
    'after_image', 'After Image', 'Nachbild',
    'air', 'power', 'rare', 1, 1,
    'Whenever you play a card, gain 1 Block.', 'Immer wenn du eine Karte spielst, erhalte 1 Block.',
    [{ type: 'block', target: 'self', value: 1 }],
    '👻'
  ),

  // LEGENDARY
  createCard(
    'zephyr_god', 'Zephyr God', 'Zephyrgott',
    'air', 'power', 'legendary', 3, 2,
    'Draw 2 additional cards each turn. Gain 1 Energy.', 'Ziehe 2 zusätzliche Karten pro Runde. Erhalte 1 Energie.',
    [
      { type: 'draw', target: 'self', value: 2 },
      { type: 'energy', target: 'self', value: 1 }
    ],
    '🌬️👑'
  ),
  createCard(
    'divine_wind', 'Divine Wind', 'Göttlicher Wind',
    'air', 'attack', 'legendary', 2, 0,
    'Deal damage equal to cards played this turn x8.', 'Verursache Schaden gleich gespielte Karten x8.',
    [{ type: 'damage', target: 'enemy', value: 0 }],
    '🌪️✨'
  ),
];

// =============================================
// 🌑 EXPANDED VOID CARDS
// =============================================
export const VOID_CARDS_EXPANDED: DeckbuilderCard[] = [
  // UNCOMMON
  createCard(
    'void_slash', 'Void Slash', 'Leerenhieb',
    'void', 'attack', 'uncommon', 1, 10,
    'Deal 10 damage. Exhaust a random card from hand.', 'Verursache 10 Schaden. Erschöpfe zufällige Handkarte.',
    [{ type: 'damage', target: 'enemy', value: 10 }],
    '🗡️🌑'
  ),
  createCard(
    'dark_ritual', 'Dark Ritual', 'Dunkles Ritual',
    'void', 'skill', 'uncommon', 0, 0,
    'Lose 3 HP. Gain 3 Energy.', 'Verliere 3 LP. Erhalte 3 Energie.',
    [
      { type: 'damage', target: 'self', value: 3 },
      { type: 'energy', target: 'self', value: 3 }
    ],
    '🕯️🌑'
  ),
  createCard(
    'shadow_step', 'Shadow Step', 'Schattenschritt',
    'void', 'skill', 'uncommon', 1, 0,
    'Draw 2 cards. Add a Wound to discard.', 'Ziehe 2 Karten. Füge Wunde dem Ablagestapel hinzu.',
    [{ type: 'draw', target: 'self', value: 2 }],
    '👣🌑'
  ),
  createCard(
    'entropy', 'Entropy', 'Entropie',
    'void', 'attack', 'uncommon', 2, 0,
    'Deal damage equal to cards in your discard pile.', 'Verursache Schaden gleich Karten im Ablagestapel.',
    [{ type: 'damage', target: 'enemy', value: 0, scaling: { stat: 'discard_count', multiplier: 1 } }],
    '♾️🌑'
  ),
  createCard(
    'blood_price', 'Blood Price', 'Blutpreis',
    'void', 'skill', 'uncommon', 0, 4,
    'Lose 4 HP. Draw 2 cards.', 'Verliere 4 LP. Ziehe 2 Karten.',
    [
      { type: 'damage', target: 'self', value: 4 },
      { type: 'draw', target: 'self', value: 2 }
    ],
    '🩸'
  ),
  createCard(
    'nightmare', 'Nightmare', 'Albtraum',
    'void', 'skill', 'uncommon', 2, 0,
    'Add 3 copies of a card to your hand. Exhaust.', 'Füge 3 Kopien einer Karte deiner Hand hinzu. Erschöpfung.',
    [{ type: 'special', target: 'self', value: 3 }],
    '😱',
    ['exhaust']
  ),

  // RARE
  createCard(
    'void_leech', 'Void Leech', 'Leerenegel',
    'void', 'attack', 'rare', 2, 15,
    'Deal 15 damage. Heal HP equal to damage dealt.', 'Verursache 15 Schaden. Heile LP gleich Schaden.',
    [
      { type: 'damage', target: 'enemy', value: 15 },
      { type: 'heal', target: 'self', value: 15 }
    ],
    '🧛🌑'
  ),
  createCard(
    'dark_embrace', 'Dark Embrace', 'Dunkle Umarmung',
    'void', 'power', 'rare', 2, 1,
    'Whenever a card is Exhausted, draw 1 card.', 'Immer wenn eine Karte erschöpft wird, ziehe 1 Karte.',
    [{ type: 'draw', target: 'self', value: 1 }],
    '🖤'
  ),
  createCard(
    'feed', 'Feed', 'Fressen',
    'void', 'attack', 'rare', 1, 15,
    'Deal 15 damage. If fatal, gain 3 Max HP.', 'Verursache 15 Schaden. Bei Tötung +3 Max LP.',
    [{ type: 'damage', target: 'enemy', value: 15 }],
    '😈'
  ),
  createCard(
    'pain_transfer', 'Pain Transfer', 'Schmerztransfer',
    'void', 'skill', 'rare', 1, 0,
    'Transfer all your Debuffs to an enemy.', 'Übertrage alle deine Schwächungen auf einen Gegner.',
    [{ type: 'special', target: 'enemy', value: 0 }],
    '↔️💀'
  ),

  // LEGENDARY
  createCard(
    'void_incarnate', 'Void Incarnate', 'Leereninkarnation',
    'void', 'power', 'legendary', 4, 0,
    'Exhaust becomes Strength. Gain 1 Strength per card Exhausted.', 'Erschöpfung wird Stärke. +1 Stärke pro erschöpfter Karte.',
    [{ type: 'buff', target: 'self', value: 1 }],
    '🌑👹'
  ),
  createCard(
    'end_of_all', 'End of All', 'Ende von Allem',
    'void', 'attack', 'legendary', 5, 100,
    'Deal 100 damage. Exhaust your entire hand.', 'Verursache 100 Schaden. Erschöpfe deine gesamte Hand.',
    [{ type: 'damage', target: 'enemy', value: 100 }],
    '💀🌑',
    ['exhaust']
  ),
  createCard(
    'demon_form', 'Demon Form', 'Dämonengestalt',
    'void', 'power', 'legendary', 3, 3,
    'At start of turn, gain 3 Strength.', 'Zu Beginn der Runde erhalte 3 Stärke.',
    [{ type: 'buff', target: 'self', value: 3 }],
    '👿'
  ),
];

// =============================================
// 🌈 HYBRID CARDS (Multi-Element)
// =============================================
export const HYBRID_CARDS: DeckbuilderCard[] = [
  // Fire + Water = Steam
  createCard(
    'steam_blast', 'Steam Blast', 'Dampfstoß',
    'fire', 'attack', 'uncommon', 2, 12,
    'Deal 12 damage. Apply 2 Weak.', 'Verursache 12 Schaden. Füge 2 Schwach zu.',
    [
      { type: 'damage', target: 'enemy', value: 12 },
      { type: 'debuff', target: 'enemy', value: 2, duration: 2 }
    ],
    '♨️'
  ),

  // Fire + Earth = Lava
  createCard(
    'lava_flow', 'Lava Flow', 'Lavastrom',
    'fire', 'attack', 'rare', 3, 20,
    'Deal 20 damage. Apply 4 Burn. Gain 8 Block.', 'Verursache 20 Schaden. 4 Verbrennung. 8 Block.',
    [
      { type: 'damage', target: 'enemy', value: 20 },
      { type: 'debuff', target: 'enemy', value: 4, duration: 4 },
      { type: 'block', target: 'self', value: 8 }
    ],
    '🌋🔥'
  ),

  // Fire + Air = Lightning
  createCard(
    'thunder_strike', 'Thunder Strike', 'Donnerschlag',
    'air', 'attack', 'rare', 2, 18,
    'Deal 18 damage. Draw 2 cards.', 'Verursache 18 Schaden. Ziehe 2 Karten.',
    [
      { type: 'damage', target: 'enemy', value: 18 },
      { type: 'draw', target: 'self', value: 2 }
    ],
    '⚡🔥'
  ),

  // Water + Earth = Nature
  createCard(
    'natures_wrath', 'Nature\'s Wrath', 'Zorn der Natur',
    'earth', 'attack', 'rare', 3, 15,
    'Deal 15 damage to ALL. Heal 8 HP.', 'Verursache 15 Schaden an ALLEN. Heile 8 LP.',
    [
      { type: 'damage', target: 'all_enemies', value: 15 },
      { type: 'heal', target: 'self', value: 8 }
    ],
    '🌿💧'
  ),

  // Water + Air = Storm
  createCard(
    'storm_surge', 'Storm Surge', 'Sturmflut',
    'water', 'attack', 'rare', 3, 14,
    'Deal 14 damage to ALL. Apply 2 Weak to ALL. Draw 2.', 'Verursache 14 an ALLEN. 2 Schwach. Ziehe 2.',
    [
      { type: 'damage', target: 'all_enemies', value: 14 },
      { type: 'debuff', target: 'all_enemies', value: 2, duration: 2 },
      { type: 'draw', target: 'self', value: 2 }
    ],
    '🌊⚡'
  ),

  // Earth + Air = Dust
  createCard(
    'dust_devil', 'Dust Devil', 'Staubteufel',
    'earth', 'attack', 'uncommon', 2, 7,
    'Deal 7 damage 3 times.', 'Verursache 3x 7 Schaden.',
    [
      { type: 'damage', target: 'enemy', value: 7 },
      { type: 'damage', target: 'enemy', value: 7 },
      { type: 'damage', target: 'enemy', value: 7 }
    ],
    '🌪️🏜️'
  ),

  // Void + Fire = Hellfire
  createCard(
    'hellfire', 'Hellfire', 'Höllenfeuer',
    'void', 'attack', 'legendary', 3, 30,
    'Deal 30 damage. Apply 5 Burn. Lose 5 HP.', 'Verursache 30 Schaden. 5 Verbrennung. Verliere 5 LP.',
    [
      { type: 'damage', target: 'enemy', value: 30 },
      { type: 'debuff', target: 'enemy', value: 5, duration: 5 },
      { type: 'damage', target: 'self', value: 5 }
    ],
    '🔥👹'
  ),

  // Void + Water = Abyss
  createCard(
    'abyssal_terror', 'Abyssal Terror', 'Abgrundschrecken',
    'void', 'attack', 'legendary', 4, 25,
    'Deal 25 damage. Apply 3 Weak. Apply 3 Frail.', 'Verursache 25 Schaden. 3 Schwach. 3 Gebrechlich.',
    [
      { type: 'damage', target: 'enemy', value: 25 },
      { type: 'debuff', target: 'enemy', value: 3, duration: 3 },
      { type: 'debuff', target: 'enemy', value: 3, duration: 3 }
    ],
    '🌊🌑'
  ),

  // All Elements = Prism
  createCard(
    'prismatic_blast', 'Prismatic Blast', 'Prismatische Explosion',
    'void', 'attack', 'legendary', 5, 10,
    'Deal 10 damage to ALL 5 times.', 'Verursache 5x 10 Schaden an ALLEN.',
    [
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'damage', target: 'all_enemies', value: 10 }
    ],
    '🌈💥'
  ),
];

// =============================================
// ⚔️ COLORLESS CARDS (Any Deck)
// =============================================
export const COLORLESS_CARDS: DeckbuilderCard[] = [
  createCard(
    'finesse', 'Finesse', 'Finesse',
    'air', 'skill', 'common', 0, 2,
    'Gain 2 Block.', 'Erhalte 2 Block.',
    [{ type: 'block', target: 'self', value: 2 }],
    '✨'
  ),
  createCard(
    'flash', 'Flash', 'Blitz',
    'air', 'attack', 'common', 0, 3,
    'Deal 3 damage.', 'Verursache 3 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 3 }],
    '⚡'
  ),
  createCard(
    'trip', 'Trip', 'Stolpern',
    'earth', 'skill', 'common', 0, 2,
    'Apply 2 Vulnerable.', 'Füge 2 Verwundbar zu.',
    [{ type: 'debuff', target: 'enemy', value: 2, duration: 2 }],
    '🦵'
  ),
  createCard(
    'panacea', 'Panacea', 'Allheilmittel',
    'water', 'skill', 'uncommon', 0, 0,
    'Remove all debuffs. Exhaust.', 'Entferne alle Schwächungen. Erschöpfung.',
    [{ type: 'special', target: 'self', value: 0 }],
    '💊',
    ['exhaust']
  ),
  createCard(
    'dramatic_entrance', 'Dramatic Entrance', 'Dramatischer Auftritt',
    'air', 'attack', 'uncommon', 0, 8,
    'Deal 8 damage to ALL. Innate.', 'Verursache 8 Schaden an ALLEN. Angeboren.',
    [{ type: 'damage', target: 'all_enemies', value: 8 }],
    '🎭',
    ['innate']
  ),
  createCard(
    'master_of_strategy', 'Master of Strategy', 'Meister der Strategie',
    'air', 'skill', 'rare', 0, 3,
    'Draw 3 cards. Exhaust.', 'Ziehe 3 Karten. Erschöpfung.',
    [{ type: 'draw', target: 'self', value: 3 }],
    '🧠',
    ['exhaust']
  ),
  createCard(
    'secret_technique', 'Secret Technique', 'Geheimtechnik',
    'air', 'skill', 'rare', 0, 0,
    'Put a Skill from discard into your hand. Exhaust.', 'Nimm eine Fähigkeit vom Ablagestapel. Erschöpfung.',
    [{ type: 'special', target: 'self', value: 0 }],
    '🥷',
    ['exhaust']
  ),
  createCard(
    'hand_of_greed', 'Hand of Greed', 'Hand der Gier',
    'void', 'attack', 'rare', 2, 20,
    'Deal 20 damage. If fatal, gain 25 Gold.', 'Verursache 20 Schaden. Bei Tötung +25 Gold.',
    [{ type: 'damage', target: 'enemy', value: 20 }],
    '🤑'
  ),
  createCard(
    'transmutation', 'Transmutation', 'Transmutation',
    'void', 'skill', 'rare', 0, 0,
    'Add X random Colorless cards to hand. X = Energy. Exhaust.', 'Füge X zufällige farblose Karten hinzu. X = Energie.',
    [{ type: 'special', target: 'self', value: 0 }],
    '⚗️',
    ['exhaust']
  ),
  createCard(
    'violence', 'Violence', 'Gewalt',
    'fire', 'skill', 'rare', 0, 4,
    'Put 4 random Attacks from draw pile into hand. Exhaust.', 'Nimm 4 zufällige Angriffe vom Ziehstapel. Erschöpfung.',
    [{ type: 'special', target: 'self', value: 4 }],
    '💢',
    ['exhaust']
  ),
];

// =============================================
// ALL EXPANDED CARDS COMBINED
// =============================================
export const ALL_EXPANDED_CARDS: DeckbuilderCard[] = [
  ...FIRE_CARDS_EXPANDED,
  ...WATER_CARDS_EXPANDED,
  ...EARTH_CARDS_EXPANDED,
  ...AIR_CARDS_EXPANDED,
  ...VOID_CARDS_EXPANDED,
  ...HYBRID_CARDS,
  ...COLORLESS_CARDS,
];

// Export count for logging
export const EXPANDED_CARD_COUNT = ALL_EXPANDED_CARDS.length;

console.log(`[Deckbuilder] Loaded ${EXPANDED_CARD_COUNT} expanded cards:
  - Fire: ${FIRE_CARDS_EXPANDED.length}
  - Water: ${WATER_CARDS_EXPANDED.length}
  - Earth: ${EARTH_CARDS_EXPANDED.length}
  - Air: ${AIR_CARDS_EXPANDED.length}
  - Void: ${VOID_CARDS_EXPANDED.length}
  - Hybrid: ${HYBRID_CARDS.length}
  - Colorless: ${COLORLESS_CARDS.length}
`);
