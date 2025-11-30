// ============================================
// KARTENSCHMIEDE - Main Game Component
// ============================================
// Roguelike Deckbuilder with 250 floors, 200+ cards, and strategic combat

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Swords, Package, ShoppingBag, Coffee, HelpCircle, Flame, Droplets, Mountain, Wind, Moon, Trophy, Zap, Heart, Shield, Coins, Star, Play, RotateCcw } from 'lucide-react';

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
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-black text-white mb-2" style={{ textShadow: '4px 4px 0 #8B5CF6' }}>
          {isDE ? 'KARTENSCHMIEDE' : 'CARD FORGE'}
        </h1>
        <p className="text-gray-400 text-lg">Roguelike Deckbuilder</p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md space-y-4"
      >
        <button
          onClick={() => setView('element_select')}
          className="w-full py-4 px-6 font-black text-xl uppercase flex items-center justify-center gap-3"
          style={{
            background: '#8B5CF6',
            border: '4px solid #000',
            boxShadow: '6px 6px 0 #000',
            color: '#FFF'
          }}
        >
          <Play className="w-6 h-6" />
          {isDE ? 'Neuer Durchlauf' : 'New Run'}
        </button>

        <button
          onClick={onBack}
          className="w-full py-3 px-6 font-bold uppercase flex items-center justify-center gap-3"
          style={{
            background: '#374151',
            border: '4px solid #000',
            boxShadow: '4px 4px 0 #000',
            color: '#FFF'
          }}
        >
          <ArrowLeft className="w-5 h-5" />
          {isDE ? 'Zurück' : 'Back'}
        </button>
      </motion.div>

      {/* Stats Preview */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 grid grid-cols-3 gap-4 text-center"
      >
        <div className="p-3" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '2px solid #8B5CF6' }}>
          <div className="text-2xl font-black text-white">250</div>
          <div className="text-xs text-gray-400">{isDE ? 'Floors' : 'Floors'}</div>
        </div>
        <div className="p-3" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '2px solid #8B5CF6' }}>
          <div className="text-2xl font-black text-white">200+</div>
          <div className="text-xs text-gray-400">{isDE ? 'Karten' : 'Cards'}</div>
        </div>
        <div className="p-3" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '2px solid #8B5CF6' }}>
          <div className="text-2xl font-black text-white">55</div>
          <div className="text-xs text-gray-400">{isDE ? 'Gegner' : 'Enemies'}</div>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderElementSelect = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col p-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setView('menu')}
          className="p-2"
          style={{ background: '#374151', border: '3px solid #000' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h2 className="text-2xl font-black text-white">
          {isDE ? 'Wähle dein Element' : 'Choose your Element'}
        </h2>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
        {(Object.entries(ELEMENT_INFO) as [CardElement, typeof ELEMENT_INFO['fire']][])
          .filter(([key]) => key !== 'void') // Void unlocked later
          .map(([element, info]) => (
          <motion.button
            key={element}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedElement(element);
              startNewRun(element);
            }}
            className="p-6 text-left flex items-start gap-4"
            style={{
              background: `linear-gradient(135deg, ${info.color}22, ${info.color}44)`,
              border: `4px solid ${info.color}`,
              boxShadow: `6px 6px 0 #000`
            }}
          >
            <div 
              className="p-3 rounded-lg"
              style={{ background: info.color, color: '#FFF' }}
            >
              {info.icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-1">
                {isDE ? info.nameDE : info.name}
              </h3>
              <p className="text-sm text-gray-300">
                {isDE ? info.descriptionDE : info.description}
              </p>
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
    <div className="min-h-screen">
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

      {view === 'shop' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen flex flex-col items-center justify-center p-4"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
        >
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-4">
              {isDE ? 'Shop' : 'Shop'}
            </h2>
            <p className="text-gray-400 mb-6">{isDE ? 'Bald verfügbar!' : 'Coming soon!'}</p>
            <button
              onClick={() => setView('map')}
              className="py-3 px-6 font-bold"
              style={{
                background: '#8B5CF6',
                border: '3px solid #000',
                color: '#FFF'
              }}
            >
              {isDE ? 'Weiter' : 'Continue'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DeckbuilderGame;
