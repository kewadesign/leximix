// ============================================
// KARTENSCHMIEDE - Main Game Component
// ============================================
// Roguelike Deckbuilder with 250 floors, 200+ cards, and strategic combat

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Swords, Package, ShoppingBag, Coffee, HelpCircle, Flame, Droplets, Mountain, Wind, Moon, Trophy, Zap, Heart, Shield, Coins, Star, Play, RotateCcw, BookOpen, X, Target, Layers, Gift, Skull } from 'lucide-react';

// Types
import { 
  DeckbuilderRun, 
  DeckbuilderCard, 
  CombatState, 
  GameMap, 
  MapNode,
  Enemy,
  CardElement
} from '../utils/deckbuilder/types';

// Game Logic
import { 
  generateMap, 
  getAvailableNodes, 
  visitNode, 
  ACTS,
  getFloorInfo 
} from '../utils/deckbuilder/mapGeneration';
import { 
  initializeCombat, 
  startPlayerTurn, 
  endPlayerTurn, 
  executeEnemyTurn, 
  playCard, 
  canPlayCard,
  isCombatOver,
  calculateCombatRewards
} from '../utils/deckbuilder/combat';
import { 
  getStarterDeck, 
  getRandomCard, 
  ALL_CARDS 
} from '../utils/deckbuilder/cards';
import { 
  getRandomEnemy, 
  getRandomBoss, 
  scaleEnemyForFloor 
} from '../utils/deckbuilder/enemies';

// Sub-Components
import { DeckbuilderMapView } from './deckbuilder/DeckbuilderMapView';
import { DeckbuilderCombatView } from './deckbuilder/DeckbuilderCombatView';
import { PlayerStatus } from './deckbuilder/PlayerStatus';
import { RewardScreen } from './deckbuilder/RewardScreen';

// Audio
import { audio } from '../utils/audio';

// Shop Item Types
interface ShopItem {
  id: string;
  type: 'card' | 'potion' | 'remove' | 'upgrade';
  card?: DeckbuilderCard;
  name: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
}

// Generate shop items based on floor
const generateShopItems = (floor: number, element: CardElement): ShopItem[] => {
  const items: ShopItem[] = [];
  const baseCost = 50 + Math.floor(floor / 10) * 10;
  
  // 3 Random Cards for sale
  const availableCards = ALL_CARDS.filter(c => 
    c.element === element || c.element === 'colorless' || Math.random() < 0.3
  );
  
  for (let i = 0; i < 3; i++) {
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    if (card) {
      const rarityMultiplier = card.rarity === 'common' ? 1 : card.rarity === 'uncommon' ? 1.5 : card.rarity === 'rare' ? 2.5 : 4;
      items.push({
        id: `card-${i}-${card.id}`,
        type: 'card',
        card: { ...card },
        name: card.name,
        description: card.description,
        cost: Math.floor(baseCost * rarityMultiplier),
        icon: <Swords className="w-5 h-5" />
      });
    }
  }
  
  // Health Potion
  items.push({
    id: 'potion-heal',
    type: 'potion',
    name: 'Heiltrank',
    description: 'Heilt 30% deiner max. HP',
    cost: baseCost,
    icon: <Heart className="w-5 h-5" />
  });
  
  // Max HP Upgrade
  items.push({
    id: 'potion-maxhp',
    type: 'potion',
    name: 'Lebensessenz',
    description: '+10 Max HP permanent',
    cost: Math.floor(baseCost * 1.5),
    icon: <Heart className="w-5 h-5" />
  });
  
  // Remove Card
  items.push({
    id: 'remove-card',
    type: 'remove',
    name: 'Karte entfernen',
    description: 'Entferne eine Karte aus deinem Deck',
    cost: Math.floor(baseCost * 0.75),
    icon: <Package className="w-5 h-5" />
  });
  
  return items;
};

// ============================================
// TYPES
// ============================================

type GameView = 'menu' | 'element_select' | 'map' | 'combat' | 'reward' | 'shop' | 'event' | 'rest' | 'game_over' | 'victory';

interface DeckbuilderGameProps {
  onBack: () => void;
  onGameEnd?: (coins: number, xp: number) => void;
  language?: 'EN' | 'DE' | 'ES';
}

// ============================================
// ELEMENT SELECTION
// ============================================

const ELEMENT_INFO: Record<CardElement, { name: string; nameDE: string; icon: React.ReactNode; color: string; description: string; descriptionDE: string }> = {
  fire: {
    name: 'Fire',
    nameDE: 'Feuer',
    icon: <Flame className="w-8 h-8" />,
    color: '#FF006E',
    description: 'Aggressive attacks and burn damage',
    descriptionDE: 'Aggressive Angriffe und Brandschaden'
  },
  water: {
    name: 'Water',
    nameDE: 'Wasser',
    icon: <Droplets className="w-8 h-8" />,
    color: '#0096FF',
    description: 'Defense, healing, and debuffs',
    descriptionDE: 'Verteidigung, Heilung und Schwächungen'
  },
  earth: {
    name: 'Earth',
    nameDE: 'Erde',
    icon: <Mountain className="w-8 h-8" />,
    color: '#228B22',
    description: 'High defense and thorns',
    descriptionDE: 'Hohe Verteidigung und Dornen'
  },
  air: {
    name: 'Air',
    nameDE: 'Luft',
    icon: <Wind className="w-8 h-8" />,
    color: '#87CEEB',
    description: 'Card draw and combos',
    descriptionDE: 'Karten ziehen und Kombos'
  },
  void: {
    name: 'Void',
    nameDE: 'Leere',
    icon: <Moon className="w-8 h-8" />,
    color: '#8B008B',
    description: 'Risk/reward and exhaust synergy',
    descriptionDE: 'Risiko/Belohnung und Erschöpfungs-Synergie'
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export const DeckbuilderGame: React.FC<DeckbuilderGameProps> = ({ 
  onBack, 
  onGameEnd,
  language = 'DE' 
}) => {
  // Game State
  const [view, setView] = useState<GameView>('menu');
  const [run, setRun] = useState<DeckbuilderRun | null>(null);
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [currentEnemies, setCurrentEnemies] = useState<Enemy[]>([]);
  const [pendingRewards, setPendingRewards] = useState<{ gold: number; cardChoices: DeckbuilderCard[]; relicChance: number } | null>(null);
  const [selectedElement, setSelectedElement] = useState<CardElement>('fire');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  
  // Shop State
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [showRemoveCardModal, setShowRemoveCardModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Stats for scoring
  const [runStats, setRunStats] = useState({
    enemiesKilled: 0,
    elitesKilled: 0,
    bossesKilled: 0,
    perfectFloors: 0,
    goldCollected: 0,
    cardsPlayed: 0,
    startTime: 0
  });

  const isDE = language === 'DE';

  // ============================================
  // GAME INITIALIZATION
  // ============================================

  const startNewRun = (element: CardElement) => {
    const deck = getStarterDeck(element);
    const map = generateMap(1, Date.now());
    
    const newRun: DeckbuilderRun = {
      id: `run_${Date.now()}`,
      seed: Date.now(),
      startedAt: Date.now(),
      currentAct: 1,
      currentFloor: 1,
      player: {
        hp: 80,
        maxHp: 80,
        gold: 100
      },
      deck,
      relics: [],
      map,
      score: 0,
      isDaily: false
    };

    setRun(newRun);
    setRunStats({
      enemiesKilled: 0,
      elitesKilled: 0,
      bossesKilled: 0,
      perfectFloors: 0,
      goldCollected: 100,
      cardsPlayed: 0,
      startTime: Date.now()
    });
    setView('map');
    setMessage(isDE ? 'Wähle deinen Pfad!' : 'Choose your path!');
  };

  // ============================================
  // MAP NAVIGATION
  // ============================================

  const handleNodeSelect = (nodeId: string) => {
    console.log('[Game] handleNodeSelect called:', nodeId);
    if (!run) {
      console.log('[Game] No run active');
      return;
    }
    if (isProcessing) {
      console.log('[Game] Processing, ignoring click');
      return;
    }

    const node = run.map.nodes.find(n => n.id === nodeId);
    if (!node) {
      console.log('[Game] Node not found:', nodeId);
      return;
    }

    console.log('[Game] Node found:', node.type, 'at floor', node.y);

    // Update map
    const updatedMap = visitNode(run.map, nodeId);
    setRun(prev => prev ? { ...prev, map: updatedMap, currentFloor: node.y + 1 } : null);

    // Handle node type
    switch (node.type) {
      case 'combat':
        startCombat(false, false);
        break;
      case 'elite':
        startCombat(true, false);
        break;
      case 'boss':
        startCombat(false, true);
        break;
      case 'rest':
        handleRest();
        break;
      case 'shop':
        audio.playOpen();
        const items = generateShopItems(run.currentFloor, selectedElement);
        setShopItems(items);
        setView('shop');
        break;
      case 'treasure':
        handleTreasure();
        break;
      case 'event':
        handleEvent();
        break;
    }
  };

  // ============================================
  // COMBAT
  // ============================================

  const startCombat = (isElite: boolean, isBoss: boolean) => {
    if (!run) return;

    const actNumber = run.currentAct as 1 | 2 | 3;
    let enemies: Enemy[];

    if (isBoss) {
      const boss = getRandomBoss(actNumber);
      enemies = [scaleEnemyForFloor(boss, run.currentFloor)];
    } else if (isElite) {
      const elite = getRandomEnemy(actNumber, true);
      enemies = [scaleEnemyForFloor(elite, run.currentFloor)];
    } else {
      // 1-3 regular enemies
      const numEnemies = 1 + Math.floor(Math.random() * 2);
      enemies = [];
      for (let i = 0; i < numEnemies; i++) {
        const enemy = getRandomEnemy(actNumber, false);
        enemies.push(scaleEnemyForFloor(enemy, run.currentFloor));
      }
    }

    setCurrentEnemies(enemies);
    const combat = initializeCombat(run.deck, enemies, run.player.hp, 3);
    setCombatState(combat);
    setView('combat');
    setMessage(isDE ? 'Kampf beginnt!' : 'Combat begins!');
  };

  const handlePlayCard = (cardIndex: number, targetIndex: number = 0) => {
    if (!combatState || isProcessing) return;

    if (!canPlayCard(combatState, cardIndex)) {
      setMessage(isDE ? 'Nicht genug Energie!' : 'Not enough energy!');
      return;
    }

    setIsProcessing(true);
    const newState = playCard(combatState, cardIndex, targetIndex);
    setCombatState(newState);
    setRunStats(prev => ({ ...prev, cardsPlayed: prev.cardsPlayed + 1 }));

    // Check combat end
    const { over, playerWon } = isCombatOver(newState);
    if (over) {
      handleCombatEnd(playerWon, newState);
    }

    setIsProcessing(false);
  };

  const handleEndTurn = () => {
    if (!combatState || isProcessing) return;

    setIsProcessing(true);
    
    // End player turn
    let newState = endPlayerTurn(combatState);
    setCombatState(newState);

    // Execute enemy turn with delay
    setTimeout(() => {
      newState = executeEnemyTurn(newState);
      setCombatState(newState);

      // Check combat end
      const { over, playerWon } = isCombatOver(newState);
      if (over) {
        handleCombatEnd(playerWon, newState);
      } else {
        // Start new player turn
        newState = startPlayerTurn(newState);
        setCombatState(newState);
      }

      setIsProcessing(false);
    }, 1000);
  };

  const handleCombatEnd = (playerWon: boolean, finalState: CombatState) => {
    if (!run) return;

    if (playerWon) {
      // Check if it was elite or boss
      const currentNode = run.map.nodes.find(n => n.id === run.map.currentNodeId);
      const isElite = currentNode?.type === 'elite';
      const isBoss = currentNode?.type === 'boss';

      // Update stats
      const killedCount = currentEnemies.length;
      setRunStats(prev => ({
        ...prev,
        enemiesKilled: prev.enemiesKilled + killedCount,
        elitesKilled: prev.elitesKilled + (isElite ? 1 : 0),
        bossesKilled: prev.bossesKilled + (isBoss ? 1 : 0),
        perfectFloors: prev.perfectFloors + (finalState.player.currentHp === run.player.hp ? 1 : 0)
      }));

      // Calculate rewards
      const rewards = calculateCombatRewards(finalState, run.currentFloor, isElite, isBoss);
      
      // Generate card choices
      const cardChoices: DeckbuilderCard[] = [];
      for (let i = 0; i < rewards.cardChoices; i++) {
        cardChoices.push(getRandomCard());
      }

      setPendingRewards({
        gold: rewards.gold,
        cardChoices,
        relicChance: rewards.relicChance
      });

      // Update player HP
      setRun(prev => prev ? {
        ...prev,
        player: {
          ...prev.player,
          hp: finalState.player.currentHp
        }
      } : null);

      // Check for act completion
      if (isBoss && run.currentAct < 5) {
        // Move to next act
        setTimeout(() => {
          const nextAct = (run.currentAct + 1) as 1 | 2 | 3;
          const newMap = generateMap(nextAct, run.seed + nextAct);
          setRun(prev => prev ? {
            ...prev,
            currentAct: nextAct,
            currentFloor: 1,
            map: newMap
          } : null);
        }, 500);
      } else if (isBoss && run.currentAct === 5) {
        // Game won!
        setView('victory');
        return;
      }

      setView('reward');
      setMessage(isDE ? 'Sieg!' : 'Victory!');
    } else {
      // Player died
      setView('game_over');
      setMessage(isDE ? 'Du wurdest besiegt...' : 'You have been defeated...');
    }
  };

  // ============================================
  // OTHER NODE HANDLERS
  // ============================================

  const handleRest = () => {
    if (!run) return;

    const healAmount = Math.floor(run.player.maxHp * 0.3);
    setRun(prev => prev ? {
      ...prev,
      player: {
        ...prev.player,
        hp: Math.min(prev.player.hp + healAmount, prev.player.maxHp)
      }
    } : null);

    setMessage(isDE ? `Du heilst ${healAmount} LP!` : `You heal ${healAmount} HP!`);
    setTimeout(() => setView('map'), 1500);
  };

  const handleTreasure = () => {
    if (!run) return;

    const goldGain = 50 + Math.floor(Math.random() * 50);
    setRun(prev => prev ? {
      ...prev,
      player: {
        ...prev.player,
        gold: prev.player.gold + goldGain
      }
    } : null);

    setRunStats(prev => ({ ...prev, goldCollected: prev.goldCollected + goldGain }));
    setMessage(isDE ? `Du findest ${goldGain} Gold!` : `You find ${goldGain} gold!`);
    setTimeout(() => setView('map'), 1500);
  };

  const handleEvent = () => {
    // Simplified event - random outcome
    if (!run) return;

    const outcomes = [
      { type: 'gold', value: 30 + Math.floor(Math.random() * 40) },
      { type: 'heal', value: 15 },
      { type: 'card', value: 1 },
      { type: 'damage', value: 10 }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    switch (outcome.type) {
      case 'gold':
        setRun(prev => prev ? {
          ...prev,
          player: { ...prev.player, gold: prev.player.gold + outcome.value }
        } : null);
        setMessage(isDE ? `Du findest ${outcome.value} Gold!` : `You find ${outcome.value} gold!`);
        break;
      case 'heal':
        setRun(prev => prev ? {
          ...prev,
          player: { ...prev.player, hp: Math.min(prev.player.hp + outcome.value, prev.player.maxHp) }
        } : null);
        setMessage(isDE ? `Du heilst ${outcome.value} LP!` : `You heal ${outcome.value} HP!`);
        break;
      case 'card':
        const newCard = getRandomCard('uncommon');
        setRun(prev => prev ? {
          ...prev,
          deck: [...prev.deck, newCard]
        } : null);
        setMessage(isDE ? `Du erhältst ${newCard.nameDE}!` : `You gain ${newCard.name}!`);
        break;
      case 'damage':
        setRun(prev => prev ? {
          ...prev,
          player: { ...prev.player, hp: prev.player.hp - outcome.value }
        } : null);
        setMessage(isDE ? `Du nimmst ${outcome.value} Schaden!` : `You take ${outcome.value} damage!`);
        break;
    }

    setTimeout(() => setView('map'), 2000);
  };

  // ============================================
  // REWARD HANDLING
  // ============================================

  const handleRewardCardSelect = (card: DeckbuilderCard) => {
    if (!run || !pendingRewards) return;

    setRun(prev => prev ? {
      ...prev,
      deck: [...prev.deck, card],
      player: {
        ...prev.player,
        gold: prev.player.gold + pendingRewards.gold
      }
    } : null);

    setRunStats(prev => ({ ...prev, goldCollected: prev.goldCollected + pendingRewards.gold }));
    setPendingRewards(null);
    setView('map');
  };

  const handleSkipReward = () => {
    if (!run || !pendingRewards) return;

    setRun(prev => prev ? {
      ...prev,
      player: {
        ...prev.player,
        gold: prev.player.gold + pendingRewards.gold
      }
    } : null);

    setRunStats(prev => ({ ...prev, goldCollected: prev.goldCollected + pendingRewards.gold }));
    setPendingRewards(null);
    setView('map');
  };

  // ============================================
  // RENDER
  // ============================================

  const renderMenu = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col p-4"
      style={{ background: 'var(--color-bg, #0a0a0a)' }}
    >
      {/* Rainbow Top Bar */}
      <div className="flex h-3 w-full mb-6">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-8 p-6 text-center"
        style={{ 
          background: '#FF006E',
          border: '4px solid #000',
          boxShadow: '8px 8px 0 #000',
          transform: 'skew(-2deg)'
        }}
      >
        <h1 
          className="text-4xl md:text-5xl font-black text-black uppercase tracking-tight"
          style={{ transform: 'skew(2deg)' }}
        >
          {isDE ? 'KARTENSCHMIEDE' : 'CARD FORGE'}
        </h1>
        <p 
          className="text-black/70 font-bold mt-2 uppercase tracking-widest text-sm"
          style={{ transform: 'skew(2deg)' }}
        >
          Roguelike Deckbuilder
        </p>
      </motion.div>

      {/* Main Buttons */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-5">
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            audio.playClick();
            setView('element_select');
          }}
          onMouseEnter={() => audio.playHover()}
          className="w-full py-6 px-8 font-black text-2xl uppercase flex items-center justify-center gap-4"
          style={{
            background: '#06FFA5',
            border: '5px solid #000',
            boxShadow: '8px 8px 0 #000',
            color: '#000',
            transform: 'skew(-2deg)'
          }}
        >
          <Play className="w-8 h-8" style={{ transform: 'skew(2deg)' }} />
          <span style={{ transform: 'skew(2deg)' }}>{isDE ? 'Neuer Durchlauf' : 'New Run'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            audio.playClick();
            setShowTutorial(true);
          }}
          onMouseEnter={() => audio.playHover()}
          className="w-full py-5 px-6 font-black text-xl uppercase flex items-center justify-center gap-3"
          style={{
            background: '#FFBE0B',
            border: '4px solid #000',
            boxShadow: '6px 6px 0 #000',
            color: '#000',
            transform: 'skew(-2deg)'
          }}
        >
          <BookOpen className="w-7 h-7" style={{ transform: 'skew(2deg)' }} />
          <span style={{ transform: 'skew(2deg)' }}>{isDE ? 'Anleitung' : 'How to Play'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            audio.playClose();
            onBack();
          }}
          onMouseEnter={() => audio.playHover()}
          className="w-full py-4 px-6 font-black text-lg uppercase flex items-center justify-center gap-3"
          style={{
            background: 'var(--color-surface, #1a1a1a)',
            border: '4px solid #000',
            boxShadow: '5px 5px 0 #000',
            color: 'var(--color-text, #fff)'
          }}
        >
          <ArrowLeft className="w-6 h-6" />
          {isDE ? 'Zurück' : 'Back'}
        </motion.button>
      </div>

      {/* Stats Cards - Neo Brutalist */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3 mt-8 max-w-lg mx-auto w-full"
      >
        <div 
          className="p-4 text-center"
          style={{ 
            background: '#FF006E', 
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}
        >
          <div className="text-3xl font-black text-black">250</div>
          <div className="text-xs font-bold text-black/70 uppercase">Floors</div>
        </div>
        <div 
          className="p-4 text-center"
          style={{ 
            background: '#8338EC', 
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}
        >
          <div className="text-3xl font-black text-white">200+</div>
          <div className="text-xs font-bold text-white/70 uppercase">{isDE ? 'Karten' : 'Cards'}</div>
        </div>
        <div 
          className="p-4 text-center"
          style={{ 
            background: '#FFBE0B', 
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}
        >
          <div className="text-3xl font-black text-black">70</div>
          <div className="text-xs font-bold text-black/70 uppercase">{isDE ? 'Gegner' : 'Enemies'}</div>
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-16 h-16 opacity-20" style={{ background: '#FF006E', border: '3px solid #000', transform: 'rotate(12deg)' }}></div>
      <div className="absolute bottom-32 left-8 w-12 h-12 opacity-20" style={{ background: '#06FFA5', border: '3px solid #000', transform: 'rotate(-8deg)' }}></div>
    </motion.div>
  );

  const renderElementSelect = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col p-4"
      style={{ background: 'var(--color-bg, #0a0a0a)' }}
    >
      {/* Rainbow Top Bar */}
      <div className="flex h-3 w-full mb-4">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            audio.playClose();
            setView('menu');
          }}
          onMouseEnter={() => audio.playHover()}
          className="p-3"
          style={{ 
            background: '#FF006E', 
            border: '4px solid #000',
            boxShadow: '4px 4px 0 #000'
          }}
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </motion.button>
        <div 
          className="px-6 py-3"
          style={{
            background: '#FFBE0B',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 #000',
            transform: 'skew(-2deg)'
          }}
        >
          <h2 
            className="text-xl font-black text-black uppercase"
            style={{ transform: 'skew(2deg)' }}
          >
            {isDE ? 'Wähle dein Element' : 'Choose Element'}
          </h2>
        </div>
      </div>

      {/* Element Cards - Bigger and Bolder */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
        {(Object.entries(ELEMENT_INFO) as [CardElement, typeof ELEMENT_INFO['fire']][])
          .filter(([key]) => key !== 'void')
          .map(([element, info], idx) => (
          <motion.button
            key={element}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              audio.playSelect();
              setSelectedElement(element);
              startNewRun(element);
            }}
            onMouseEnter={() => audio.playHover()}
            className="p-6 text-left relative overflow-hidden"
            style={{
              background: info.color,
              border: '5px solid #000',
              boxShadow: '8px 8px 0 #000',
              transform: 'skew(-1deg)'
            }}
          >
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)`
              }}
            />
            
            <div className="relative flex items-start gap-4" style={{ transform: 'skew(1deg)' }}>
              <div 
                className="p-4 shrink-0"
                style={{ 
                  background: '#000',
                  border: '3px solid #000',
                  boxShadow: '3px 3px 0 rgba(255,255,255,0.3)'
                }}
              >
                {React.cloneElement(info.icon as React.ReactElement, { 
                  className: 'w-10 h-10',
                  style: { color: info.color }
                })}
              </div>
              <div>
                <h3 className="text-2xl font-black text-black mb-2 uppercase">
                  {isDE ? info.nameDE : info.name}
                </h3>
                <p className="text-sm text-black/80 font-bold">
                  {isDE ? info.descriptionDE : info.description}
                </p>
              </div>
            </div>

            {/* Play indicator */}
            <div className="absolute bottom-3 right-3" style={{ transform: 'skew(1deg)' }}>
              <Play className="w-8 h-8 text-black/50" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  const renderGameOver = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">💀</div>
        <h1 className="text-4xl font-black text-red-500 mb-2">
          {isDE ? 'GAME OVER' : 'GAME OVER'}
        </h1>
        <p className="text-gray-400 mb-6">
          {isDE ? `Floor ${run?.currentFloor || 1} erreicht` : `Reached Floor ${run?.currentFloor || 1}`}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
          <div className="p-3 bg-gray-800 rounded">
            <div className="text-xl font-bold text-white">{runStats.enemiesKilled}</div>
            <div className="text-xs text-gray-400">{isDE ? 'Gegner' : 'Enemies'}</div>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <div className="text-xl font-bold text-yellow-400">{runStats.goldCollected}</div>
            <div className="text-xs text-gray-400">Gold</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setView('menu')}
            className="py-3 px-6 font-bold uppercase"
            style={{
              background: '#8B5CF6',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000',
              color: '#FFF'
            }}
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            {isDE ? 'Nochmal' : 'Try Again'}
          </button>
          <button
            onClick={onBack}
            className="py-3 px-6 font-bold uppercase"
            style={{
              background: '#374151',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #000',
              color: '#FFF'
            }}
          >
            {isDE ? 'Beenden' : 'Quit'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderVictory = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-black text-yellow-400 mb-2">
          {isDE ? 'SIEG!' : 'VICTORY!'}
        </h1>
        <p className="text-gray-400 mb-6">
          {isDE ? 'Du hast alle 5 Akte gemeistert!' : 'You conquered all 5 acts!'}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-md mx-auto">
          <div className="p-3 bg-gray-800 rounded">
            <div className="text-xl font-bold text-white">{runStats.bossesKilled}</div>
            <div className="text-xs text-gray-400">{isDE ? 'Bosse' : 'Bosses'}</div>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <div className="text-xl font-bold text-white">{runStats.cardsPlayed}</div>
            <div className="text-xs text-gray-400">{isDE ? 'Karten' : 'Cards'}</div>
          </div>
          <div className="p-3 bg-gray-800 rounded">
            <div className="text-xl font-bold text-yellow-400">{runStats.goldCollected}</div>
            <div className="text-xs text-gray-400">Gold</div>
          </div>
        </div>

        <button
          onClick={() => {
            onGameEnd?.(500, 250);
            onBack();
          }}
          className="py-4 px-8 font-black text-xl uppercase"
          style={{
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: '4px solid #000',
            boxShadow: '6px 6px 0 #000',
            color: '#000'
          }}
        >
          <Trophy className="w-6 h-6 inline mr-2" />
          {isDE ? 'Belohnung Sammeln' : 'Claim Rewards'}
        </button>
      </motion.div>
    </motion.div>
  );

  // Message toast
  const renderMessage = () => (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 font-bold"
          style={{
            background: '#8B5CF6',
            border: '3px solid #000',
            boxShadow: '4px 4px 0 #000',
            color: '#FFF'
          }}
          onAnimationComplete={() => {
            setTimeout(() => setMessage(''), 2000);
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="h-screen overflow-hidden" style={{ minHeight: '100vh', maxHeight: '100vh' }}>
      {renderMessage()}
      
      {view === 'menu' && renderMenu()}
      {view === 'element_select' && renderElementSelect()}
      {view === 'game_over' && renderGameOver()}
      {view === 'victory' && renderVictory()}
      
      {view === 'map' && run && (
        <DeckbuilderMapView
          map={run.map}
          currentFloor={run.currentFloor}
          currentAct={run.currentAct}
          playerHp={run.player.hp}
          playerMaxHp={run.player.maxHp}
          playerGold={run.player.gold}
          deckSize={run.deck.length}
          onNodeSelect={handleNodeSelect}
          onBack={() => setView('menu')}
          language={language}
        />
      )}

      {view === 'combat' && combatState && run && (
        <DeckbuilderCombatView
          combatState={combatState}
          enemies={currentEnemies}
          currentFloor={run.currentFloor}
          currentAct={run.currentAct}
          onPlayCard={handlePlayCard}
          onEndTurn={handleEndTurn}
          isProcessing={isProcessing}
          language={language}
        />
      )}

      {view === 'reward' && pendingRewards && (
        <RewardScreen
          gold={pendingRewards.gold}
          cardChoices={pendingRewards.cardChoices}
          onCardSelect={handleRewardCardSelect}
          onSkip={handleSkipReward}
          language={language}
        />
      )}

      {view === 'shop' && run && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col p-4"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
        >
          {/* Shop Header */}
          <div 
            className="text-center mb-6 p-4"
            style={{
              background: '#FBBF24',
              border: '4px solid #000',
              boxShadow: '6px 6px 0 #000'
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <ShoppingBag className="w-8 h-8 text-black" />
              <h2 className="text-2xl font-black text-black uppercase">
                {isDE ? 'Händler' : 'Merchant'}
              </h2>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Coins className="w-5 h-5 text-black" />
              <span className="font-black text-black text-xl">{run.player.gold}</span>
              <span className="text-black/70 font-bold">Gold</span>
            </div>
          </div>

          {/* Shop Items Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {shopItems.map((item, idx) => {
                const canAfford = run.player.gold >= item.cost;
                const isHovered = hoveredItem === item.id;
                const rarityColor = item.card?.rarity === 'rare' ? '#FFD700' : 
                                   item.card?.rarity === 'uncommon' ? '#8B5CF6' : 
                                   item.type === 'potion' ? '#EF4444' : '#06FFA5';
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onMouseEnter={() => {
                      setHoveredItem(item.id);
                      audio.playHover();
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => {
                      if (!canAfford) {
                        audio.playError();
                        setMessage(isDE ? 'Nicht genug Gold!' : 'Not enough gold!');
                        return;
                      }
                      
                      if (item.type === 'remove') {
                        audio.playClick();
                        setShowRemoveCardModal(true);
                        return;
                      }
                      
                      audio.playPurchase();
                      
                      // Process purchase
                      setRun(prev => {
                        if (!prev) return prev;
                        let newRun = { ...prev };
                        newRun.player = { ...newRun.player, gold: newRun.player.gold - item.cost };
                        
                        if (item.type === 'card' && item.card) {
                          newRun.deck = [...newRun.deck, { ...item.card, id: `${item.card.id}-${Date.now()}` }];
                          setMessage(isDE ? `${item.card.name} gekauft!` : `Bought ${item.card.name}!`);
                        } else if (item.type === 'potion') {
                          if (item.id === 'potion-heal') {
                            const healAmount = Math.floor(newRun.player.maxHp * 0.3);
                            newRun.player.hp = Math.min(newRun.player.maxHp, newRun.player.hp + healAmount);
                            setMessage(isDE ? `+${healAmount} HP geheilt!` : `Healed +${healAmount} HP!`);
                          } else if (item.id === 'potion-maxhp') {
                            newRun.player.maxHp += 10;
                            newRun.player.hp += 10;
                            setMessage(isDE ? '+10 Max HP!' : '+10 Max HP!');
                          }
                        }
                        
                        return newRun;
                      });
                      
                      // Remove purchased item
                      setShopItems(prev => prev.filter(i => i.id !== item.id));
                    }}
                    className="p-4 cursor-pointer transition-all duration-200"
                    style={{
                      background: canAfford ? '#1F2937' : '#111827',
                      border: `4px solid ${isHovered && canAfford ? rarityColor : '#374151'}`,
                      boxShadow: isHovered && canAfford ? `6px 6px 0 ${rarityColor}` : '4px 4px 0 #000',
                      opacity: canAfford ? 1 : 0.5,
                      transform: isHovered && canAfford ? 'translateY(-4px)' : 'translateY(0)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 flex items-center justify-center shrink-0"
                        style={{ 
                          background: rarityColor,
                          border: '3px solid #000',
                          boxShadow: '3px 3px 0 #000'
                        }}
                      >
                        {item.type === 'card' ? (
                          <Swords className="w-6 h-6 text-black" />
                        ) : item.type === 'potion' ? (
                          <Heart className="w-6 h-6 text-black" />
                        ) : (
                          <Package className="w-6 h-6 text-black" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white text-sm uppercase truncate">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                          {item.description}
                        </p>
                        {item.card && (
                          <div 
                            className="inline-block px-2 py-0.5 mt-2 text-[10px] font-black uppercase"
                            style={{ 
                              background: rarityColor, 
                              color: '#000',
                              border: '2px solid #000'
                            }}
                          >
                            {item.card.rarity}
                          </div>
                        )}
                      </div>
                      
                      <div 
                        className="flex items-center gap-1 px-3 py-1 shrink-0"
                        style={{ 
                          background: canAfford ? '#FBBF24' : '#6B7280',
                          border: '3px solid #000',
                          boxShadow: '2px 2px 0 #000'
                        }}
                      >
                        <Coins className="w-4 h-4 text-black" />
                        <span className="font-black text-black">{item.cost}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {shopItems.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">
                  {isDE ? 'Ausverkauft!' : 'Sold out!'}
                </p>
              </div>
            )}
          </div>

          {/* Leave Shop Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                audio.playClose();
                setView('map');
              }}
              onMouseEnter={() => audio.playHover()}
              className="w-full py-4 font-black text-lg uppercase transition-all hover:translate-y-[-2px]"
              style={{
                background: '#8B5CF6',
                border: '4px solid #000',
                boxShadow: '6px 6px 0 #000',
                color: '#FFF'
              }}
            >
              {isDE ? 'Verlassen' : 'Leave'}
            </button>
          </div>

          {/* Remove Card Modal */}
          <AnimatePresence>
            {showRemoveCardModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.8)' }}
                onClick={() => setShowRemoveCardModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-md max-h-[80vh] overflow-y-auto p-4"
                  style={{
                    background: '#1F2937',
                    border: '4px solid #000',
                    boxShadow: '8px 8px 0 #000'
                  }}
                >
                  <h3 className="text-xl font-black text-white text-center mb-4 uppercase">
                    {isDE ? 'Karte entfernen' : 'Remove Card'}
                  </h3>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    {isDE ? 'Wähle eine Karte zum Entfernen:' : 'Choose a card to remove:'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {run.deck.map((card, idx) => (
                      <motion.button
                        key={`${card.id}-${idx}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const removeItem = shopItems.find(i => i.id === 'remove-card');
                          if (!removeItem || run.player.gold < removeItem.cost) return;
                          
                          audio.playPurchase();
                          
                          setRun(prev => {
                            if (!prev) return prev;
                            const newDeck = [...prev.deck];
                            newDeck.splice(idx, 1);
                            return {
                              ...prev,
                              deck: newDeck,
                              player: { ...prev.player, gold: prev.player.gold - removeItem.cost }
                            };
                          });
                          
                          setShopItems(prev => prev.filter(i => i.id !== 'remove-card'));
                          setShowRemoveCardModal(false);
                          setMessage(isDE ? `${card.name} entfernt!` : `Removed ${card.name}!`);
                        }}
                        onMouseEnter={() => audio.playHover()}
                        className="p-2 text-left"
                        style={{
                          background: card.element === 'fire' ? '#FF006E22' :
                                     card.element === 'water' ? '#00D9FF22' :
                                     card.element === 'earth' ? '#06FFA522' :
                                     card.element === 'air' ? '#A5B4FC22' :
                                     card.element === 'void' ? '#8B5CF622' : '#37415122',
                          border: '3px solid #374151'
                        }}
                      >
                        <div className="font-bold text-white text-xs truncate">{card.name}</div>
                        <div className="text-gray-500 text-[10px]">{card.type}</div>
                      </motion.button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      audio.playClose();
                      setShowRemoveCardModal(false);
                    }}
                    className="w-full mt-4 py-2 font-bold uppercase"
                    style={{
                      background: '#374151',
                      border: '3px solid #000',
                      color: '#FFF'
                    }}
                  >
                    {isDE ? 'Abbrechen' : 'Cancel'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)' }}
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                border: '4px solid #8B5CF6',
                boxShadow: '8px 8px 0 #000'
              }}
            >
              {/* Header */}
              <div 
                className="sticky top-0 p-4 flex items-center justify-between z-10"
                style={{ 
                  background: '#8B5CF6',
                  borderBottom: '4px solid #000'
                }}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-black text-white uppercase">
                    {isDE ? 'Spielanleitung' : 'How to Play'}
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    audio.playClose();
                    setShowTutorial(false);
                  }}
                  className="p-2"
                  style={{ background: '#000' }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Intro */}
                <div className="text-center pb-4 border-b border-gray-700">
                  <h3 className="text-2xl font-black text-white mb-2">
                    ⚔️ {isDE ? 'KARTENSCHMIEDE' : 'CARD FORGE'} ⚔️
                  </h3>
                  <p className="text-gray-400">
                    {isDE 
                      ? 'Ein strategisches Roguelike-Deckbuilder-Abenteuer mit 250 Floors und über 200 Karten!'
                      : 'A strategic roguelike deckbuilder adventure with 250 floors and over 200 cards!'
                    }
                  </p>
                </div>

                {/* Section: Goal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-pink-500" />
                    <h4 className="font-black text-white uppercase">{isDE ? 'Ziel' : 'Goal'}</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {isDE 
                      ? 'Besiege alle 5 Akte mit je 50 Floors. Kämpfe gegen Gegner, sammle Karten und verbessere dein Deck. Jeder Run ist einzigartig!'
                      : 'Defeat all 5 acts with 50 floors each. Fight enemies, collect cards, and improve your deck. Every run is unique!'
                    }
                  </p>
                </div>

                {/* Section: Map */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-purple-500" />
                    <h4 className="font-black text-white uppercase">{isDE ? 'Die Karte' : 'The Map'}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#FF006E22' }}>
                      <Swords className="w-4 h-4 text-pink-500" />
                      <span className="text-gray-300">{isDE ? 'Kampf - Gegner bekämpfen' : 'Combat - Fight enemies'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#FFB80022' }}>
                      <Skull className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-300">{isDE ? 'Elite - Starke Gegner, bessere Beute' : 'Elite - Strong enemies, better loot'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#06FFA522' }}>
                      <ShoppingBag className="w-4 h-4 text-green-500" />
                      <span className="text-gray-300">{isDE ? 'Shop - Karten kaufen/verkaufen' : 'Shop - Buy/sell cards'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#00D9FF22' }}>
                      <Coffee className="w-4 h-4 text-cyan-500" />
                      <span className="text-gray-300">{isDE ? 'Rasten - HP heilen' : 'Rest - Heal HP'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#FBBF2422' }}>
                      <Gift className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">{isDE ? 'Schatz - Belohnung!' : 'Treasure - Reward!'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded" style={{ background: '#8B5CF622' }}>
                      <HelpCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-gray-300">{isDE ? 'Ereignis - Zufälliges Event' : 'Event - Random event'}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Combat */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Swords className="w-5 h-5 text-red-500" />
                    <h4 className="font-black text-white uppercase">{isDE ? 'Kampfsystem' : 'Combat System'}</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      <span className="text-yellow-400 font-bold">⚡ Energie:</span>{' '}
                      {isDE 
                        ? 'Du hast 3 Energie pro Zug. Karten kosten Energie zum Spielen.'
                        : 'You have 3 energy per turn. Cards cost energy to play.'
                      }
                    </p>
                    <p>
                      <span className="text-red-400 font-bold">❤️ HP:</span>{' '}
                      {isDE 
                        ? 'Erreicht deine HP 0, ist der Run vorbei!'
                        : 'If your HP reaches 0, the run is over!'
                      }
                    </p>
                    <p>
                      <span className="text-blue-400 font-bold">🛡️ Block:</span>{' '}
                      {isDE 
                        ? 'Block absorbiert Schaden. Verschwindet am Zugende.'
                        : 'Block absorbs damage. Disappears at end of turn.'
                      }
                    </p>
                  </div>
                </div>

                {/* Section: Cards */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    <h4 className="font-black text-white uppercase">{isDE ? 'Karten' : 'Cards'}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded" style={{ background: '#FF006E22', border: '2px solid #FF006E' }}>
                      <Flame className="w-5 h-5 text-pink-500 mb-1" />
                      <div className="font-bold text-white">{isDE ? 'Feuer' : 'Fire'}</div>
                      <div className="text-gray-400 text-xs">{isDE ? 'Hoher Schaden, Burn-Effekte' : 'High damage, burn effects'}</div>
                    </div>
                    <div className="p-3 rounded" style={{ background: '#00D9FF22', border: '2px solid #00D9FF' }}>
                      <Droplets className="w-5 h-5 text-cyan-500 mb-1" />
                      <div className="font-bold text-white">{isDE ? 'Wasser' : 'Water'}</div>
                      <div className="text-gray-400 text-xs">{isDE ? 'Heilung, Kartenzug' : 'Healing, card draw'}</div>
                    </div>
                    <div className="p-3 rounded" style={{ background: '#06FFA522', border: '2px solid #06FFA5' }}>
                      <Mountain className="w-5 h-5 text-green-500 mb-1" />
                      <div className="font-bold text-white">{isDE ? 'Erde' : 'Earth'}</div>
                      <div className="text-gray-400 text-xs">{isDE ? 'Block, Ausdauer' : 'Block, endurance'}</div>
                    </div>
                    <div className="p-3 rounded" style={{ background: '#A5B4FC22', border: '2px solid #A5B4FC' }}>
                      <Wind className="w-5 h-5 text-indigo-400 mb-1" />
                      <div className="font-bold text-white">{isDE ? 'Luft' : 'Air'}</div>
                      <div className="text-gray-400 text-xs">{isDE ? 'Schnell, Combo-Karten' : 'Fast, combo cards'}</div>
                    </div>
                  </div>
                </div>

                {/* Section: Tips */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-black text-white uppercase">{isDE ? 'Tipps' : 'Tips'}</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {isDE 
                        ? 'Entferne schwache Karten im Shop - ein kleines Deck ist oft besser!'
                        : 'Remove weak cards at the shop - a smaller deck is often better!'
                      }
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {isDE 
                        ? 'Raste nicht zu oft - Elite-Kämpfe geben bessere Belohnungen!'
                        : "Don't rest too often - elite fights give better rewards!"
                      }
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {isDE 
                        ? 'Behalte die Gegner-Absichten im Auge (Symbole über ihnen).'
                        : 'Watch enemy intents (symbols above them).'
                      }
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      {isDE 
                        ? 'Block vor dem Angriff aufbauen, wenn Gegner viel Schaden machen!'
                        : 'Build block before attacking when enemies deal high damage!'
                      }
                    </li>
                  </ul>
                </div>

                {/* Start Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    audio.playClick();
                    setShowTutorial(false);
                  }}
                  className="w-full py-4 font-black text-lg uppercase"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    border: '4px solid #000',
                    boxShadow: '6px 6px 0 #000',
                    color: '#FFF'
                  }}
                >
                  {isDE ? 'Verstanden!' : 'Got it!'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeckbuilderGame;
