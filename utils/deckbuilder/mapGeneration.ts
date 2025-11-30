// ============================================
// KARTENSCHMIEDE - Map Generation System
// ============================================
// Procedural roguelike map with 250+ floors across multiple acts

import { MapNode, MapNodeType, GameMap } from './types';

// ===================
// MAP CONFIGURATION
// ===================

export const MAP_CONFIG = {
  // Total structure: 5 Acts x 50 floors each = 250 floors
  totalActs: 5,
  floorsPerAct: 50,
  
  // Node distribution per floor type
  nodesPerFloor: {
    min: 2,
    max: 4,
  },
  
  // Branching configuration
  maxBranches: 3,
  branchMergeChance: 0.3, // Chance that paths merge
  
  // Node type weights by floor position
  nodeTypeWeights: {
    early: { // Floors 1-15
      combat: 50,
      event: 25,
      shop: 10,
      treasure: 5,
      rest: 10,
      elite: 0,
    },
    mid: { // Floors 16-35
      combat: 40,
      event: 20,
      shop: 10,
      treasure: 5,
      rest: 10,
      elite: 15,
    },
    late: { // Floors 36-49
      combat: 35,
      event: 15,
      shop: 10,
      treasure: 5,
      rest: 15,
      elite: 20,
    },
  },
  
  // Guaranteed nodes
  guaranteedNodes: {
    shop: [17, 33, 49], // Shop on these floors
    rest: [25, 45], // Rest site before hard sections
    elite: [10, 20, 30, 40], // Guaranteed elites
    treasure: [15, 35], // Guaranteed treasure
  },
};

// ===================
// ACT DEFINITIONS
// ===================

export interface ActDefinition {
  id: number;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  theme: string;
  bossPool: string[];
  floorRange: { start: number; end: number };
  difficulty: number; // 1-5
  backgroundImage?: string;
}

export const ACTS: ActDefinition[] = [
  {
    id: 1,
    name: 'The Burning Depths',
    nameDE: 'Die Brennenden Tiefen',
    description: 'A volcanic cavern system filled with fire creatures.',
    descriptionDE: 'Ein vulkanisches Höhlensystem voller Feuerwesen.',
    theme: 'fire',
    bossPool: ['boss_flame_phoenix', 'boss_molten_giant', 'boss_fire_wyrm'],
    floorRange: { start: 1, end: 50 },
    difficulty: 1,
  },
  {
    id: 2,
    name: 'The Frozen Abyss',
    nameDE: 'Der Gefrorene Abgrund',
    description: 'Icy depths where ancient water spirits dwell.',
    descriptionDE: 'Eisige Tiefen, in denen uralte Wassergeister hausen.',
    theme: 'water',
    bossPool: ['boss_ice_queen', 'boss_kraken', 'boss_frost_titan'],
    floorRange: { start: 51, end: 100 },
    difficulty: 2,
  },
  {
    id: 3,
    name: 'The Living Caverns',
    nameDE: 'Die Lebenden Höhlen',
    description: 'Underground forests teeming with earth elementals.',
    descriptionDE: 'Unterirdische Wälder voller Erdelementare.',
    theme: 'earth',
    bossPool: ['boss_stone_golem', 'boss_crystal_hydra', 'boss_world_tree'],
    floorRange: { start: 101, end: 150 },
    difficulty: 3,
  },
  {
    id: 4,
    name: 'The Ethereal Peaks',
    nameDE: 'Die Ätherischen Gipfel',
    description: 'Floating islands in a realm of eternal wind.',
    descriptionDE: 'Schwebende Inseln in einem Reich des ewigen Windes.',
    theme: 'air',
    bossPool: ['boss_storm_lord', 'boss_thunder_dragon', 'boss_sky_serpent'],
    floorRange: { start: 151, end: 200 },
    difficulty: 4,
  },
  {
    id: 5,
    name: 'The Void Heart',
    nameDE: 'Das Herz der Leere',
    description: 'The center of all, where reality itself breaks down.',
    descriptionDE: 'Das Zentrum von allem, wo die Realität selbst zerbricht.',
    theme: 'void',
    bossPool: ['boss_void_emperor', 'boss_entropy_incarnate', 'boss_the_end'],
    floorRange: { start: 201, end: 250 },
    difficulty: 5,
  },
];

// ===================
// FLOOR TYPES
// ===================

export interface FloorDefinition {
  floor: number;
  act: number;
  nodeType: MapNodeType;
  difficulty: number;
  isBossFloor: boolean;
  isEliteFloor: boolean;
  isRestFloor: boolean;
  possibleEnemies: string[];
}

// ===================
// MAP GENERATION
// ===================

export function generateMap(actNumber: number, seed?: number): GameMap {
  // Use seed for deterministic generation
  const rng = seed !== undefined ? seededRandom(seed) : Math.random;
  
  const act = ACTS[actNumber - 1];
  if (!act) {
    throw new Error(`Invalid act number: ${actNumber}`);
  }
  
  const nodes: MapNode[] = [];
  const floorsInAct = MAP_CONFIG.floorsPerAct;
  
  // Track nodes per floor for connections
  const floorNodes: MapNode[][] = [];
  
  for (let floor = 0; floor < floorsInAct; floor++) {
    const globalFloor = act.floorRange.start + floor;
    const floorNodesArray: MapNode[] = [];
    
    // Determine floor position for weights
    const floorPosition = floor / floorsInAct;
    let weights = MAP_CONFIG.nodeTypeWeights.early;
    if (floorPosition > 0.7) weights = MAP_CONFIG.nodeTypeWeights.late;
    else if (floorPosition > 0.3) weights = MAP_CONFIG.nodeTypeWeights.mid;
    
    // Boss floor (every 50th floor = act boss)
    if (floor === floorsInAct - 1) {
      const bossNode: MapNode = {
        id: `node_${globalFloor}_0`,
        type: 'boss',
        x: 0.5,
        y: floor,
        connections: [],
        visited: false,
        icon: '💀',
      };
      floorNodesArray.push(bossNode);
      nodes.push(bossNode);
    }
    // Regular floor
    else {
      // Determine number of nodes on this floor
      const numNodes = Math.floor(rng() * (MAP_CONFIG.nodesPerFloor.max - MAP_CONFIG.nodesPerFloor.min + 1)) + MAP_CONFIG.nodesPerFloor.min;
      
      for (let nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
        // Determine node type
        let nodeType = rollNodeType(weights, rng);
        
        // Check for guaranteed nodes
        if (MAP_CONFIG.guaranteedNodes.shop.includes(floor + 1) && nodeIndex === 0) {
          nodeType = 'shop';
        } else if (MAP_CONFIG.guaranteedNodes.rest.includes(floor + 1) && nodeIndex === 0) {
          nodeType = 'rest';
        } else if (MAP_CONFIG.guaranteedNodes.elite.includes(floor + 1) && nodeIndex === 0) {
          nodeType = 'elite';
        } else if (MAP_CONFIG.guaranteedNodes.treasure.includes(floor + 1) && nodeIndex === 0) {
          nodeType = 'treasure';
        }
        
        // Calculate x position
        const xSpread = 0.8 / numNodes;
        const x = 0.1 + (nodeIndex * xSpread) + (xSpread / 2);
        
        const node: MapNode = {
          id: `node_${globalFloor}_${nodeIndex}`,
          type: nodeType,
          x,
          y: floor,
          connections: [],
          visited: false,
          icon: getNodeIcon(nodeType),
        };
        
        floorNodesArray.push(node);
        nodes.push(node);
      }
    }
    
    floorNodes.push(floorNodesArray);
  }
  
  // Create connections between floors
  for (let floor = 0; floor < floorsInAct - 1; floor++) {
    const currentFloorNodes = floorNodes[floor];
    const nextFloorNodes = floorNodes[floor + 1];
    
    for (const currentNode of currentFloorNodes) {
      // Each node connects to 1-2 nodes on the next floor
      const numConnections = Math.min(
        Math.floor(rng() * 2) + 1,
        nextFloorNodes.length
      );
      
      // Sort next floor nodes by distance to current node
      const sortedNextNodes = [...nextFloorNodes].sort(
        (a, b) => Math.abs(a.x - currentNode.x) - Math.abs(b.x - currentNode.x)
      );
      
      // Connect to closest nodes
      for (let i = 0; i < numConnections; i++) {
        const nextNode = sortedNextNodes[i];
        if (nextNode && !currentNode.connections.includes(nextNode.id)) {
          currentNode.connections.push(nextNode.id);
        }
      }
    }
    
    // Ensure all next floor nodes have at least one incoming connection
    for (const nextNode of nextFloorNodes) {
      const hasIncoming = currentFloorNodes.some(n => n.connections.includes(nextNode.id));
      if (!hasIncoming) {
        // Connect from closest current node
        const closestCurrent = [...currentFloorNodes].sort(
          (a, b) => Math.abs(a.x - nextNode.x) - Math.abs(b.x - nextNode.x)
        )[0];
        if (closestCurrent) {
          closestCurrent.connections.push(nextNode.id);
        }
      }
    }
  }
  
  return {
    nodes,
    currentNodeId: null,
    actNumber: actNumber as 1 | 2 | 3,
  };
}

function rollNodeType(weights: Record<string, number>, rng: () => number): MapNodeType {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let roll = rng() * total;
  
  for (const [type, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) {
      return type as MapNodeType;
    }
  }
  
  return 'combat';
}

function getNodeIcon(type: MapNodeType): string {
  const icons: Record<MapNodeType, string> = {
    combat: '⚔️',
    elite: '👹',
    event: '❓',
    shop: '🛒',
    treasure: '💎',
    rest: '🔥',
    boss: '💀',
  };
  return icons[type] || '❓';
}

// ===================
// FLOOR GENERATION HELPERS
// ===================

export function getFloorInfo(globalFloor: number): FloorDefinition {
  const act = Math.ceil(globalFloor / MAP_CONFIG.floorsPerAct);
  const floorInAct = ((globalFloor - 1) % MAP_CONFIG.floorsPerAct) + 1;
  const actDef = ACTS[act - 1];
  
  const isBossFloor = floorInAct === MAP_CONFIG.floorsPerAct;
  const isEliteFloor = MAP_CONFIG.guaranteedNodes.elite.includes(floorInAct);
  const isRestFloor = MAP_CONFIG.guaranteedNodes.rest.includes(floorInAct);
  
  // Base difficulty scales with act and floor
  const difficulty = act + Math.floor(floorInAct / 10);
  
  return {
    floor: globalFloor,
    act,
    nodeType: isBossFloor ? 'boss' : isEliteFloor ? 'elite' : 'combat',
    difficulty,
    isBossFloor,
    isEliteFloor,
    isRestFloor,
    possibleEnemies: getEnemyPoolForFloor(act, difficulty, isEliteFloor),
  };
}

function getEnemyPoolForFloor(act: number, difficulty: number, isElite: boolean): string[] {
  // Return enemy IDs based on act theme and difficulty
  const actThemes: Record<number, string> = {
    1: 'fire',
    2: 'water',
    3: 'earth',
    4: 'air',
    5: 'void',
  };
  
  const theme = actThemes[act] || 'fire';
  
  if (isElite) {
    return [`elite_${theme}_1`, `elite_${theme}_2`, `elite_${theme}_3`];
  }
  
  // Regular enemies based on difficulty
  const baseEnemies = [
    `${theme}_minion`,
    `${theme}_soldier`,
    `${theme}_mage`,
  ];
  
  if (difficulty > 3) {
    baseEnemies.push(`${theme}_champion`);
  }
  
  return baseEnemies;
}

// ===================
// SEEDED RANDOM
// ===================

function seededRandom(seed: number): () => number {
  let state = seed;
  
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ===================
// MAP NAVIGATION
// ===================

export function getAvailableNodes(map: GameMap): MapNode[] {
  if (!map.currentNodeId) {
    // Start of act - return first floor nodes
    return map.nodes.filter(n => n.y === 0);
  }
  
  const currentNode = map.nodes.find(n => n.id === map.currentNodeId);
  if (!currentNode) return [];
  
  // Return connected nodes
  return map.nodes.filter(n => currentNode.connections.includes(n.id));
}

export function visitNode(map: GameMap, nodeId: string): GameMap {
  const node = map.nodes.find(n => n.id === nodeId);
  if (!node) return map;
  
  node.visited = true;
  
  return {
    ...map,
    currentNodeId: nodeId,
  };
}

export function isActComplete(map: GameMap): boolean {
  const currentNode = map.nodes.find(n => n.id === map.currentNodeId);
  return currentNode?.type === 'boss' && currentNode.visited;
}

export function getMapProgress(map: GameMap): { current: number; total: number; percent: number } {
  const visited = map.nodes.filter(n => n.visited).length;
  const total = map.nodes.length;
  return {
    current: visited,
    total,
    percent: Math.round((visited / total) * 100),
  };
}

// ===================
// ASCENSION MODIFIERS
// ===================

export interface AscensionModifier {
  level: number;
  name: string;
  nameDE: string;
  description: string;
  descriptionDE: string;
  effects: {
    enemyHpMultiplier?: number;
    enemyDamageMultiplier?: number;
    eliteChanceBonus?: number;
    shopPriceMultiplier?: number;
    healingReduction?: number;
    startingHpReduction?: number;
    bossHpMultiplier?: number;
  };
}

export const ASCENSION_MODIFIERS: AscensionModifier[] = Array.from({ length: 20 }, (_, i) => ({
  level: i + 1,
  name: `Ascension ${i + 1}`,
  nameDE: `Aufstieg ${i + 1}`,
  description: getAscensionDescription(i + 1, 'en'),
  descriptionDE: getAscensionDescription(i + 1, 'de'),
  effects: getAscensionEffects(i + 1),
}));

function getAscensionDescription(level: number, lang: 'en' | 'de'): string {
  const descriptions: Record<number, Record<string, string>> = {
    1: { en: 'Elites have +10% HP', de: 'Elites haben +10% LP' },
    2: { en: 'Normal enemies have +5% HP', de: 'Normale Gegner haben +5% LP' },
    3: { en: 'Elites deal +5% damage', de: 'Elites verursachen +5% Schaden' },
    4: { en: 'More elites spawn', de: 'Mehr Elites erscheinen' },
    5: { en: 'Bosses have +10% HP', de: 'Bosse haben +10% LP' },
    6: { en: 'Start with -5 Max HP', de: 'Starte mit -5 Max LP' },
    7: { en: 'Rest sites heal 25% less', de: 'Raststätten heilen 25% weniger' },
    8: { en: 'Shop prices +10%', de: 'Shoppreise +10%' },
    9: { en: 'All enemies deal +5% damage', de: 'Alle Gegner verursachen +5% Schaden' },
    10: { en: 'Start with -10 Max HP', de: 'Starte mit -10 Max LP' },
    11: { en: 'Elites have +20% HP', de: 'Elites haben +20% LP' },
    12: { en: 'Normal enemies have +10% HP', de: 'Normale Gegner haben +10% LP' },
    13: { en: 'Bosses deal +10% damage', de: 'Bosse verursachen +10% Schaden' },
    14: { en: 'Even more elites spawn', de: 'Noch mehr Elites erscheinen' },
    15: { en: 'Bosses have +20% HP', de: 'Bosse haben +20% LP' },
    16: { en: 'Start with -15 Max HP', de: 'Starte mit -15 Max LP' },
    17: { en: 'Rest sites heal 50% less', de: 'Raststätten heilen 50% weniger' },
    18: { en: 'Shop prices +25%', de: 'Shoppreise +25%' },
    19: { en: 'All enemies deal +10% damage', de: 'Alle Gegner verursachen +10% Schaden' },
    20: { en: 'The ultimate challenge', de: 'Die ultimative Herausforderung' },
  };
  
  return descriptions[level]?.[lang] || `Level ${level}`;
}

function getAscensionEffects(level: number): AscensionModifier['effects'] {
  const effects: AscensionModifier['effects'] = {};
  
  // Cumulative effects
  if (level >= 1) effects.enemyHpMultiplier = 1.1;
  if (level >= 2) effects.enemyHpMultiplier = (effects.enemyHpMultiplier || 1) * 1.05;
  if (level >= 3) effects.enemyDamageMultiplier = 1.05;
  if (level >= 4) effects.eliteChanceBonus = 0.1;
  if (level >= 5) effects.bossHpMultiplier = 1.1;
  if (level >= 6) effects.startingHpReduction = 5;
  if (level >= 7) effects.healingReduction = 0.25;
  if (level >= 8) effects.shopPriceMultiplier = 1.1;
  if (level >= 9) effects.enemyDamageMultiplier = (effects.enemyDamageMultiplier || 1) * 1.05;
  if (level >= 10) effects.startingHpReduction = 10;
  if (level >= 11) effects.enemyHpMultiplier = (effects.enemyHpMultiplier || 1) * 1.1;
  if (level >= 12) effects.enemyHpMultiplier = (effects.enemyHpMultiplier || 1) * 1.05;
  if (level >= 13) effects.bossHpMultiplier = (effects.bossHpMultiplier || 1) * 1.1;
  if (level >= 14) effects.eliteChanceBonus = 0.2;
  if (level >= 15) effects.bossHpMultiplier = (effects.bossHpMultiplier || 1) * 1.1;
  if (level >= 16) effects.startingHpReduction = 15;
  if (level >= 17) effects.healingReduction = 0.5;
  if (level >= 18) effects.shopPriceMultiplier = 1.25;
  if (level >= 19) effects.enemyDamageMultiplier = (effects.enemyDamageMultiplier || 1) * 1.1;
  if (level >= 20) {
    effects.enemyHpMultiplier = (effects.enemyHpMultiplier || 1) * 1.2;
    effects.enemyDamageMultiplier = (effects.enemyDamageMultiplier || 1) * 1.2;
  }
  
  return effects;
}

// Export
export default {
  MAP_CONFIG,
  ACTS,
  ASCENSION_MODIFIERS,
  generateMap,
  getFloorInfo,
  getAvailableNodes,
  visitNode,
  isActComplete,
  getMapProgress,
};
