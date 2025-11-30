// ============================================
// KARTENSCHMIEDE - Roguelike Deckbuilder Types
// ============================================

// ===================
// CARD SYSTEM
// ===================

export type CardElement = 'fire' | 'water' | 'earth' | 'air' | 'void';
export type CardType = 'attack' | 'skill' | 'power' | 'curse' | 'status';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'legendary';

export interface CardEffect {
  type: 'damage' | 'block' | 'heal' | 'draw' | 'energy' | 'buff' | 'debuff' | 'special';
  target: 'self' | 'enemy' | 'all_enemies' | 'random';
  value: number;
  duration?: number;
  scaling?: {
    stat: 'strength' | 'dexterity' | 'hand_size' | 'discard_count';
    multiplier: number;
  };
}

export interface DeckbuilderCard {
  id: string;
  name: string;
  nameDE: string;
  element: CardElement;
  type: CardType;
  rarity: CardRarity;
  cost: number;           // Energy cost to play
  baseCost: number;       // Original cost (for effects)
  value: number;          // Main effect value (damage/block/etc)
  baseValue: number;      // Original value
  description: string;
  descriptionDE: string;
  effects: CardEffect[];
  upgraded: boolean;
  upgradedVersion?: Partial<DeckbuilderCard>;
  keywords?: CardKeyword[];
  artwork: string;        // Emoji or image path
  animationClass?: string;
}

export type CardKeyword = 
  | 'exhaust'      // Remove from combat after use
  | 'ethereal'     // Discard at end of turn if not played
  | 'innate'       // Always in starting hand
  | 'retain'       // Keep in hand at end of turn
  | 'unplayable'   // Cannot be played
  | 'autoplay';    // Plays automatically when drawn

// ===================
// ENEMY SYSTEM
// ===================

export type EnemyIntentType = 
  | 'attack' 
  | 'defend' 
  | 'buff' 
  | 'debuff' 
  | 'special' 
  | 'unknown';

export interface EnemyIntent {
  type: EnemyIntentType;
  value?: number;
  description?: string;
  icon: string;
}

export interface Enemy {
  id: string;
  name: string;
  nameDE: string;
  maxHp: number;
  currentHp: number;
  block: number;
  artwork: string;
  intents: EnemyIntent[];
  currentIntentIndex: number;
  passiveAbility?: {
    name: string;
    description: string;
    effect: () => void;
  };
  statusEffects: StatusEffect[];
  actNumber: 1 | 2 | 3;
  isBoss: boolean;
  isElite: boolean;
}

// ===================
// STATUS EFFECTS
// ===================

export type StatusType = 
  | 'strength'     // +damage per attack
  | 'dexterity'    // +block per skill
  | 'vulnerable'   // Take 50% more damage
  | 'weak'         // Deal 25% less damage
  | 'frail'        // Gain 25% less block
  | 'poison'       // Lose HP at turn end
  | 'burn'         // Take damage when playing cards
  | 'regen'        // Heal at turn start
  | 'thorns'       // Deal damage when attacked
  | 'artifact'     // Block next debuff
  | 'energized';   // +energy next turn

export interface StatusEffect {
  type: StatusType;
  stacks: number;
  duration?: number;  // undefined = permanent until removed
  icon: string;
}

// ===================
// RELIC SYSTEM
// ===================

export type RelicRarity = 'common' | 'uncommon' | 'rare' | 'boss' | 'shop' | 'event';

export interface Relic {
  id: string;
  name: string;
  nameDE: string;
  rarity: RelicRarity;
  description: string;
  descriptionDE: string;
  icon: string;
  effect: RelicEffect;
  counter?: number;  // For relics that count things
}

export interface RelicEffect {
  trigger: 'combat_start' | 'turn_start' | 'turn_end' | 'on_damage' | 'on_kill' | 'passive' | 'on_card_play';
  action: string;  // Reference to effect function
  value?: number;
}

// ===================
// MAP SYSTEM
// ===================

export type MapNodeType = 
  | 'combat' 
  | 'elite' 
  | 'event' 
  | 'shop' 
  | 'treasure' 
  | 'rest' 
  | 'boss';

export interface MapNode {
  id: string;
  type: MapNodeType;
  x: number;
  y: number;
  connections: string[];  // IDs of connected nodes
  visited: boolean;
  icon: string;
}

export interface GameMap {
  nodes: MapNode[];
  currentNodeId: string | null;
  actNumber: 1 | 2 | 3;
}

// ===================
// COMBAT STATE
// ===================

export interface CombatState {
  player: {
    currentHp: number;
    maxHp: number;
    block: number;
    energy: number;
    maxEnergy: number;
    statusEffects: StatusEffect[];
  };
  enemies: Enemy[];
  hand: DeckbuilderCard[];
  drawPile: DeckbuilderCard[];
  discardPile: DeckbuilderCard[];
  exhaustPile: DeckbuilderCard[];
  turn: number;
  combatRewards?: CombatReward[];
}

export interface CombatReward {
  type: 'card' | 'gold' | 'relic' | 'potion';
  options?: DeckbuilderCard[];  // For card rewards
  value?: number;               // For gold
  relic?: Relic;
}

// ===================
// RUN STATE
// ===================

export interface DeckbuilderRun {
  id: string;
  seed: number;
  startedAt: number;
  currentAct: 1 | 2 | 3;
  currentFloor: number;
  player: {
    hp: number;
    maxHp: number;
    gold: number;
  };
  deck: DeckbuilderCard[];
  relics: Relic[];
  map: GameMap;
  combatState?: CombatState;
  score: number;
  isDaily: boolean;
  modifiers?: RunModifier[];
}

export interface RunModifier {
  id: string;
  name: string;
  description: string;
  effect: string;
}

// ===================
// PLAYER COLLECTION
// ===================

export interface CardCollection {
  [cardId: string]: {
    count: number;
    upgraded: boolean;
    firstObtained: number;
  };
}

export interface DeckbuilderPlayerData {
  collection: CardCollection;
  dust: number;
  unlockedArchetypes: string[];
  masteryLevel: number;
  masteryXP: number;
  pityCounters: {
    standard: number;
    fire: number;
    water: number;
    earth: number;
    air: number;
  };
  stats: {
    runsStarted: number;
    runsCompleted: number;
    bossesKilled: number;
    cardsPlayed: number;
    highestFloor: number;
    fastestRun: number;
  };
  dailyChallengeHistory: {
    [date: string]: {
      score: number;
      rank: number;
      completed: boolean;
    };
  };
}

// ===================
// GACHA / PACK SYSTEM
// ===================

export type PackType = 'basic' | 'standard' | 'premium' | 'element_fire' | 'element_water' | 'element_earth' | 'element_air';

export interface CardPack {
  id: PackType;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  cardCount: number;
  coinsCost: number | null;
  gemsCost: number | null;
  guaranteedRarity: CardRarity;
  elementFilter?: CardElement;
  icon: string;
}

export interface PackOpeningResult {
  cards: DeckbuilderCard[];
  newCards: string[];  // IDs of cards player didn't have
  dustGained: number;  // From duplicates
  pityProgress: number;
}

// ===================
// DAILY CHALLENGE
// ===================

export interface DailyChallenge {
  id: string;
  date: string;
  seed: number;
  modifiers: RunModifier[];
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  odvisitorId: string;
  odvisitorName: string;
  score: number;
  floor: number;
  time: number;
  deck: string[];  // Card IDs
  timestamp: number;
}

// ===================
// EVENTS
// ===================

export interface GameEvent {
  id: string;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  artwork: string;
  choices: EventChoice[];
}

export interface EventChoice {
  text: string;
  textDE: string;
  requirement?: {
    type: 'gold' | 'hp' | 'relic' | 'card';
    value: number | string;
  };
  outcomes: EventOutcome[];
}

export interface EventOutcome {
  probability: number;  // 0-1
  effects: {
    type: 'gold' | 'hp' | 'maxHp' | 'card' | 'relic' | 'remove_card' | 'upgrade_card' | 'transform_card';
    value: number | string;
  }[];
  message: string;
  messageDE: string;
}
