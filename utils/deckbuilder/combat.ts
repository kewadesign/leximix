// ============================================
// KARTENSCHMIEDE - Combat System
// ============================================
// Complete turn-based combat system with energy, damage, block, status effects

import { 
  DeckbuilderCard, 
  Enemy, 
  CombatState, 
  StatusEffect, 
  StatusType,
  CardEffect,
  EnemyIntent
} from './types';

// ===================
// COMBAT INITIALIZATION
// ===================

export function initializeCombat(
  deck: DeckbuilderCard[],
  enemies: Enemy[],
  maxHp: number = 80,
  maxEnergy: number = 3
): CombatState {
  // Shuffle deck
  const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
  
  // Draw initial hand (5 cards)
  const hand = shuffledDeck.splice(0, 5);
  
  return {
    player: {
      currentHp: maxHp,
      maxHp,
      block: 0,
      energy: maxEnergy,
      maxEnergy,
      statusEffects: [],
    },
    enemies: enemies.map(e => ({
      ...e,
      currentHp: e.maxHp,
      block: 0,
      currentIntentIndex: 0,
      statusEffects: [],
    })),
    hand,
    drawPile: shuffledDeck,
    discardPile: [],
    exhaustPile: [],
    turn: 1,
  };
}

// ===================
// TURN MANAGEMENT
// ===================

export function startPlayerTurn(state: CombatState): CombatState {
  let newState = { ...state };
  
  // Reset energy
  newState.player.energy = newState.player.maxEnergy;
  
  // Clear block
  newState.player.block = 0;
  
  // Apply start-of-turn effects
  newState = applyStartOfTurnEffects(newState);
  
  // Draw cards (5 by default)
  newState = drawCards(newState, 5);
  
  return newState;
}

export function endPlayerTurn(state: CombatState): CombatState {
  let newState = { ...state };
  
  // Apply end-of-turn effects
  newState = applyEndOfTurnEffects(newState);
  
  // Discard hand
  newState.discardPile = [...newState.discardPile, ...newState.hand];
  newState.hand = [];
  
  // Process ethereal cards
  // (They get exhausted if still in hand - already discarded above)
  
  return newState;
}

export function executeEnemyTurn(state: CombatState): CombatState {
  let newState = { ...state };
  
  for (let i = 0; i < newState.enemies.length; i++) {
    const enemy = newState.enemies[i];
    if (enemy.currentHp <= 0) continue;
    
    // Clear enemy block
    enemy.block = 0;
    
    // Execute intent
    const intent = enemy.intents[enemy.currentIntentIndex % enemy.intents.length];
    newState = executeEnemyIntent(newState, i, intent);
    
    // Advance to next intent
    enemy.currentIntentIndex = (enemy.currentIntentIndex + 1) % enemy.intents.length;
  }
  
  // Apply poison to enemies
  for (const enemy of newState.enemies) {
    const poison = getStatusStacks(enemy.statusEffects, 'poison');
    if (poison > 0) {
      enemy.currentHp -= poison;
      decrementStatus(enemy.statusEffects, 'poison', 1);
    }
  }
  
  // Increment turn
  newState.turn++;
  
  return newState;
}

function executeEnemyIntent(state: CombatState, enemyIndex: number, intent: EnemyIntent): CombatState {
  let newState = { ...state };
  const enemy = newState.enemies[enemyIndex];
  
  switch (intent.type) {
    case 'attack':
      let damage = intent.value || 0;
      
      // Apply weakness
      if (hasStatus(enemy.statusEffects, 'weak')) {
        damage = Math.floor(damage * 0.75);
      }
      
      // Apply vulnerability on player
      if (hasStatus(newState.player.statusEffects, 'vulnerable')) {
        damage = Math.floor(damage * 1.5);
      }
      
      // Apply to block first
      const blockedDamage = Math.min(damage, newState.player.block);
      newState.player.block -= blockedDamage;
      damage -= blockedDamage;
      
      // Apply remaining damage to HP
      newState.player.currentHp -= damage;
      
      // Apply thorns
      const thorns = getStatusStacks(newState.player.statusEffects, 'thorns');
      if (thorns > 0) {
        enemy.currentHp -= thorns;
      }
      break;
      
    case 'defend':
      enemy.block += intent.value || 0;
      break;
      
    case 'buff':
      addStatus(enemy.statusEffects, 'strength', intent.value || 0);
      break;
      
    case 'debuff':
      addStatus(newState.player.statusEffects, 'vulnerable', intent.value || 0, 2);
      break;
      
    case 'special':
      // Special attacks vary by enemy
      break;
  }
  
  return newState;
}

// ===================
// CARD PLAYING
// ===================

export function canPlayCard(state: CombatState, cardIndex: number): boolean {
  const card = state.hand[cardIndex];
  if (!card) return false;
  
  // Check energy
  if (card.cost > state.player.energy) return false;
  
  // Check if unplayable
  if (card.keywords?.includes('unplayable')) return false;
  
  return true;
}

export function playCard(
  state: CombatState, 
  cardIndex: number, 
  targetEnemyIndex: number = 0
): CombatState {
  if (!canPlayCard(state, cardIndex)) return state;
  
  let newState = { ...state };
  const card = newState.hand[cardIndex];
  
  // Spend energy
  newState.player.energy -= card.cost;
  
  // Remove from hand
  newState.hand = newState.hand.filter((_, i) => i !== cardIndex);
  
  // Execute effects
  for (const effect of card.effects) {
    newState = executeCardEffect(newState, effect, targetEnemyIndex);
  }
  
  // Handle exhaustion
  if (card.keywords?.includes('exhaust')) {
    newState.exhaustPile.push(card);
  } else {
    newState.discardPile.push(card);
  }
  
  return newState;
}

function executeCardEffect(
  state: CombatState, 
  effect: CardEffect, 
  targetIndex: number
): CombatState {
  let newState = { ...state };
  const player = newState.player;
  
  // Calculate value with scaling
  let value = effect.value;
  if (effect.scaling) {
    switch (effect.scaling.stat) {
      case 'strength':
        value += getStatusStacks(player.statusEffects, 'strength') * effect.scaling.multiplier;
        break;
      case 'dexterity':
        value += getStatusStacks(player.statusEffects, 'dexterity') * effect.scaling.multiplier;
        break;
      case 'hand_size':
        value += newState.hand.length * effect.scaling.multiplier;
        break;
      case 'discard_count':
        value += newState.discardPile.length * effect.scaling.multiplier;
        break;
    }
  }
  
  switch (effect.type) {
    case 'damage':
      newState = dealDamage(newState, value, effect.target, targetIndex);
      break;
      
    case 'block':
      player.block += value + getStatusStacks(player.statusEffects, 'dexterity');
      break;
      
    case 'heal':
      player.currentHp = Math.min(player.currentHp + value, player.maxHp);
      break;
      
    case 'draw':
      newState = drawCards(newState, value);
      break;
      
    case 'energy':
      player.energy += value;
      break;
      
    case 'buff':
      // Generic buff - usually handled by specific card
      break;
      
    case 'debuff':
      if (effect.target === 'enemy') {
        const enemy = newState.enemies[targetIndex];
        if (enemy) {
          addStatus(enemy.statusEffects, 'vulnerable', value, effect.duration);
        }
      } else if (effect.target === 'all_enemies') {
        for (const enemy of newState.enemies) {
          addStatus(enemy.statusEffects, 'weak', value, effect.duration);
        }
      }
      break;
  }
  
  return newState;
}

function dealDamage(
  state: CombatState, 
  baseDamage: number, 
  target: CardEffect['target'], 
  targetIndex: number
): CombatState {
  let newState = { ...state };
  const player = newState.player;
  
  // Apply player strength
  let damage = baseDamage + getStatusStacks(player.statusEffects, 'strength');
  
  // Apply weakness (if player is weak)
  if (hasStatus(player.statusEffects, 'weak')) {
    damage = Math.floor(damage * 0.75);
  }
  
  const applyToEnemy = (enemy: Enemy) => {
    let finalDamage = damage;
    
    // Apply vulnerability
    if (hasStatus(enemy.statusEffects, 'vulnerable')) {
      finalDamage = Math.floor(finalDamage * 1.5);
    }
    
    // Apply to block first
    const blockedDamage = Math.min(finalDamage, enemy.block);
    enemy.block -= blockedDamage;
    finalDamage -= blockedDamage;
    
    // Apply remaining damage to HP
    enemy.currentHp -= finalDamage;
  };
  
  switch (target) {
    case 'enemy':
      if (newState.enemies[targetIndex]) {
        applyToEnemy(newState.enemies[targetIndex]);
      }
      break;
      
    case 'all_enemies':
      for (const enemy of newState.enemies) {
        applyToEnemy(enemy);
      }
      break;
      
    case 'random':
      const aliveEnemies = newState.enemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length > 0) {
        const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        applyToEnemy(randomEnemy);
      }
      break;
      
    case 'self':
      // Self-damage (doesn't use block)
      player.currentHp -= damage;
      break;
  }
  
  return newState;
}

// ===================
// DRAW & DISCARD
// ===================

export function drawCards(state: CombatState, count: number): CombatState {
  let newState = { ...state };
  
  for (let i = 0; i < count; i++) {
    // Check if draw pile is empty
    if (newState.drawPile.length === 0) {
      // Shuffle discard into draw pile
      newState.drawPile = [...newState.discardPile].sort(() => Math.random() - 0.5);
      newState.discardPile = [];
    }
    
    // Draw if possible
    if (newState.drawPile.length > 0) {
      const card = newState.drawPile.shift()!;
      newState.hand.push(card);
    }
  }
  
  return newState;
}

export function discardCard(state: CombatState, cardIndex: number): CombatState {
  let newState = { ...state };
  const card = newState.hand[cardIndex];
  
  if (card) {
    newState.hand = newState.hand.filter((_, i) => i !== cardIndex);
    newState.discardPile.push(card);
  }
  
  return newState;
}

export function exhaustCard(state: CombatState, cardIndex: number): CombatState {
  let newState = { ...state };
  const card = newState.hand[cardIndex];
  
  if (card) {
    newState.hand = newState.hand.filter((_, i) => i !== cardIndex);
    newState.exhaustPile.push(card);
  }
  
  return newState;
}

// ===================
// STATUS EFFECTS
// ===================

export function addStatus(
  effects: StatusEffect[], 
  type: StatusType, 
  stacks: number, 
  duration?: number
): void {
  const existing = effects.find(e => e.type === type);
  
  if (existing) {
    existing.stacks += stacks;
    if (duration) {
      existing.duration = Math.max(existing.duration || 0, duration);
    }
  } else {
    effects.push({
      type,
      stacks,
      duration,
      icon: getStatusIcon(type),
    });
  }
}

export function removeStatus(effects: StatusEffect[], type: StatusType): void {
  const index = effects.findIndex(e => e.type === type);
  if (index !== -1) {
    effects.splice(index, 1);
  }
}

export function decrementStatus(effects: StatusEffect[], type: StatusType, amount: number = 1): void {
  const effect = effects.find(e => e.type === type);
  if (effect) {
    effect.stacks -= amount;
    if (effect.stacks <= 0) {
      removeStatus(effects, type);
    }
  }
}

export function hasStatus(effects: StatusEffect[], type: StatusType): boolean {
  return effects.some(e => e.type === type && e.stacks > 0);
}

export function getStatusStacks(effects: StatusEffect[], type: StatusType): number {
  const effect = effects.find(e => e.type === type);
  return effect?.stacks || 0;
}

function getStatusIcon(type: StatusType): string {
  const icons: Record<StatusType, string> = {
    strength: '💪',
    dexterity: '🎯',
    vulnerable: '💔',
    weak: '😵',
    frail: '🦴',
    poison: '☠️',
    burn: '🔥',
    regen: '💚',
    thorns: '🌹',
    artifact: '🛡️',
    energized: '⚡',
  };
  return icons[type] || '❓';
}

// ===================
// TURN EFFECTS
// ===================

function applyStartOfTurnEffects(state: CombatState): CombatState {
  let newState = { ...state };
  const player = newState.player;
  
  // Regen
  const regen = getStatusStacks(player.statusEffects, 'regen');
  if (regen > 0) {
    player.currentHp = Math.min(player.currentHp + regen, player.maxHp);
    decrementStatus(player.statusEffects, 'regen');
  }
  
  // Energized
  const energized = getStatusStacks(player.statusEffects, 'energized');
  if (energized > 0) {
    player.energy += energized;
    removeStatus(player.statusEffects, 'energized');
  }
  
  return newState;
}

function applyEndOfTurnEffects(state: CombatState): CombatState {
  let newState = { ...state };
  const player = newState.player;
  
  // Burn damage
  const burn = getStatusStacks(player.statusEffects, 'burn');
  if (burn > 0) {
    player.currentHp -= burn;
    decrementStatus(player.statusEffects, 'burn');
  }
  
  // Decrement duration-based effects
  for (const effect of player.statusEffects) {
    if (effect.duration !== undefined && effect.duration > 0) {
      effect.duration--;
      if (effect.duration <= 0) {
        removeStatus(player.statusEffects, effect.type);
      }
    }
  }
  
  return newState;
}

// ===================
// COMBAT CHECKS
// ===================

export function isCombatOver(state: CombatState): { over: boolean; playerWon: boolean } {
  // Check player death
  if (state.player.currentHp <= 0) {
    return { over: true, playerWon: false };
  }
  
  // Check all enemies dead
  const allEnemiesDead = state.enemies.every(e => e.currentHp <= 0);
  if (allEnemiesDead) {
    return { over: true, playerWon: true };
  }
  
  return { over: false, playerWon: false };
}

export function getAliveEnemies(state: CombatState): Enemy[] {
  return state.enemies.filter(e => e.currentHp > 0);
}

// ===================
// COMBAT REWARDS
// ===================

export function calculateCombatRewards(
  state: CombatState, 
  floorNumber: number,
  isElite: boolean = false,
  isBoss: boolean = false
): { gold: number; cardChoices: number; relicChance: number } {
  let baseGold = 10 + Math.floor(floorNumber / 3) * 5;
  let cardChoices = 3;
  let relicChance = 0;
  
  if (isElite) {
    baseGold *= 2;
    cardChoices = 4;
    relicChance = 0.5;
  }
  
  if (isBoss) {
    baseGold *= 3;
    cardChoices = 3;
    relicChance = 1.0; // Guaranteed relic from boss
  }
  
  // Add randomness
  const goldVariance = Math.floor(baseGold * 0.2);
  const gold = baseGold + Math.floor(Math.random() * goldVariance * 2) - goldVariance;
  
  return { gold, cardChoices, relicChance };
}

// Export all combat functions
export default {
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
};
