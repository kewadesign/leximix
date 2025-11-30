// ============================================
// KARTENSCHMIEDE - Card Definitions
// ============================================
// Cards are defined modularly for easy swapping/balancing
// Each card has a unique ID and all properties defined

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
// 🔥 FIRE CARDS - Aggressive / Damage Focus
// =============================================
export const FIRE_CARDS: DeckbuilderCard[] = [
  // STARTER
  createCard(
    'fire_strike', 'Fire Strike', 'Feuerschlag',
    'fire', 'attack', 'starter', 1, 6,
    'Deal 6 damage.', 'Verursache 6 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 6 }],
    '🔥',
    undefined,
    { value: 9, description: 'Deal 9 damage.', descriptionDE: 'Verursache 9 Schaden.' }
  ),
  createCard(
    'fire_guard', 'Flame Guard', 'Flammenwache',
    'fire', 'skill', 'starter', 1, 5,
    'Gain 5 Block.', 'Erhalte 5 Block.',
    [{ type: 'block', target: 'self', value: 5 }],
    '🛡️',
    undefined,
    { value: 8, description: 'Gain 8 Block.', descriptionDE: 'Erhalte 8 Block.' }
  ),

  // COMMON
  createCard(
    'ember', 'Ember', 'Glut',
    'fire', 'attack', 'common', 0, 4,
    'Deal 4 damage.', 'Verursache 4 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 4 }],
    '✨'
  ),
  createCard(
    'flame_lance', 'Flame Lance', 'Flammenlanze',
    'fire', 'attack', 'common', 2, 12,
    'Deal 12 damage. +4 if last card was Fire.', 'Verursache 12 Schaden. +4 wenn letzte Karte Feuer war.',
    [{ type: 'damage', target: 'enemy', value: 12 }],
    '🗡️'
  ),
  createCard(
    'ignite', 'Ignite', 'Entzünden',
    'fire', 'skill', 'common', 1, 3,
    'Apply 3 Burn to an enemy.', 'Füge einem Gegner 3 Verbrennung zu.',
    [{ type: 'debuff', target: 'enemy', value: 3, duration: 3 }],
    '🔥'
  ),
  createCard(
    'heat_wave', 'Heat Wave', 'Hitzewelle',
    'fire', 'attack', 'common', 1, 4,
    'Deal 4 damage to ALL enemies.', 'Verursache 4 Schaden an ALLEN Gegnern.',
    [{ type: 'damage', target: 'all_enemies', value: 4 }],
    '🌡️'
  ),
  createCard(
    'fuel', 'Fuel', 'Brennstoff',
    'fire', 'skill', 'common', 0, 2,
    'Gain 2 Strength this combat.', 'Erhalte 2 Stärke für diesen Kampf.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '⛽'
  ),

  // UNCOMMON
  createCard(
    'wildfire', 'Wildfire', 'Lauffeuer',
    'fire', 'attack', 'uncommon', 2, 8,
    'Deal 8 damage. Apply 4 Burn.', 'Verursache 8 Schaden. Füge 4 Verbrennung zu.',
    [
      { type: 'damage', target: 'enemy', value: 8 },
      { type: 'debuff', target: 'enemy', value: 4, duration: 4 }
    ],
    '🌲🔥'
  ),
  createCard(
    'blazing_fists', 'Blazing Fists', 'Brennende Fäuste',
    'fire', 'attack', 'uncommon', 1, 4,
    'Deal 4 damage 3 times.', 'Verursache 3x 4 Schaden.',
    [
      { type: 'damage', target: 'enemy', value: 4 },
      { type: 'damage', target: 'enemy', value: 4 },
      { type: 'damage', target: 'enemy', value: 4 }
    ],
    '👊'
  ),
  createCard(
    'inner_fire', 'Inner Fire', 'Inneres Feuer',
    'fire', 'power', 'uncommon', 1, 1,
    'At the start of each turn, gain 1 Strength.', 'Zu Beginn jeder Runde erhältst du 1 Stärke.',
    [{ type: 'buff', target: 'self', value: 1 }],
    '💪'
  ),
  createCard(
    'meteor_shower', 'Meteor Shower', 'Meteorregen',
    'fire', 'attack', 'uncommon', 3, 7,
    'Deal 7 damage to ALL enemies 2 times.', 'Verursache 2x 7 Schaden an ALLEN Gegnern.',
    [
      { type: 'damage', target: 'all_enemies', value: 7 },
      { type: 'damage', target: 'all_enemies', value: 7 }
    ],
    '☄️'
  ),
  createCard(
    'rage', 'Rage', 'Raserei',
    'fire', 'skill', 'uncommon', 0, 3,
    'Gain 3 Block whenever you play an Attack this turn.', 'Erhalte 3 Block für jeden gespielten Angriff diese Runde.',
    [{ type: 'block', target: 'self', value: 3 }],
    '😤'
  ),

  // RARE
  createCard(
    'inferno', 'Inferno', 'Inferno',
    'fire', 'attack', 'rare', 3, 20,
    'Deal 20 damage to ALL enemies.', 'Verursache 20 Schaden an ALLEN Gegnern.',
    [{ type: 'damage', target: 'all_enemies', value: 20 }],
    '🔥💀',
    undefined,
    { value: 28 }
  ),
  createCard(
    'immolate', 'Immolate', 'Selbstverbrennung',
    'fire', 'attack', 'rare', 2, 25,
    'Deal 25 damage. Add a Burn status to your discard pile.', 'Verursache 25 Schaden. Füge eine Verbrennung deinem Ablagestapel hinzu.',
    [{ type: 'damage', target: 'enemy', value: 25 }],
    '🕯️'
  ),
  createCard(
    'firebreath', 'Fire Breath', 'Feueratem',
    'fire', 'attack', 'rare', 2, 6,
    'Deal 6 damage to a random enemy for each card in your hand.', 'Verursache 6 Schaden an einem zufälligen Gegner für jede Karte in deiner Hand.',
    [{ type: 'damage', target: 'random', value: 6, scaling: { stat: 'hand_size', multiplier: 1 } }],
    '🐉'
  ),
  createCard(
    'eruption', 'Eruption', 'Eruption',
    'fire', 'attack', 'rare', 2, 15,
    'Deal 15 damage. Draw 2 cards.', 'Verursache 15 Schaden. Ziehe 2 Karten.',
    [
      { type: 'damage', target: 'enemy', value: 15 },
      { type: 'draw', target: 'self', value: 2 }
    ],
    '🌋'
  ),

  // LEGENDARY
  createCard(
    'phoenix_rebirth', 'Phoenix Rebirth', 'Phönix-Wiedergeburt',
    'fire', 'power', 'legendary', 3, 25,
    'When you would die, revive with 25% HP instead. Exhaust.', 'Wenn du sterben würdest, wirst du stattdessen mit 25% LP wiederbelebt. Erschöpfung.',
    [{ type: 'special', target: 'self', value: 25 }],
    '🦅🔥',
    ['exhaust']
  ),
  createCard(
    'avatar_of_fire', 'Avatar of Fire', 'Avatar des Feuers',
    'fire', 'power', 'legendary', 4, 0,
    'Double ALL damage you deal this combat.', 'Verdopple ALLEN Schaden den du in diesem Kampf verursachst.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '👹'
  ),
  createCard(
    'supernova', 'Supernova', 'Supernova',
    'fire', 'attack', 'legendary', 5, 50,
    'Deal 50 damage to ALL enemies. Costs 1 less for each Fire card played this combat.', 'Verursache 50 Schaden an ALLEN Gegnern. Kostet 1 weniger für jede gespielte Feuerkarte.',
    [{ type: 'damage', target: 'all_enemies', value: 50 }],
    '💥'
  ),
];

// =============================================
// 💧 WATER CARDS - Control / Defense Focus
// =============================================
export const WATER_CARDS: DeckbuilderCard[] = [
  // STARTER
  createCard(
    'water_strike', 'Water Strike', 'Wasserschlag',
    'water', 'attack', 'starter', 1, 6,
    'Deal 6 damage.', 'Verursache 6 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 6 }],
    '💧'
  ),
  createCard(
    'water_shield', 'Water Shield', 'Wasserschild',
    'water', 'skill', 'starter', 1, 6,
    'Gain 6 Block.', 'Erhalte 6 Block.',
    [{ type: 'block', target: 'self', value: 6 }],
    '🛡️'
  ),

  // COMMON
  createCard(
    'splash', 'Splash', 'Spritzer',
    'water', 'attack', 'common', 1, 5,
    'Deal 5 damage. Apply 1 Weak.', 'Verursache 5 Schaden. Füge 1 Schwach zu.',
    [
      { type: 'damage', target: 'enemy', value: 5 },
      { type: 'debuff', target: 'enemy', value: 1, duration: 1 }
    ],
    '💦'
  ),
  createCard(
    'ice_shard', 'Ice Shard', 'Eissplitter',
    'water', 'attack', 'common', 0, 3,
    'Deal 3 damage. Draw 1 card.', 'Verursache 3 Schaden. Ziehe 1 Karte.',
    [
      { type: 'damage', target: 'enemy', value: 3 },
      { type: 'draw', target: 'self', value: 1 }
    ],
    '🧊'
  ),
  createCard(
    'frost_armor', 'Frost Armor', 'Frostrüstung',
    'water', 'skill', 'common', 2, 10,
    'Gain 10 Block. Apply 1 Weak to ALL enemies.', 'Erhalte 10 Block. Füge ALLEN Gegnern 1 Schwach zu.',
    [
      { type: 'block', target: 'self', value: 10 },
      { type: 'debuff', target: 'all_enemies', value: 1, duration: 1 }
    ],
    '❄️'
  ),
  createCard(
    'tide_pool', 'Tide Pool', 'Gezeitentümpel',
    'water', 'skill', 'common', 1, 1,
    'Draw 1 card. Gain 1 Energy.', 'Ziehe 1 Karte. Erhalte 1 Energie.',
    [
      { type: 'draw', target: 'self', value: 1 },
      { type: 'energy', target: 'self', value: 1 }
    ],
    '🌊'
  ),
  createCard(
    'cleanse', 'Cleanse', 'Reinigung',
    'water', 'skill', 'common', 1, 0,
    'Remove all debuffs from yourself.', 'Entferne alle Schwächungen von dir.',
    [{ type: 'special', target: 'self', value: 0 }],
    '✨'
  ),

  // UNCOMMON
  createCard(
    'tidal_wave', 'Tidal Wave', 'Flutwelle',
    'water', 'attack', 'uncommon', 2, 15,
    'Deal 15 damage. Apply 2 Weak.', 'Verursache 15 Schaden. Füge 2 Schwach zu.',
    [
      { type: 'damage', target: 'enemy', value: 15 },
      { type: 'debuff', target: 'enemy', value: 2, duration: 2 }
    ],
    '🌊'
  ),
  createCard(
    'frozen_shell', 'Frozen Shell', 'Gefrorene Hülle',
    'water', 'skill', 'uncommon', 2, 14,
    'Gain 14 Block. Gain 2 Thorns.', 'Erhalte 14 Block. Erhalte 2 Dornen.',
    [
      { type: 'block', target: 'self', value: 14 },
      { type: 'buff', target: 'self', value: 2 }
    ],
    '🐚'
  ),
  createCard(
    'reflection', 'Reflection', 'Spiegelung',
    'water', 'skill', 'uncommon', 1, 0,
    'Gain Block equal to your current Block.', 'Erhalte Block gleich deinem aktuellen Block.',
    [{ type: 'block', target: 'self', value: 0, scaling: { stat: 'dexterity', multiplier: 1 } }],
    '🪞'
  ),
  createCard(
    'healing_rain', 'Healing Rain', 'Heilender Regen',
    'water', 'skill', 'uncommon', 2, 8,
    'Heal 8 HP. Gain 5 Block.', 'Heile 8 LP. Erhalte 5 Block.',
    [
      { type: 'heal', target: 'self', value: 8 },
      { type: 'block', target: 'self', value: 5 }
    ],
    '🌧️'
  ),
  createCard(
    'whirlpool', 'Whirlpool', 'Strudel',
    'water', 'power', 'uncommon', 2, 3,
    'At end of turn, deal 3 damage to ALL enemies.', 'Am Ende der Runde, verursache 3 Schaden an ALLEN Gegnern.',
    [{ type: 'damage', target: 'all_enemies', value: 3 }],
    '🌀'
  ),

  // RARE
  createCard(
    'maelstrom', 'Maelstrom', 'Mahlstrom',
    'water', 'attack', 'rare', 3, 0,
    'Deal damage equal to cards in hand x4.', 'Verursache Schaden gleich Karten in Hand x4.',
    [{ type: 'damage', target: 'enemy', value: 0, scaling: { stat: 'hand_size', multiplier: 4 } }],
    '🌪️'
  ),
  createCard(
    'absolute_zero', 'Absolute Zero', 'Absoluter Nullpunkt',
    'water', 'skill', 'rare', 3, 0,
    'Enemy loses ALL Block. Gain that much Block.', 'Gegner verliert ALLEN Block. Erhalte so viel Block.',
    [{ type: 'special', target: 'enemy', value: 0 }],
    '❄️'
  ),
  createCard(
    'life_drain', 'Life Drain', 'Lebensraub',
    'water', 'attack', 'rare', 2, 12,
    'Deal 12 damage. Heal for 50% of damage dealt.', 'Verursache 12 Schaden. Heile 50% des verursachten Schadens.',
    [
      { type: 'damage', target: 'enemy', value: 12 },
      { type: 'heal', target: 'self', value: 6 }
    ],
    '💀'
  ),
  createCard(
    'ice_barrier', 'Ice Barrier', 'Eisbarriere',
    'water', 'power', 'rare', 2, 10,
    'At the start of each turn, gain 10 Block.', 'Zu Beginn jeder Runde erhältst du 10 Block.',
    [{ type: 'block', target: 'self', value: 10 }],
    '🧊'
  ),

  // LEGENDARY
  createCard(
    'tsunami', 'Tsunami', 'Tsunami',
    'water', 'attack', 'legendary', 4, 40,
    'Deal 40 damage to ALL enemies. Apply 3 Weak to ALL.', 'Verursache 40 Schaden an ALLEN Gegnern. Füge ALLEN 3 Schwach zu.',
    [
      { type: 'damage', target: 'all_enemies', value: 40 },
      { type: 'debuff', target: 'all_enemies', value: 3, duration: 3 }
    ],
    '🌊💀'
  ),
  createCard(
    'ocean_heart', 'Ocean Heart', 'Herz des Ozeans',
    'water', 'power', 'legendary', 3, 0,
    'Water cards cost 0 this combat.', 'Wasserkarten kosten 0 in diesem Kampf.',
    [{ type: 'special', target: 'self', value: 0 }],
    '💙'
  ),
  createCard(
    'time_freeze', 'Time Freeze', 'Zeitstillstand',
    'water', 'skill', 'legendary', 4, 0,
    'Enemy skips their next turn.', 'Gegner überspringt seinen nächsten Zug.',
    [{ type: 'special', target: 'enemy', value: 0 }],
    '⏱️'
  ),
];

// =============================================
// 🌍 EARTH CARDS - Defense / Scaling Focus
// =============================================
export const EARTH_CARDS: DeckbuilderCard[] = [
  // STARTER
  createCard(
    'earth_strike', 'Earth Strike', 'Erdschlag',
    'earth', 'attack', 'starter', 1, 6,
    'Deal 6 damage.', 'Verursache 6 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 6 }],
    '🪨'
  ),
  createCard(
    'stone_skin', 'Stone Skin', 'Steinhaut',
    'earth', 'skill', 'starter', 1, 7,
    'Gain 7 Block.', 'Erhalte 7 Block.',
    [{ type: 'block', target: 'self', value: 7 }],
    '🛡️'
  ),

  // COMMON
  createCard(
    'rock_throw', 'Rock Throw', 'Steinwurf',
    'earth', 'attack', 'common', 1, 8,
    'Deal 8 damage.', 'Verursache 8 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 8 }],
    '🪨'
  ),
  createCard(
    'fortify', 'Fortify', 'Befestigen',
    'earth', 'skill', 'common', 1, 0,
    'Double your current Block.', 'Verdopple deinen aktuellen Block.',
    [{ type: 'block', target: 'self', value: 0, scaling: { stat: 'dexterity', multiplier: 2 } }],
    '🏰'
  ),
  createCard(
    'tremor', 'Tremor', 'Beben',
    'earth', 'attack', 'common', 1, 5,
    'Deal 5 damage to ALL enemies.', 'Verursache 5 Schaden an ALLEN Gegnern.',
    [{ type: 'damage', target: 'all_enemies', value: 5 }],
    '💥'
  ),
  createCard(
    'roots', 'Roots', 'Wurzeln',
    'earth', 'skill', 'common', 1, 3,
    'Gain 3 Thorns.', 'Erhalte 3 Dornen.',
    [{ type: 'buff', target: 'self', value: 3 }],
    '🌿'
  ),
  createCard(
    'nourish', 'Nourish', 'Nähren',
    'earth', 'skill', 'common', 1, 4,
    'Heal 4 HP.', 'Heile 4 LP.',
    [{ type: 'heal', target: 'self', value: 4 }],
    '🍃'
  ),

  // UNCOMMON
  createCard(
    'earthquake', 'Earthquake', 'Erdbeben',
    'earth', 'attack', 'uncommon', 2, 10,
    'Deal 10 damage to ALL enemies. Apply 1 Vulnerable.', 'Verursache 10 Schaden an ALLEN. Füge 1 Verwundbar zu.',
    [
      { type: 'damage', target: 'all_enemies', value: 10 },
      { type: 'debuff', target: 'all_enemies', value: 1, duration: 1 }
    ],
    '🌋'
  ),
  createCard(
    'iron_will', 'Iron Will', 'Eiserner Wille',
    'earth', 'power', 'uncommon', 2, 3,
    'Gain 3 Dexterity.', 'Erhalte 3 Geschicklichkeit.',
    [{ type: 'buff', target: 'self', value: 3 }],
    '💪'
  ),
  createCard(
    'boulder_smash', 'Boulder Smash', 'Felsenschlag',
    'earth', 'attack', 'uncommon', 2, 20,
    'Deal 20 damage.', 'Verursache 20 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 20 }],
    '💎'
  ),
  createCard(
    'entomb', 'Entomb', 'Eingraben',
    'earth', 'skill', 'uncommon', 2, 18,
    'Gain 18 Block.', 'Erhalte 18 Block.',
    [{ type: 'block', target: 'self', value: 18 }],
    '⚱️'
  ),
  createCard(
    'growth', 'Growth', 'Wachstum',
    'earth', 'power', 'uncommon', 1, 2,
    'At the start of each turn, gain 2 Dexterity.', 'Zu Beginn jeder Runde erhältst du 2 Geschicklichkeit.',
    [{ type: 'buff', target: 'self', value: 2 }],
    '🌱'
  ),

  // RARE
  createCard(
    'mountain_stance', 'Mountain Stance', 'Bergstellung',
    'earth', 'power', 'rare', 3, 0,
    'Block is not removed at the start of your turn.', 'Block wird nicht zu Beginn deiner Runde entfernt.',
    [{ type: 'special', target: 'self', value: 0 }],
    '⛰️'
  ),
  createCard(
    'titanic_blow', 'Titanic Blow', 'Titanenschlag',
    'earth', 'attack', 'rare', 3, 30,
    'Deal 30 damage. Exhaust.', 'Verursache 30 Schaden. Erschöpfung.',
    [{ type: 'damage', target: 'enemy', value: 30 }],
    '👊',
    ['exhaust']
  ),
  createCard(
    'living_wall', 'Living Wall', 'Lebende Mauer',
    'earth', 'skill', 'rare', 2, 12,
    'Gain 12 Block. Gain 2 Thorns.', 'Erhalte 12 Block. Erhalte 2 Dornen.',
    [
      { type: 'block', target: 'self', value: 12 },
      { type: 'buff', target: 'self', value: 2 }
    ],
    '🧱'
  ),
  createCard(
    'tectonic_shift', 'Tectonic Shift', 'Tektonische Verschiebung',
    'earth', 'attack', 'rare', 2, 8,
    'Deal 8 damage 3 times.', 'Verursache 3x 8 Schaden.',
    [
      { type: 'damage', target: 'enemy', value: 8 },
      { type: 'damage', target: 'enemy', value: 8 },
      { type: 'damage', target: 'enemy', value: 8 }
    ],
    '🗺️'
  ),

  // LEGENDARY
  createCard(
    'golem_form', 'Golem Form', 'Golemgestalt',
    'earth', 'power', 'legendary', 3, 8,
    'Gain 8 Block at the end of each turn. Take 25% less damage.', 'Erhalte 8 Block am Ende jeder Runde. Nimm 25% weniger Schaden.',
    [{ type: 'block', target: 'self', value: 8 }],
    '🗿'
  ),
  createCard(
    'world_tree', 'World Tree', 'Weltenbaum',
    'earth', 'power', 'legendary', 4, 5,
    'At end of turn, heal 5 HP and gain 5 Block.', 'Am Ende der Runde heile 5 LP und erhalte 5 Block.',
    [
      { type: 'heal', target: 'self', value: 5 },
      { type: 'block', target: 'self', value: 5 }
    ],
    '🌳'
  ),
  createCard(
    'continental_crush', 'Continental Crush', 'Kontinentalschlag',
    'earth', 'attack', 'legendary', 5, 99,
    'Deal 99 damage. Exhaust.', 'Verursache 99 Schaden. Erschöpfung.',
    [{ type: 'damage', target: 'enemy', value: 99 }],
    '🌍💥',
    ['exhaust']
  ),
];

// =============================================
// 💨 AIR CARDS - Draw / Utility Focus
// =============================================
export const AIR_CARDS: DeckbuilderCard[] = [
  // STARTER
  createCard(
    'air_strike', 'Air Strike', 'Luftschlag',
    'air', 'attack', 'starter', 1, 5,
    'Deal 5 damage. Draw 1 card.', 'Verursache 5 Schaden. Ziehe 1 Karte.',
    [
      { type: 'damage', target: 'enemy', value: 5 },
      { type: 'draw', target: 'self', value: 1 }
    ],
    '💨'
  ),
  createCard(
    'wind_barrier', 'Wind Barrier', 'Windbarriere',
    'air', 'skill', 'starter', 1, 5,
    'Gain 5 Block.', 'Erhalte 5 Block.',
    [{ type: 'block', target: 'self', value: 5 }],
    '🌬️'
  ),

  // COMMON
  createCard(
    'gust', 'Gust', 'Böe',
    'air', 'skill', 'common', 0, 2,
    'Draw 2 cards.', 'Ziehe 2 Karten.',
    [{ type: 'draw', target: 'self', value: 2 }],
    '💨'
  ),
  createCard(
    'quick_slash', 'Quick Slash', 'Schnellhieb',
    'air', 'attack', 'common', 0, 4,
    'Deal 4 damage.', 'Verursache 4 Schaden.',
    [{ type: 'damage', target: 'enemy', value: 4 }],
    '⚡'
  ),
  createCard(
    'tailwind', 'Tailwind', 'Rückenwind',
    'air', 'skill', 'common', 1, 1,
    'Gain 1 Energy. Draw 1 card.', 'Erhalte 1 Energie. Ziehe 1 Karte.',
    [
      { type: 'energy', target: 'self', value: 1 },
      { type: 'draw', target: 'self', value: 1 }
    ],
    '🎐'
  ),
  createCard(
    'draft', 'Draft', 'Luftzug',
    'air', 'skill', 'common', 1, 1,
    'Draw 1 card. That card costs 0 this turn.', 'Ziehe 1 Karte. Diese kostet 0 diese Runde.',
    [{ type: 'draw', target: 'self', value: 1 }],
    '📜'
  ),
  createCard(
    'evasion', 'Evasion', 'Ausweichen',
    'air', 'skill', 'common', 1, 6,
    'Gain 6 Block. Draw 1 card.', 'Erhalte 6 Block. Ziehe 1 Karte.',
    [
      { type: 'block', target: 'self', value: 6 },
      { type: 'draw', target: 'self', value: 1 }
    ],
    '👻'
  ),

  // UNCOMMON
  createCard(
    'lightning_bolt', 'Lightning Bolt', 'Blitzschlag',
    'air', 'attack', 'uncommon', 2, 15,
    'Deal 15 damage. Ignores Block.', 'Verursache 15 Schaden. Ignoriert Block.',
    [{ type: 'damage', target: 'enemy', value: 15 }],
    '⚡'
  ),
  createCard(
    'aerodynamics', 'Aerodynamics', 'Aerodynamik',
    'air', 'power', 'uncommon', 1, 1,
    'Draw 1 additional card each turn.', 'Ziehe jede Runde 1 zusätzliche Karte.',
    [{ type: 'draw', target: 'self', value: 1 }],
    '✈️'
  ),
  createCard(
    'tornado', 'Tornado', 'Tornado',
    'air', 'attack', 'uncommon', 2, 6,
    'Deal 6 damage 3 times to random enemies.', 'Verursache 3x 6 Schaden an zufällige Gegner.',
    [
      { type: 'damage', target: 'random', value: 6 },
      { type: 'damage', target: 'random', value: 6 },
      { type: 'damage', target: 'random', value: 6 }
    ],
    '🌪️'
  ),
  createCard(
    'slipstream', 'Slipstream', 'Windschatten',
    'air', 'skill', 'uncommon', 0, 3,
    'Draw 3 cards. Discard 1 card.', 'Ziehe 3 Karten. Wirf 1 Karte ab.',
    [{ type: 'draw', target: 'self', value: 3 }],
    '🏎️'
  ),
  createCard(
    'static_charge', 'Static Charge', 'Statische Ladung',
    'air', 'skill', 'uncommon', 1, 3,
    'Gain 3 Energized. (Next turn +3 Energy)', 'Erhalte 3 Aufgeladen. (Nächste Runde +3 Energie)',
    [{ type: 'buff', target: 'self', value: 3 }],
    '⚡'
  ),

  // RARE
  createCard(
    'storm_of_blades', 'Storm of Blades', 'Klingensturm',
    'air', 'attack', 'rare', 2, 4,
    'Deal 4 damage for each card in your hand.', 'Verursache 4 Schaden für jede Karte in deiner Hand.',
    [{ type: 'damage', target: 'enemy', value: 4, scaling: { stat: 'hand_size', multiplier: 1 } }],
    '🗡️'
  ),
  createCard(
    'second_wind', 'Second Wind', 'Zweiter Atem',
    'air', 'skill', 'rare', 1, 0,
    'Exhaust all non-Attack cards. Gain 5 Block for each.', 'Erschöpfe alle Nicht-Angriffe. Erhalte je 5 Block.',
    [{ type: 'block', target: 'self', value: 5 }],
    '💨'
  ),
  createCard(
    'thunderstorm', 'Thunderstorm', 'Gewitter',
    'air', 'power', 'rare', 3, 7,
    'At end of turn, deal 7 damage to a random enemy.', 'Am Ende der Runde, verursache 7 Schaden an einem zufälligen Gegner.',
    [{ type: 'damage', target: 'random', value: 7 }],
    '⛈️'
  ),
  createCard(
    'bullet_time', 'Bullet Time', 'Zeitlupe',
    'air', 'skill', 'rare', 3, 0,
    'All cards cost 0 this turn.', 'Alle Karten kosten 0 diese Runde.',
    [{ type: 'special', target: 'self', value: 0 }],
    '🎯'
  ),

  // LEGENDARY
  createCard(
    'eye_of_storm', 'Eye of the Storm', 'Auge des Sturms',
    'air', 'power', 'legendary', 3, 1,
    'Gain 1 Energy at the start of each turn.', 'Erhalte 1 Energie zu Beginn jeder Runde.',
    [{ type: 'energy', target: 'self', value: 1 }],
    '👁️'
  ),
  createCard(
    'infinite_blades', 'Infinite Blades', 'Unendliche Klingen',
    'air', 'power', 'legendary', 2, 0,
    'At the start of each turn, add a Quick Slash to your hand.', 'Zu Beginn jeder Runde füge einen Schnellhieb deiner Hand hinzu.',
    [{ type: 'special', target: 'self', value: 0 }],
    '♾️'
  ),
  createCard(
    'judgement', 'Judgement', 'Urteil',
    'air', 'attack', 'legendary', 2, 0,
    'If enemy has 30 or less HP, set their HP to 0.', 'Wenn Gegner 30 oder weniger LP hat, setze LP auf 0.',
    [{ type: 'special', target: 'enemy', value: 30 }],
    '⚖️'
  ),
];

// =============================================
// 🌑 VOID CARDS - High Risk / High Reward
// =============================================
export const VOID_CARDS: DeckbuilderCard[] = [
  // UNCOMMON (No starters - Void is unlocked later)
  createCard(
    'dark_pact', 'Dark Pact', 'Dunkler Pakt',
    'void', 'skill', 'uncommon', 0, 2,
    'Lose 5 HP. Draw 2 cards. Gain 1 Energy.', 'Verliere 5 LP. Ziehe 2 Karten. Erhalte 1 Energie.',
    [
      { type: 'damage', target: 'self', value: 5 },
      { type: 'draw', target: 'self', value: 2 },
      { type: 'energy', target: 'self', value: 1 }
    ],
    '🌑'
  ),
  createCard(
    'void_strike', 'Void Strike', 'Leerenstreik',
    'void', 'attack', 'uncommon', 1, 12,
    'Deal 12 damage. Add a Wound to your discard pile.', 'Verursache 12 Schaden. Füge eine Wunde deinem Ablagestapel hinzu.',
    [{ type: 'damage', target: 'enemy', value: 12 }],
    '🗡️'
  ),
  createCard(
    'corruption', 'Corruption', 'Korruption',
    'void', 'power', 'uncommon', 3, 0,
    'Skills cost 0. Whenever you play a Skill, Exhaust it.', 'Fähigkeiten kosten 0. Erschöpfe jede gespielte Fähigkeit.',
    [{ type: 'special', target: 'self', value: 0 }],
    '💀'
  ),
  createCard(
    'soul_drain', 'Soul Drain', 'Seelenentzug',
    'void', 'attack', 'uncommon', 2, 10,
    'Deal 10 damage. Heal 10 HP.', 'Verursache 10 Schaden. Heile 10 LP.',
    [
      { type: 'damage', target: 'enemy', value: 10 },
      { type: 'heal', target: 'self', value: 10 }
    ],
    '👻'
  ),

  // RARE
  createCard(
    'offering', 'Offering', 'Opferung',
    'void', 'skill', 'rare', 0, 0,
    'Lose 6 HP. Gain 2 Energy. Draw 3 cards.', 'Verliere 6 LP. Erhalte 2 Energie. Ziehe 3 Karten.',
    [
      { type: 'damage', target: 'self', value: 6 },
      { type: 'energy', target: 'self', value: 2 },
      { type: 'draw', target: 'self', value: 3 }
    ],
    '🩸'
  ),
  createCard(
    'doom', 'Doom', 'Verderben',
    'void', 'attack', 'rare', 3, 0,
    'Deal damage equal to enemy\'s current HP / 2.', 'Verursache Schaden gleich halber Gegner-LP.',
    [{ type: 'damage', target: 'enemy', value: 0 }],
    '💀'
  ),
  createCard(
    'parasite', 'Parasite', 'Parasit',
    'void', 'power', 'rare', 1, 0,
    'When enemy attacks, deal 5 damage to them.', 'Wenn Gegner angreift, verursache 5 Schaden an ihm.',
    [{ type: 'damage', target: 'enemy', value: 5 }],
    '🦠'
  ),
  createCard(
    'shadow_clone', 'Shadow Clone', 'Schattenklon',
    'void', 'skill', 'rare', 1, 0,
    'Add a copy of the last card you played to your hand.', 'Füge eine Kopie der letzten gespielten Karte deiner Hand hinzu.',
    [{ type: 'special', target: 'self', value: 0 }],
    '👥'
  ),

  // LEGENDARY
  createCard(
    'apotheosis', 'Apotheosis', 'Apotheose',
    'void', 'skill', 'legendary', 2, 0,
    'Upgrade ALL cards in your deck. Exhaust.', 'Verbessere ALLE Karten in deinem Deck. Erschöpfung.',
    [{ type: 'special', target: 'self', value: 0 }],
    '✨',
    ['exhaust']
  ),
  createCard(
    'void_form', 'Void Form', 'Leerengestalt',
    'void', 'power', 'legendary', 3, 1,
    'At end of turn, gain 1 Strength. Lose 1 HP each turn.', 'Am Ende der Runde +1 Stärke. Verliere jede Runde 1 LP.',
    [{ type: 'buff', target: 'self', value: 1 }],
    '🌑'
  ),
  createCard(
    'unceasing_top', 'Unceasing Top', 'Endloser Kreisel',
    'void', 'power', 'legendary', 1, 0,
    'Whenever your hand is empty, draw 1 card.', 'Wenn deine Hand leer ist, ziehe 1 Karte.',
    [{ type: 'draw', target: 'self', value: 1 }],
    '🎡'
  ),
  createCard(
    'death_touch', 'Death Touch', 'Todesberührung',
    'void', 'attack', 'legendary', 4, 999,
    'Kill an enemy with 50 HP or less.', 'Töte einen Gegner mit 50 oder weniger LP.',
    [{ type: 'special', target: 'enemy', value: 50 }],
    '☠️'
  ),
];

// =============================================
// CURSE & STATUS CARDS (Negative)
// =============================================
export const CURSE_CARDS: DeckbuilderCard[] = [
  createCard(
    'wound', 'Wound', 'Wunde',
    'void', 'status', 'common', 0, 0,
    'Unplayable.', 'Nicht spielbar.',
    [],
    '🩹',
    ['unplayable']
  ),
  createCard(
    'burn', 'Burn', 'Verbrennung',
    'fire', 'status', 'common', 0, 2,
    'Unplayable. At end of turn, take 2 damage.', 'Nicht spielbar. Am Ende der Runde 2 Schaden.',
    [{ type: 'damage', target: 'self', value: 2 }],
    '🔥',
    ['unplayable']
  ),
  createCard(
    'dazed', 'Dazed', 'Benommen',
    'air', 'status', 'common', 0, 0,
    'Unplayable. Ethereal.', 'Nicht spielbar. Ätherisch.',
    [],
    '😵',
    ['unplayable', 'ethereal']
  ),
  createCard(
    'curse_regret', 'Regret', 'Reue',
    'void', 'curse', 'common', 0, 0,
    'Unplayable. At end of turn, lose 1 HP per card in hand.', 'Nicht spielbar. Am Rundenende verliere 1 LP pro Karte in Hand.',
    [{ type: 'damage', target: 'self', value: 1, scaling: { stat: 'hand_size', multiplier: 1 } }],
    '😔',
    ['unplayable']
  ),
  createCard(
    'curse_decay', 'Decay', 'Verfall',
    'void', 'curse', 'uncommon', 0, 2,
    'Unplayable. At end of turn, take 2 damage.', 'Nicht spielbar. Am Rundenende 2 Schaden.',
    [{ type: 'damage', target: 'self', value: 2 }],
    '🦴',
    ['unplayable']
  ),
];

// =============================================
// ALL CARDS COMBINED
// =============================================
export const ALL_CARDS: DeckbuilderCard[] = [
  ...FIRE_CARDS,
  ...WATER_CARDS,
  ...EARTH_CARDS,
  ...AIR_CARDS,
  ...VOID_CARDS,
  ...CURSE_CARDS,
];

// =============================================
// HELPER FUNCTIONS
// =============================================

export const getCardById = (id: string): DeckbuilderCard | undefined => 
  ALL_CARDS.find(card => card.id === id);

export const getCardsByElement = (element: CardElement): DeckbuilderCard[] =>
  ALL_CARDS.filter(card => card.element === element && card.type !== 'curse' && card.type !== 'status');

export const getCardsByRarity = (rarity: CardRarity): DeckbuilderCard[] =>
  ALL_CARDS.filter(card => card.rarity === rarity && card.type !== 'curse' && card.type !== 'status');

export const getStarterDeck = (element: CardElement = 'fire'): DeckbuilderCard[] => {
  const starters = ALL_CARDS.filter(c => c.rarity === 'starter' && c.element === element);
  // 4 copies of strike, 4 copies of guard
  return [
    ...Array(4).fill(starters.find(c => c.type === 'attack')!),
    ...Array(4).fill(starters.find(c => c.type === 'skill')!),
  ];
};

export const getRandomCard = (
  rarity?: CardRarity,
  element?: CardElement,
  excludeIds: string[] = []
): DeckbuilderCard => {
  let pool = ALL_CARDS.filter(c => 
    c.type !== 'curse' && 
    c.type !== 'status' && 
    !excludeIds.includes(c.id)
  );
  
  if (rarity) pool = pool.filter(c => c.rarity === rarity);
  if (element) pool = pool.filter(c => c.element === element);
  
  return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomCardWithWeights = (excludeIds: string[] = []): DeckbuilderCard => {
  const weights = {
    common: 60,
    uncommon: 25,
    rare: 12,
    legendary: 3,
  };
  
  const roll = Math.random() * 100;
  let rarity: CardRarity;
  
  if (roll < weights.common) rarity = 'common';
  else if (roll < weights.common + weights.uncommon) rarity = 'uncommon';
  else if (roll < weights.common + weights.uncommon + weights.rare) rarity = 'rare';
  else rarity = 'legendary';
  
  return getRandomCard(rarity, undefined, excludeIds);
};

// Get card count for pack opening
export const TOTAL_CARD_COUNT = ALL_CARDS.filter(c => c.type !== 'curse' && c.type !== 'status').length;

console.log(`[Deckbuilder] Loaded ${TOTAL_CARD_COUNT} cards:
  - Fire: ${FIRE_CARDS.length}
  - Water: ${WATER_CARDS.length}
  - Earth: ${EARTH_CARDS.length}
  - Air: ${AIR_CARDS.length}
  - Void: ${VOID_CARDS.length}
  - Curse/Status: ${CURSE_CARDS.length}
`);
