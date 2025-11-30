// ============================================
// SOLITAIRE - Classic Klondike Solitaire
// ============================================
// 250 Levels with increasing difficulty

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Clock, Layers, Play, Star, Undo2, HelpCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { audio } from '../utils/audio';

// ============================================
// TYPES
// ============================================

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Color = 'red' | 'black';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: number;
  faceUp: boolean;
}

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 piles, one per suit
  tableau: Card[][]; // 7 columns
  selectedCards: { cards: Card[]; source: string; sourceIndex: number } | null;
  moves: number;
  startTime: number;
  isWon: boolean;
}

interface SolitaireGameProps {
  onBack: () => void;
  onGameEnd?: (coins: number, xp: number) => void;
  language?: 'EN' | 'DE' | 'ES';
  user?: any;
  onUpdateUser?: (updater: (prev: any) => any) => void;
}

// ============================================
// CONSTANTS
// ============================================

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

const SUIT_COLORS: Record<Suit, Color> = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black'
};

// Level difficulties (affects initial card dealing)
const getLevelConfig = (level: number) => {
  // Higher levels = harder (fewer face-up cards, etc.)
  const tier = Math.ceil(level / 50);
  return {
    drawCount: tier <= 2 ? 1 : 3, // Draw 1 or 3 cards
    initialFaceUp: Math.max(1, 8 - tier), // Fewer face-up tableau cards
    bonusMultiplier: tier // Score multiplier
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({
        id: `card-${id++}`,
        suit,
        rank: RANKS[i],
        value: i + 1,
        faceUp: false
      });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[], seed: number): Card[] => {
  const shuffled = [...deck];
  // Seeded random for reproducible levels
  const random = (max: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.floor((seed / 233280) * max);
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const canPlaceOnFoundation = (card: Card, foundation: Card[]): boolean => {
  if (foundation.length === 0) {
    return card.rank === 'A';
  }
  const topCard = foundation[foundation.length - 1];
  return card.suit === topCard.suit && card.value === topCard.value + 1;
};

const canPlaceOnTableau = (card: Card, column: Card[]): boolean => {
  if (column.length === 0) {
    return card.rank === 'K';
  }
  const topCard = column[column.length - 1];
  const cardColor = SUIT_COLORS[card.suit];
  const topColor = SUIT_COLORS[topCard.suit];
  return cardColor !== topColor && card.value === topCard.value - 1;
};

// ============================================
// MAIN COMPONENT
// ============================================

export const SolitaireGame: React.FC<SolitaireGameProps> = ({
  onBack,
  onGameEnd,
  language = 'DE',
  user,
  onUpdateUser
}) => {
  const [view, setView] = useState<'menu' | 'levels' | 'game' | 'win'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentTier, setCurrentTier] = useState(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState<GameState[]>([]);
  
  const isDE = language === 'DE';
  const isES = language === 'ES';
  
  // Get completed levels from user
  const completedLevels = user?.solitaireData?.completedLevels || [];
  const highestUnlocked = Math.max(1, ...completedLevels.map((l: number) => l + 1));

  // Timer
  useEffect(() => {
    if (view === 'game' && gameState && !gameState.isWon) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - gameState.startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, gameState?.isWon, gameState?.startTime]);

  // Initialize game for a level
  const startGame = useCallback((level: number) => {
    const config = getLevelConfig(level);
    const deck = shuffleDeck(createDeck(), level * 12345);
    
    // Deal tableau
    const tableau: Card[][] = [[], [], [], [], [], [], []];
    let cardIndex = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = { ...deck[cardIndex++], faceUp: row === col };
        tableau[col].push(card);
      }
    }
    
    // Remaining cards go to stock
    const stock = deck.slice(cardIndex).map(c => ({ ...c, faceUp: false }));
    
    const newState: GameState = {
      stock,
      waste: [],
      foundations: [[], [], [], []],
      tableau,
      selectedCards: null,
      moves: 0,
      startTime: Date.now(),
      isWon: false
    };
    
    setGameState(newState);
    setHistory([]);
    setElapsedTime(0);
    setSelectedLevel(level);
    setView('game');
    audio.playClick();
  }, []);

  // Save state for undo
  const saveState = useCallback(() => {
    if (gameState) {
      setHistory(prev => [...prev.slice(-20), JSON.parse(JSON.stringify(gameState))]);
    }
  }, [gameState]);

  // Undo last move
  const undo = useCallback(() => {
    if (history.length > 0) {
      const prevState = history[history.length - 1];
      setGameState(prevState);
      setHistory(prev => prev.slice(0, -1));
      audio.playClick();
    }
  }, [history]);

  // Draw from stock
  const drawFromStock = useCallback(() => {
    if (!gameState) return;
    saveState();
    
    const config = getLevelConfig(selectedLevel);
    
    if (gameState.stock.length === 0) {
      // Reset stock from waste
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          stock: prev.waste.map(c => ({ ...c, faceUp: false })).reverse(),
          waste: [],
          moves: prev.moves + 1
        };
      });
    } else {
      // Draw cards
      setGameState(prev => {
        if (!prev) return prev;
        const drawCount = Math.min(config.drawCount, prev.stock.length);
        const drawn = prev.stock.slice(-drawCount).map(c => ({ ...c, faceUp: true }));
        return {
          ...prev,
          stock: prev.stock.slice(0, -drawCount),
          waste: [...prev.waste, ...drawn],
          moves: prev.moves + 1
        };
      });
    }
    audio.playClick();
  }, [gameState, selectedLevel, saveState]);

  // Check for win
  const checkWin = useCallback((state: GameState): boolean => {
    return state.foundations.every(f => f.length === 13);
  }, []);

  // Handle card click
  const handleCardClick = useCallback((source: string, sourceIndex: number, cardIndex?: number) => {
    if (!gameState || gameState.isWon) return;
    
    const { selectedCards, tableau, waste, foundations } = gameState;
    
    // If clicking on selected cards, deselect
    if (selectedCards && selectedCards.source === source && selectedCards.sourceIndex === sourceIndex) {
      setGameState(prev => prev ? { ...prev, selectedCards: null } : prev);
      return;
    }
    
    // If no selection, select cards
    if (!selectedCards) {
      let cards: Card[] = [];
      
      if (source === 'waste' && waste.length > 0) {
        cards = [waste[waste.length - 1]];
      } else if (source === 'tableau' && tableau[sourceIndex]) {
        const col = tableau[sourceIndex];
        const clickIdx = cardIndex ?? col.length - 1;
        // Can only select face-up cards
        if (col[clickIdx]?.faceUp) {
          cards = col.slice(clickIdx);
        }
      } else if (source === 'foundation' && foundations[sourceIndex]?.length > 0) {
        cards = [foundations[sourceIndex][foundations[sourceIndex].length - 1]];
      }
      
      if (cards.length > 0) {
        setGameState(prev => prev ? { 
          ...prev, 
          selectedCards: { cards, source, sourceIndex: cardIndex ?? sourceIndex } 
        } : prev);
        audio.playClick();
      }
      return;
    }
    
    // Try to place selected cards
    saveState();
    const card = selectedCards.cards[0];
    let moved = false;
    
    if (source === 'foundation' && selectedCards.cards.length === 1) {
      if (canPlaceOnFoundation(card, foundations[sourceIndex])) {
        moved = true;
        setGameState(prev => {
          if (!prev) return prev;
          const newState = { ...prev };
          
          // Remove from source
          if (selectedCards.source === 'waste') {
            newState.waste = prev.waste.slice(0, -1);
          } else if (selectedCards.source === 'tableau') {
            const srcCol = [...prev.tableau[selectedCards.sourceIndex]];
            srcCol.pop();
            if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
              srcCol[srcCol.length - 1].faceUp = true;
            }
            newState.tableau = [...prev.tableau];
            newState.tableau[selectedCards.sourceIndex] = srcCol;
          }
          
          // Add to foundation
          newState.foundations = [...prev.foundations];
          newState.foundations[sourceIndex] = [...prev.foundations[sourceIndex], card];
          newState.selectedCards = null;
          newState.moves = prev.moves + 1;
          newState.isWon = checkWin(newState);
          
          return newState;
        });
      }
    } else if (source === 'tableau') {
      if (canPlaceOnTableau(card, tableau[sourceIndex])) {
        moved = true;
        setGameState(prev => {
          if (!prev) return prev;
          const newState = { ...prev };
          
          // Remove from source
          if (selectedCards.source === 'waste') {
            newState.waste = prev.waste.slice(0, -1);
          } else if (selectedCards.source === 'tableau') {
            const srcCol = [...prev.tableau[selectedCards.sourceIndex]];
            srcCol.splice(-selectedCards.cards.length);
            if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
              srcCol[srcCol.length - 1].faceUp = true;
            }
            newState.tableau = [...prev.tableau];
            newState.tableau[selectedCards.sourceIndex] = srcCol;
          } else if (selectedCards.source === 'foundation') {
            newState.foundations = [...prev.foundations];
            newState.foundations[selectedCards.sourceIndex] = prev.foundations[selectedCards.sourceIndex].slice(0, -1);
          }
          
          // Add to tableau
          if (selectedCards.source !== 'tableau' || selectedCards.sourceIndex !== sourceIndex) {
            newState.tableau = [...(newState.tableau || prev.tableau)];
            newState.tableau[sourceIndex] = [...prev.tableau[sourceIndex], ...selectedCards.cards];
          }
          newState.selectedCards = null;
          newState.moves = prev.moves + 1;
          
          return newState;
        });
      }
    }
    
    if (moved) {
      audio.playPurchase();
    } else {
      setGameState(prev => prev ? { ...prev, selectedCards: null } : prev);
    }
  }, [gameState, saveState, checkWin]);

  // Auto-move to foundation
  const autoMoveToFoundation = useCallback(() => {
    if (!gameState || gameState.isWon) return;
    
    // Check waste
    if (gameState.waste.length > 0) {
      const card = gameState.waste[gameState.waste.length - 1];
      for (let i = 0; i < 4; i++) {
        if (canPlaceOnFoundation(card, gameState.foundations[i])) {
          handleCardClick('waste', 0);
          setTimeout(() => handleCardClick('foundation', i), 50);
          return;
        }
      }
    }
    
    // Check tableau
    for (let col = 0; col < 7; col++) {
      const column = gameState.tableau[col];
      if (column.length > 0) {
        const card = column[column.length - 1];
        if (card.faceUp) {
          for (let i = 0; i < 4; i++) {
            if (canPlaceOnFoundation(card, gameState.foundations[i])) {
              handleCardClick('tableau', col);
              setTimeout(() => handleCardClick('foundation', i), 50);
              return;
            }
          }
        }
      }
    }
  }, [gameState, handleCardClick]);

  // Handle win
  useEffect(() => {
    if (gameState?.isWon && view === 'game') {
      audio.playWin();
      
      // Calculate rewards
      const config = getLevelConfig(selectedLevel);
      const timeBonus = Math.max(0, 300 - elapsedTime);
      const moveBonus = Math.max(0, 100 - gameState.moves);
      const xp = (50 + timeBonus + moveBonus) * config.bonusMultiplier;
      const coins = Math.floor(xp / 5);
      
      // Save completion
      if (onUpdateUser && !completedLevels.includes(selectedLevel)) {
        onUpdateUser(prev => ({
          ...prev,
          solitaireData: {
            ...prev.solitaireData,
            completedLevels: [...(prev.solitaireData?.completedLevels || []), selectedLevel]
          }
        }));
      }
      
      setTimeout(() => setView('win'), 500);
    }
  }, [gameState?.isWon]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDER CARD
  // ============================================
  
  const renderCard = (card: Card | null, isSelected: boolean = false, onClick?: () => void, stackOffset: number = 0) => {
    if (!card) {
      return (
        <div 
          className="w-12 h-16 md:w-14 md:h-20 rounded-lg border-2 border-dashed"
          style={{ 
            borderColor: 'var(--color-border)',
            background: 'var(--color-surface)'
          }}
          onClick={onClick}
        />
      );
    }
    
    const color = SUIT_COLORS[card.suit] === 'red' ? '#FF006E' : '#000';
    
    return (
      <motion.div
        whileHover={onClick ? { y: -4 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        onClick={onClick}
        className={`w-12 h-16 md:w-14 md:h-20 rounded-lg cursor-pointer select-none ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
        style={{
          background: card.faceUp ? '#FFF' : 'linear-gradient(135deg, #8338EC 0%, #FF006E 100%)',
          border: '3px solid #000',
          boxShadow: isSelected ? '0 0 20px rgba(255,190,11,0.6)' : '3px 3px 0 #000',
          marginTop: stackOffset > 0 ? `-${stackOffset}px` : 0,
          zIndex: stackOffset
        }}
      >
        {card.faceUp ? (
          <div className="w-full h-full flex flex-col justify-between p-1">
            <div className="text-left">
              <div className="text-xs md:text-sm font-black" style={{ color }}>{card.rank}</div>
              <div className="text-sm md:text-base" style={{ color }}>{SUIT_SYMBOLS[card.suit]}</div>
            </div>
            <div className="text-center text-lg md:text-xl" style={{ color }}>
              {SUIT_SYMBOLS[card.suit]}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-xl font-black">♠</div>
          </div>
        )}
      </motion.div>
    );
  };

  // ============================================
  // RENDER MENU
  // ============================================
  
  const renderMenu = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col p-4"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* Rainbow Top Bar */}
      <div className="flex h-3 w-full mb-6">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-8 p-6 text-center"
        style={{
          background: '#06FFA5',
          border: '4px solid #000',
          boxShadow: '8px 8px 0 #000',
          transform: 'skew(-2deg)'
        }}
      >
        <h1 className="text-4xl md:text-5xl font-black text-black uppercase" style={{ transform: 'skew(2deg)' }}>
          {isDE ? 'SOLITÄR' : isES ? 'SOLITARIO' : 'SOLITAIRE'}
        </h1>
        <p className="text-black/70 font-bold mt-2 uppercase tracking-widest text-sm" style={{ transform: 'skew(2deg)' }}>
          {isDE ? 'Klassisches Kartenspiel' : isES ? 'Juego de Cartas Clásico' : 'Classic Card Game'}
        </p>
      </motion.div>

      {/* Main Buttons */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-5">
        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setView('levels'); audio.playClick(); }}
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
          <span style={{ transform: 'skew(2deg)' }}>{isDE ? 'Level wählen' : isES ? 'Elegir Nivel' : 'Select Level'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { onBack(); audio.playClose(); }}
          className="w-full py-4 px-6 font-black text-lg uppercase flex items-center justify-center gap-3"
          style={{
            background: 'var(--color-surface)',
            border: '4px solid #000',
            boxShadow: '5px 5px 0 #000',
            color: 'var(--color-text)'
          }}
        >
          <ArrowLeft className="w-6 h-6" />
          {isDE ? 'Zurück' : isES ? 'Volver' : 'Back'}
        </motion.button>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mt-8 max-w-lg mx-auto w-full"
      >
        <div className="p-4 text-center" style={{ background: '#FF006E', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}>
          <div className="text-3xl font-black text-white">250</div>
          <div className="text-xs font-bold text-white/70 uppercase">Levels</div>
        </div>
        <div className="p-4 text-center" style={{ background: '#FFBE0B', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}>
          <div className="text-3xl font-black text-black">{completedLevels.length}</div>
          <div className="text-xs font-bold text-black/70 uppercase">{isDE ? 'Geschafft' : isES ? 'Completados' : 'Completed'}</div>
        </div>
      </motion.div>
    </motion.div>
  );

  // ============================================
  // RENDER LEVELS
  // ============================================
  
  const renderLevels = () => {
    const levelsPerPage = 50;
    const totalPages = 5;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen flex flex-col overflow-hidden"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-4" style={{ borderBottom: '4px solid #000', background: 'var(--color-surface)' }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setView('menu'); audio.playClose(); }}
            className="p-2"
            style={{ background: '#FF006E', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h2 className="text-xl font-black uppercase" style={{ color: 'var(--color-text)' }}>
            {isDE ? 'Level wählen' : isES ? 'Elegir Nivel' : 'Select Level'}
          </h2>
        </div>

        {/* Tier Tabs */}
        <div className="flex p-2 gap-2 overflow-x-auto" style={{ background: 'var(--color-surface)' }}>
          {[1, 2, 3, 4, 5].map(tier => (
            <button
              key={tier}
              onClick={() => { setCurrentTier(tier); audio.playClick(); }}
              className="px-4 py-2 font-black text-sm uppercase whitespace-nowrap"
              style={{
                background: currentTier === tier ? '#FFBE0B' : 'var(--color-bg)',
                border: '3px solid #000',
                color: currentTier === tier ? '#000' : 'var(--color-text)'
              }}
            >
              {(tier - 1) * 50 + 1}-{tier * 50}
            </button>
          ))}
        </div>

        {/* Level Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Array.from({ length: 50 }, (_, i) => {
              const level = (currentTier - 1) * 50 + i + 1;
              const isCompleted = completedLevels.includes(level);
              const isLocked = level > highestUnlocked;
              
              return (
                <motion.button
                  key={level}
                  whileHover={!isLocked ? { scale: 1.1 } : undefined}
                  whileTap={!isLocked ? { scale: 0.95 } : undefined}
                  onClick={() => !isLocked && startGame(level)}
                  disabled={isLocked}
                  className="aspect-square flex flex-col items-center justify-center font-black text-sm"
                  style={{
                    background: isCompleted ? '#06FFA5' : isLocked ? 'var(--color-surface)' : '#FFBE0B',
                    border: '3px solid #000',
                    boxShadow: isLocked ? 'none' : '3px 3px 0 #000',
                    color: isLocked ? 'var(--color-text-muted)' : '#000',
                    opacity: isLocked ? 0.5 : 1
                  }}
                >
                  {isCompleted && <Star className="w-3 h-3 mb-0.5" />}
                  {level}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  // ============================================
  // RENDER GAME
  // ============================================
  
  const renderGame = () => {
    if (!gameState) return null;
    
    const { stock, waste, foundations, tableau, selectedCards } = gameState;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen flex flex-col overflow-hidden"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Header */}
        <div className="p-2 flex items-center justify-between" style={{ borderBottom: '3px solid #000', background: 'var(--color-surface)' }}>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setView('levels'); audio.playClose(); }}
              className="p-2"
              style={{ background: '#FF006E', border: '2px solid #000' }}
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </motion.button>
            <span className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
              Level {selectedLevel}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-2 py-1" style={{ background: '#000', color: '#FFF' }}>
              <Clock className="w-3 h-3" />
              <span className="font-black text-xs">{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1" style={{ background: '#FFBE0B', color: '#000', border: '2px solid #000' }}>
              <Layers className="w-3 h-3" />
              <span className="font-black text-xs">{gameState.moves}</span>
            </div>
          </div>
          
          <div className="flex gap-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={undo}
              disabled={history.length === 0}
              className="p-2"
              style={{ background: history.length > 0 ? '#8338EC' : 'var(--color-surface)', border: '2px solid #000', opacity: history.length > 0 ? 1 : 0.5 }}
            >
              <Undo2 className="w-4 h-4" style={{ color: history.length > 0 ? '#FFF' : 'var(--color-text-muted)' }} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame(selectedLevel)}
              className="p-2"
              style={{ background: '#FF7F00', border: '2px solid #000' }}
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 p-2 overflow-auto">
          {/* Stock, Waste, and Foundations */}
          <div className="flex justify-between mb-4">
            {/* Stock & Waste */}
            <div className="flex gap-2">
              {/* Stock */}
              <div onClick={drawFromStock}>
                {stock.length > 0 ? (
                  renderCard({ ...stock[stock.length - 1], faceUp: false }, false, drawFromStock)
                ) : (
                  <div 
                    className="w-12 h-16 md:w-14 md:h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer"
                    style={{ borderColor: '#06FFA5', background: 'var(--color-surface)' }}
                    onClick={drawFromStock}
                  >
                    <RotateCcw className="w-5 h-5" style={{ color: '#06FFA5' }} />
                  </div>
                )}
              </div>
              
              {/* Waste */}
              <div>
                {waste.length > 0 ? (
                  renderCard(
                    waste[waste.length - 1],
                    selectedCards?.source === 'waste',
                    () => handleCardClick('waste', 0)
                  )
                ) : (
                  renderCard(null)
                )}
              </div>
            </div>

            {/* Foundations */}
            <div className="flex gap-1">
              {foundations.map((foundation, i) => (
                <div 
                  key={i}
                  onClick={() => handleCardClick('foundation', i)}
                >
                  {foundation.length > 0 ? (
                    renderCard(
                      foundation[foundation.length - 1],
                      selectedCards?.source === 'foundation' && selectedCards.sourceIndex === i,
                      () => handleCardClick('foundation', i)
                    )
                  ) : (
                    <div 
                      className="w-12 h-16 md:w-14 md:h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                      onClick={() => handleCardClick('foundation', i)}
                    >
                      <span className="text-xl opacity-30">{SUIT_SYMBOLS[SUITS[i]]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tableau */}
          <div className="flex gap-1 justify-center">
            {tableau.map((column, colIndex) => (
              <div 
                key={colIndex} 
                className="flex flex-col min-h-[200px]"
                onClick={() => column.length === 0 && handleCardClick('tableau', colIndex)}
              >
                {column.length === 0 ? (
                  <div 
                    className="w-12 h-16 md:w-14 md:h-20 rounded-lg border-2 border-dashed cursor-pointer"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  />
                ) : (
                  column.map((card, cardIndex) => {
                    const isSelected = selectedCards?.source === 'tableau' && 
                                      selectedCards.sourceIndex === colIndex &&
                                      cardIndex >= (column.length - selectedCards.cards.length);
                    return (
                      <div key={card.id} style={{ marginTop: cardIndex > 0 ? '-48px' : 0, zIndex: cardIndex }}>
                        {renderCard(
                          card,
                          isSelected,
                          card.faceUp ? () => handleCardClick('tableau', colIndex, cardIndex) : undefined
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Auto-move Button */}
        <div className="p-2" style={{ borderTop: '3px solid #000', background: 'var(--color-surface)' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={autoMoveToFoundation}
            className="w-full py-3 font-black uppercase"
            style={{ background: '#06FFA5', border: '3px solid #000', color: '#000' }}
          >
            {isDE ? 'Auto Ablegen' : isES ? 'Auto Colocar' : 'Auto Place'}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // ============================================
  // RENDER WIN
  // ============================================
  
  const renderWin = () => {
    const config = getLevelConfig(selectedLevel);
    const timeBonus = Math.max(0, 300 - elapsedTime);
    const moveBonus = Math.max(0, 100 - (gameState?.moves || 0));
    const xp = (50 + timeBonus + moveBonus) * config.bonusMultiplier;
    const coins = Math.floor(xp / 5);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen flex flex-col items-center justify-center p-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md p-8 text-center"
          style={{ background: 'var(--color-surface)', border: '6px solid #000', boxShadow: '12px 12px 0 #000' }}
        >
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center" style={{ background: '#FFBE0B', border: '4px solid #000' }}>
            <Trophy className="w-10 h-10 text-black" />
          </div>
          
          <h2 className="text-3xl font-black uppercase mb-2" style={{ color: 'var(--color-text)' }}>
            {isDE ? 'Gewonnen!' : isES ? '¡Ganaste!' : 'You Won!'}
          </h2>
          <p className="text-lg font-bold mb-6" style={{ color: 'var(--color-text-muted)' }}>
            Level {selectedLevel} {isDE ? 'geschafft' : isES ? 'completado' : 'completed'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4" style={{ background: '#FF006E', border: '3px solid #000' }}>
              <div className="text-2xl font-black text-white">{xp}</div>
              <div className="text-xs font-bold text-white/70 uppercase">XP</div>
            </div>
            <div className="p-4" style={{ background: '#FFBE0B', border: '3px solid #000' }}>
              <div className="text-2xl font-black text-black">{coins}</div>
              <div className="text-xs font-bold text-black/70 uppercase">{isDE ? 'Münzen' : isES ? 'Monedas' : 'Coins'}</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setView('levels'); audio.playClick(); }}
              className="flex-1 py-4 font-black uppercase"
              style={{ background: 'var(--color-bg)', border: '4px solid #000', color: 'var(--color-text)' }}
            >
              {isDE ? 'Levels' : 'Levels'}
            </motion.button>
            {selectedLevel < 250 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame(selectedLevel + 1)}
                className="flex-1 py-4 font-black uppercase"
                style={{ background: '#06FFA5', border: '4px solid #000', color: '#000' }}
              >
                {isDE ? 'Weiter' : isES ? 'Siguiente' : 'Next'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div className="h-screen overflow-hidden">
      {view === 'menu' && renderMenu()}
      {view === 'levels' && renderLevels()}
      {view === 'game' && renderGame()}
      {view === 'win' && renderWin()}
    </div>
  );
};

export default SolitaireGame;
