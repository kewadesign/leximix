import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Lightbulb, Coins, Play, Trophy, Plus, Check, X, Sparkles, Gem } from 'lucide-react';
import { ref, onValue, set, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { Language, UserState, GameMode } from '../types';
import { TRANSLATIONS } from '../constants';
import catDanceGif from '../assets/cat-dance.gif';

// Types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

interface Meld {
  cards: Card[];
  type: 'set' | 'run';
}

interface RummyGameProps {
  language: Language;
  user: UserState;
  onGameEnd: (xp: number, coins: number) => void;
  onBack: () => void;
  multiplayerGameId?: string | null;
  opponentName?: string | null;
  isHost?: boolean;
  levelId?: number;
}

// Card utilities
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};
const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black'
};
const VALUE_DISPLAY: Record<CardValue, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K'
};

// Create deck
const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        suit,
        value: value as CardValue,
        id: `${suit}-${value}`
      });
    }
  }
  // Add second deck for Rummy (104 cards total)
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        suit,
        value: value as CardValue,
        id: `${suit}-${value}-2`
      });
    }
  }
  return deck;
};

// Shuffle deck
const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Check if cards form a valid set (same value, different suits)
const isValidSet = (cards: Card[]): boolean => {
  if (cards.length < 3 || cards.length > 4) return false;
  const value = cards[0].value;
  const suits = new Set(cards.map(c => c.suit));
  return cards.every(c => c.value === value) && suits.size === cards.length;
};

// Check if cards form a valid run (same suit, consecutive values)
const isValidRun = (cards: Card[]): boolean => {
  if (cards.length < 3) return false;
  const suit = cards[0].suit;
  if (!cards.every(c => c.suit === suit)) return false;

  const values = cards.map(c => c.value).sort((a, b) => a - b);
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) return false;
  }
  return true;
};

// Check if cards form a valid meld
const isValidMeld = (cards: Card[]): { valid: boolean; type: 'set' | 'run' | null } => {
  if (isValidSet(cards)) return { valid: true, type: 'set' };
  if (isValidRun(cards)) return { valid: true, type: 'run' };
  return { valid: false, type: null };
};

// Calculate card points (for scoring)
const getCardPoints = (card: Card): number => {
  if (card.value === 1) return 11; // Ace
  if (card.value >= 10) return 10; // Face cards
  return card.value;
};

// Calculate hand points (lower is better when losing)
const getHandPoints = (hand: Card[]): number => {
  return hand.reduce((sum, card) => sum + getCardPoints(card), 0);
};

// AI Difficulty
const getAISkill = (levelId: number): number => {
  if (levelId <= 15) return 1;
  if (levelId <= 40) return 2;
  if (levelId <= 75) return 3;
  return 4;
};

export const RummyGame: React.FC<RummyGameProps> = ({
  language,
  user,
  onGameEnd,
  onBack,
  multiplayerGameId,
  opponentName,
  isHost = true,
  levelId = 1
}) => {
  const t = TRANSLATIONS[language];
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [playerMelds, setPlayerMelds] = useState<Meld[]>([]);
  const [aiMelds, setAiMelds] = useState<Meld[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [currentPlayer, setCurrentPlayer] = useState<'player' | 'ai'>('player');
  const [phase, setPhase] = useState<'draw' | 'play'>('draw');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showStartModal, setShowStartModal] = useState(true);
  const [hintCards, setHintCards] = useState<Set<string>>(new Set());
  const [hintCost, setHintCost] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [message, setMessage] = useState('');

  const isMultiplayer = !!multiplayerGameId;
  const aiSkill = getAISkill(levelId);

  // Initialize game
  useEffect(() => {
    if (!showStartModal) {
      startNewGame();
    }
  }, [showStartModal]);

  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck());
    const pHand = newDeck.splice(0, 13);
    const aHand = newDeck.splice(0, 13);
    const firstDiscard = newDeck.splice(0, 1);

    setDeck(newDeck);
    setPlayerHand(sortHand(pHand));
    setAiHand(aHand);
    setDiscardPile(firstDiscard);
    setPlayerMelds([]);
    setAiMelds([]);
    setSelectedCards(new Set());
    setCurrentPlayer('player');
    setPhase('draw');
    setGameStatus('playing');
    setMessage('Ziehe eine Karte vom Stapel oder Ablagestapel');
  };

  // Sort hand by suit then value
  const sortHand = (hand: Card[]): Card[] => {
    return [...hand].sort((a, b) => {
      if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
      return a.value - b.value;
    });
  };

  // Multiplayer sync
  useEffect(() => {
    if (!isMultiplayer || !multiplayerGameId) return;

    const gameRef = ref(database, `games/${multiplayerGameId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Sync game state from Firebase
        if (data.deck) setDeck(data.deck);
        if (data.discardPile) setDiscardPile(data.discardPile);

        // Host sees hostHand as playerHand, guestHand as aiHand
        // Guest sees guestHand as playerHand, hostHand as aiHand
        if (isHost) {
          if (data.hostHand) setPlayerHand(data.hostHand);
          if (data.guestHand) setAiHand(data.guestHand);
          if (data.hostMelds) setPlayerMelds(data.hostMelds.map((cards: Card[]) => ({ cards, type: 'set' as const })));
          if (data.guestMelds) setAiMelds(data.guestMelds.map((cards: Card[]) => ({ cards, type: 'set' as const })));
        } else {
          if (data.guestHand) setPlayerHand(data.guestHand);
          if (data.hostHand) setAiHand(data.hostHand);
          if (data.guestMelds) setPlayerMelds(data.guestMelds.map((cards: Card[]) => ({ cards, type: 'set' as const })));
          if (data.hostMelds) setAiMelds(data.hostMelds.map((cards: Card[]) => ({ cards, type: 'set' as const })));
        }

        // Map currentPlayer
        if (data.currentPlayer) {
          const isMyTurn = (isHost && data.currentPlayer === 'host') || (!isHost && data.currentPlayer === 'guest');
          setCurrentPlayer(isMyTurn ? 'player' : 'ai');
        }
        if (data.phase) setPhase(data.phase);

        if (data.status === 'finished' && data.winner) {
          const didIWin = (isHost && data.winner === 'host') || (!isHost && data.winner === 'guest');
          setGameStatus(didIWin ? 'won' : 'lost');
        }
      }
    });

    return () => off(gameRef);
  }, [isMultiplayer, multiplayerGameId, isHost]);

  // Sync to Firebase when state changes (multiplayer)
  const syncToFirebase = useCallback(() => {
    if (!isMultiplayer || !multiplayerGameId) return;

    import('firebase/database').then(({ update }) => {
      const gameRef = ref(database, `games/${multiplayerGameId}`);
      const updateData: any = {
        deck,
        discardPile,
        currentPlayer: currentPlayer === 'player' ? (isHost ? 'host' : 'guest') : (isHost ? 'guest' : 'host'),
        phase,
        lastActivity: Date.now()
      };

      if (isHost) {
        updateData.hostHand = playerHand;
        updateData.hostMelds = playerMelds.map(m => m.cards);
      } else {
        updateData.guestHand = playerHand;
        updateData.guestMelds = playerMelds.map(m => m.cards);
      }

      update(gameRef, updateData);
    });
  }, [isMultiplayer, multiplayerGameId, deck, discardPile, playerHand, playerMelds, currentPlayer, phase, isHost]);

  // AI Turn
  useEffect(() => {
    if (isMultiplayer || gameStatus !== 'playing' || showStartModal) return;
    if (currentPlayer !== 'ai') return;

    const timer = setTimeout(() => {
      makeAITurn();
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentPlayer, phase, gameStatus, showStartModal, isMultiplayer]);

  // AI Logic
  const makeAITurn = () => {
    if (phase === 'draw') {
      // AI draws - prefer discard if it helps form meld
      const topDiscard = discardPile[discardPile.length - 1];
      let shouldTakeDiscard = false;

      if (topDiscard && aiSkill >= 2) {
        // Check if discard helps form a meld
        const testHand = [...aiHand, topDiscard];
        for (let i = 0; i < testHand.length - 2; i++) {
          for (let j = i + 1; j < testHand.length - 1; j++) {
            for (let k = j + 1; k < testHand.length; k++) {
              const testMeld = [testHand[i], testHand[j], testHand[k]];
              if (testMeld.some(c => c.id === topDiscard.id) && isValidMeld(testMeld).valid) {
                shouldTakeDiscard = true;
                break;
              }
            }
            if (shouldTakeDiscard) break;
          }
          if (shouldTakeDiscard) break;
        }
      }

      if (shouldTakeDiscard && topDiscard) {
        // Take from discard
        const newDiscard = [...discardPile];
        newDiscard.pop();
        setDiscardPile(newDiscard);
        setAiHand(prev => [...prev, topDiscard]);
      } else {
        // Draw from deck
        if (deck.length > 0) {
          const newDeck = [...deck];
          const drawn = newDeck.pop()!;
          setDeck(newDeck);
          setAiHand(prev => [...prev, drawn]);
        }
      }

      setPhase('play');

      // Continue AI turn after draw
      setTimeout(() => {
        aiPlayPhase();
      }, 800);
    }
  };

  const aiPlayPhase = () => {
    const hand = [...aiHand];

    // Try to form melds
    const newMelds: Meld[] = [];
    const usedIndices = new Set<number>();

    // Find sets
    for (let v = 1; v <= 13; v++) {
      const sameValue = hand.filter((c, i) => c.value === v && !usedIndices.has(i));
      if (sameValue.length >= 3) {
        const meldCards = sameValue.slice(0, Math.min(4, sameValue.length));
        newMelds.push({ cards: meldCards, type: 'set' });
        meldCards.forEach(c => {
          const idx = hand.findIndex((h, i) => h.id === c.id && !usedIndices.has(i));
          if (idx !== -1) usedIndices.add(idx);
        });
      }
    }

    // Find runs
    for (const suit of SUITS) {
      const suitCards = hand.filter((c, i) => c.suit === suit && !usedIndices.has(i))
        .sort((a, b) => a.value - b.value);

      let runStart = 0;
      for (let i = 1; i <= suitCards.length; i++) {
        if (i === suitCards.length || suitCards[i].value !== suitCards[i - 1].value + 1) {
          const runLength = i - runStart;
          if (runLength >= 3) {
            const runCards = suitCards.slice(runStart, i);
            newMelds.push({ cards: runCards, type: 'run' });
            runCards.forEach(c => {
              const idx = hand.findIndex((h, hi) => h.id === c.id && !usedIndices.has(hi));
              if (idx !== -1) usedIndices.add(idx);
            });
          }
          runStart = i;
        }
      }
    }

    // Apply melds
    if (newMelds.length > 0) {
      setAiMelds(prev => [...prev, ...newMelds]);
      const meldCardIds = new Set(newMelds.flatMap(m => m.cards.map(c => c.id)));
      const newHand = hand.filter(c => !meldCardIds.has(c.id));
      setAiHand(newHand);

      // Check for win
      if (newHand.length === 0) {
        setGameStatus('lost');
        onGameEnd(10, 5);
        return;
      }
    }

    // Discard worst card
    const handToDiscard = aiHand.filter((_, i) => !usedIndices.has(i));
    if (handToDiscard.length > 0) {
      // Discard highest point card that doesn't help melds
      const cardToDiscard = handToDiscard.reduce((worst, card) =>
        getCardPoints(card) > getCardPoints(worst) ? card : worst
        , handToDiscard[0]);

      setAiHand(prev => prev.filter(c => c.id !== cardToDiscard.id));
      setDiscardPile(prev => [...prev, cardToDiscard]);
    }

    setCurrentPlayer('player');
    setPhase('draw');
    setMessage('Dein Zug! Ziehe eine Karte.');
  };

  // Player draws
  const drawFromDeck = () => {
    if (currentPlayer !== 'player' || phase !== 'draw') return;
    if (deck.length === 0) {
      // Reshuffle discard pile
      if (discardPile.length > 1) {
        const topCard = discardPile[discardPile.length - 1];
        const reshuffled = shuffleDeck(discardPile.slice(0, -1));
        setDeck(reshuffled);
        setDiscardPile([topCard]);
      }
      return;
    }

    const newDeck = [...deck];
    const drawn = newDeck.pop()!;
    setDeck(newDeck);
    setPlayerHand(prev => sortHand([...prev, drawn]));
    setPhase('play');
    setMessage('Lege Karten ab oder wirf eine Karte weg.');

    // Sync multiplayer
    if (isMultiplayer) setTimeout(syncToFirebase, 100);
  };

  const drawFromDiscard = () => {
    if (currentPlayer !== 'player' || phase !== 'draw') return;
    if (discardPile.length === 0) return;

    const newDiscard = [...discardPile];
    const drawn = newDiscard.pop()!;
    setDiscardPile(newDiscard);
    setPlayerHand(prev => sortHand([...prev, drawn]));
    setPhase('play');
    setMessage('Lege Karten ab oder wirf eine Karte weg.');

    // Sync multiplayer
    if (isMultiplayer) setTimeout(syncToFirebase, 100);
  };

  // Toggle card selection
  const toggleCardSelection = (cardId: string) => {
    if (currentPlayer !== 'player' || phase !== 'play') return;

    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Try to meld selected cards
  const meldSelectedCards = () => {
    if (selectedCards.size < 3) {
      setMessage('Mindestens 3 Karten für eine Kombination!');
      return;
    }

    const cards = playerHand.filter(c => selectedCards.has(c.id));
    const result = isValidMeld(cards);

    if (result.valid && result.type) {
      setPlayerMelds(prev => [...prev, { cards, type: result.type! }]);
      setPlayerHand(prev => prev.filter(c => !selectedCards.has(c.id)));
      setSelectedCards(new Set());

      // Check for win
      const remainingHand = playerHand.filter(c => !selectedCards.has(c.id));
      if (remainingHand.length === 0) {
        setGameStatus('won');
        onGameEnd(50 + levelId * 5, 20 + levelId * 2);
        return;
      }

      setMessage('Kombination gelegt! Weiter oder Karte abwerfen.');

      // Sync multiplayer
      if (isMultiplayer) setTimeout(syncToFirebase, 100);
    } else {
      setMessage('Ungültige Kombination! Braucht 3+ gleiche oder Reihenfolge.');
    }
  };

  // Discard a card
  const discardCard = (cardId: string) => {
    if (currentPlayer !== 'player' || phase !== 'play') return;

    const card = playerHand.find(c => c.id === cardId);
    if (!card) return;

    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    setDiscardPile(prev => [...prev, card]);
    setSelectedCards(new Set());

    // Check for win (shouldn't happen here normally)
    if (playerHand.length === 1) { // After removing this card
      // Need at least one card to discard to end turn, so can't win here
    }

    // In multiplayer, switch to opponent's turn
    if (isMultiplayer) {
      setCurrentPlayer('ai');
      setPhase('draw');
      setMessage(`${opponentName || 'Gegner'} ist am Zug...`);
      setTimeout(syncToFirebase, 100);
    } else {
      setCurrentPlayer('ai');
      setPhase('draw');
      setMessage('KI ist am Zug...');
    }
  };

  // Get hint - shows ad modal
  const getHint = () => {
    setAdTimer(5 + hintCost);
    setShowHintModal(true);
  };

  // Ad timer countdown
  useEffect(() => {
    if (!showHintModal || adTimer <= 0) return;
    const timer = setTimeout(() => setAdTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showHintModal, adTimer]);

  // Claim hint after watching ad
  const claimHint = () => {
    // Find potential melds
    const hints = new Set<string>();

    for (let i = 0; i < playerHand.length - 2; i++) {
      for (let j = i + 1; j < playerHand.length - 1; j++) {
        for (let k = j + 1; k < playerHand.length; k++) {
          const testMeld = [playerHand[i], playerHand[j], playerHand[k]];
          if (isValidMeld(testMeld).valid) {
            testMeld.forEach(c => hints.add(c.id));
          }
        }
      }
    }

    if (hints.size > 0) {
      setHintCards(hints);
      setTimeout(() => setHintCards(new Set()), 3000);
    } else {
      setMessage('Keine Kombination gefunden. Ziehe weiter Karten!');
    }

    setHintCost(prev => prev + 5);
    setShowHintModal(false);
  };

  // Game mode color
  const modeColor = '#059669'; // Emerald for Rummy

  // Render realistic playing card - NEO BRUTAL RETRO STYLE
  const renderCard = (card: Card, onClick?: () => void, isSelected?: boolean, isHint?: boolean) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const color = isRed ? '#FF006E' : '#000'; // Neon Pink for red suits, Black for black suits

    return (
      <div
        key={card.id}
        onClick={onClick}
        className={`relative cursor-pointer transition-all duration-200 select-none
          ${isSelected ? '-translate-y-6 rotate-2 scale-110 z-50' : 'hover:-translate-y-2 hover:rotate-1 hover:scale-105 z-10'}
        `}
        style={{
          width: '75px',
          height: '105px',
          background: isHint
            ? '#06FFA5' // Green for hints
            : '#FFF',
          borderRadius: '4px', // Less rounded
          border: isSelected ? '4px solid #FFBE0B' : isHint ? '4px solid #06FFA5' : '3px solid #000',
          boxShadow: isSelected
            ? '8px 8px 0px rgba(0,0,0,1)'
            : isHint
              ? '6px 6px 0px #06FFA5'
              : '4px 4px 0px #000',
          transform: isSelected ? 'skew(-2deg)' : 'none'
        }}
      >
        {/* Hint glow overlay - Retro scanline */}
        {isHint && (
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse" style={{backgroundImage: 'linear-gradient(transparent 50%, rgba(0,0,0,0.5) 50%)', backgroundSize: '100% 4px'}}></div>
        )}

        {/* Top left corner */}
        <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
          <span style={{ color, fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
            {VALUE_DISPLAY[card.value]}
          </span>
          <span style={{ color, fontSize: '16px', marginTop: '-2px' }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>

        {/* Center symbol - Big & Bold */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color, fontSize: '42px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))' }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>

        {/* Bottom right corner (rotated) */}
        <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
          <span style={{ color, fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
            {VALUE_DISPLAY[card.value]}
          </span>
          <span style={{ color, fontSize: '16px', marginTop: '-2px' }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>
      </div>
    );
  };

  // Render card back with elegant pattern - NEO BRUTAL STYLE
  const renderCardBack = () => (
    <div
      style={{
        width: '75px',
        height: '105px',
        background: '#3B82F6', // Bright Blue
        borderRadius: '4px',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Retro pattern */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-40"
        style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #3B82F6 25%, #3B82F6 75%, #000 75%, #000)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px'
        }}
      >
      </div>
       <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-black rotate-45 border-2 border-white flex items-center justify-center shadow-[4px_4px_0px_#FFF]">
                 <span className="text-white -rotate-45 font-black text-xl">L</span>
            </div>
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FFF8E7] pb-safe">
      <div className="min-h-full p-4 pb-32 geo-pattern geo-shapes">
       {/* Rainbow Top Bar */}
      <div className="fixed top-0 left-0 right-0 flex h-3 w-full z-[60]">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10 pt-6">
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center bg-[#FF006E] border-3 border-black transition-all hover:-translate-y-1 active:translate-y-0"
          style={{ boxShadow: '4px 4px 0px #000' }}
        >
          <ArrowLeft size={24} className="text-black" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FFBE0B] px-4 py-2 border-3 border-black font-black" style={{ boxShadow: '4px 4px 0px #000' }}>
            <Coins size={20} className="text-black" />
            <span className="text-black text-lg">{user.coins}</span>
          </div>

          {!isMultiplayer && (
            <div className="px-4 py-2 border-3 border-black font-black text-white" style={{ background: '#8338EC', boxShadow: '4px 4px 0px #000' }}>
              LEVEL {levelId}
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center mb-4 relative z-10">
          <span className="inline-block bg-[#06FFA5] text-black px-6 py-3 border-3 border-black text-sm font-black uppercase tracking-wider transform -rotate-1" style={{ boxShadow: '6px 6px 0px #000' }}>
            {message}
          </span>
        </div>
      )}

      {/* Game Table - Neo-Brutalist */}
      <div
        className="max-w-4xl mx-auto p-5 md:p-8 mt-4 relative"
        style={{
          background: '#FFF8E7',
          border: '4px solid #000',
          boxShadow: '8px 8px 0px #000'
        }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-r-4 border-b-4 border-black bg-[#FF006E]" style={{boxShadow: '4px 4px 0px #000'}}></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-l-4 border-b-4 border-black bg-[#06FFA5]" style={{boxShadow: '-4px 4px 0px #000'}}></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-r-4 border-t-4 border-black bg-[#FFBE0B]" style={{boxShadow: '4px -4px 0px #000'}}></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-l-4 border-t-4 border-black bg-[#8338EC]" style={{boxShadow: '-4px -4px 0px #000'}}></div>

        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-4 py-3 mb-6 border-4 border-black"
          style={{ background: modeColor, boxShadow: '4px 4px 0px #000' }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">🃏</span>
            <span className="font-black text-white uppercase text-lg tracking-wider drop-shadow-[2px_2px_0px_#000]">ROMMÉ</span>
          </div>
          <div
            className={`px-4 py-2 font-black text-sm uppercase border-3 border-black ${currentPlayer === 'player' ? 'bg-[#06FFA5] text-black' : 'bg-white text-black'
              }`}
            style={{boxShadow: '2px 2px 0px #000'}}
          >
            {currentPlayer === 'player' ? 'DEIN ZUG' : (isMultiplayer ? opponentName?.toUpperCase() : 'KI DENKT')}
          </div>
        </div>

        {/* AI Area */}
        <div className="mb-6 p-4 border-3 border-black relative" style={{ background: '#E5E5E5', boxShadow: '6px 6px 0px #000' }}>
           {/* Scanline pattern overlay */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(transparent 50%, #000 50%)', backgroundSize: '100% 4px'}}></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="px-3 py-1 bg-black text-white font-black uppercase text-sm transform -rotate-1 inline-block border-2 border-white">
                {isMultiplayer ? opponentName : '🤖 KI'} ({aiHand.length} Karten)
            </div>
            {currentPlayer === 'ai' && <span className="px-3 py-1 bg-[#FF006E] text-white border-2 border-black font-black animate-pulse">💭 Denkt...</span>}
          </div>
          <div className="flex gap-1 flex-wrap justify-center relative z-10">
            {aiHand.map((_, i) => (
              <div key={i} style={{ marginLeft: i > 0 ? '-40px' : '0' }}>{renderCardBack()}</div>
            ))}
          </div>
          {aiMelds.length > 0 && (
            <div className="mt-4 flex gap-4 flex-wrap justify-center relative z-10 p-2 border-2 border-black border-dashed bg-white/50">
              {aiMelds.map((meld, mi) => (
                <div key={mi} className="flex -space-x-8 p-2">
                  {meld.cards.map((c, ci) => <div key={c.id} style={{ marginLeft: ci > 0 ? '-30px' : '0', transform: 'scale(0.8)' }}>{renderCard(c)}</div>)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center - Deck and Discard */}
        <div className="flex justify-center gap-16 items-center py-8 bg-[#FFBE0B] border-4 border-black mb-6" style={{boxShadow: 'inest 0 0 20px rgba(0,0,0,0.1)'}}>
          {/* Deck Stack */}
          <div className="text-center relative group">
            <div className="relative transition-transform duration-200 group-hover:-translate-y-2">
              {/* Stack effect */}
              <div className="absolute top-2 left-2">{renderCardBack()}</div>
              <div className="absolute top-1 left-1">{renderCardBack()}</div>
              <div
                onClick={drawFromDeck}
                className={`relative cursor-pointer transition-all duration-200 ${currentPlayer === 'player' && phase === 'draw' ? 'hover:scale-105 active:scale-95' : 'opacity-80'}`}
              >
                {renderCardBack()}
              </div>
            </div>
            <span className="inline-block mt-4 px-2 py-1 bg-black text-white text-xs font-black uppercase border-2 border-white -rotate-2">Stapel ({deck.length})</span>
          </div>

          {/* Discard Pile */}
          <div className="text-center group">
            <div
              onClick={drawFromDiscard}
              className={`cursor-pointer transition-transform duration-200 group-hover:-translate-y-2 ${currentPlayer === 'player' && phase === 'draw' && discardPile.length > 0 ? 'hover:scale-105 active:scale-95' : ''}`}
            >
              {discardPile.length > 0
                ? renderCard(discardPile[discardPile.length - 1])
                : <div style={{ width: '75px', height: '105px', border: '3px dashed #000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '12px', fontWeight: 'bold', background: 'rgba(255,255,255,0.5)' }}>LEER</div>
              }
            </div>
            <span className="inline-block mt-4 px-2 py-1 bg-black text-white text-xs font-black uppercase border-2 border-white rotate-2">Ablage</span>
          </div>
        </div>

        {/* Player Melds */}
        {playerMelds.length > 0 && (
          <div className="mb-4 p-4 border-3 border-black bg-[#8338EC] relative" style={{boxShadow: '6px 6px 0px #000'}}>
             <div className="absolute -top-3 left-4 px-3 py-1 bg-[#06FFA5] border-2 border-black text-xs font-black uppercase text-black transform -rotate-1">
                ✨ Deine Kombinationen
             </div>
            <div className="flex gap-6 flex-wrap justify-center mt-2">
              {playerMelds.map((meld, mi) => (
                <div key={mi} className="flex -space-x-8 p-2 bg-black/20 rounded border-2 border-black">
                  {meld.cards.map((c, ci) => <div key={c.id} style={{ marginLeft: ci > 0 ? '-35px' : '0' }}>{renderCard(c)}</div>)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Hand */}
        <div className="p-6 border-4 border-black bg-[#1F2937] relative" style={{ boxShadow: '8px 8px 0px #000' }}>
           {/* Striped Background */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(-45deg, #000, #000 10px, transparent 10px, transparent 20px)'}}></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="px-4 py-2 bg-white border-3 border-black font-black uppercase text-sm text-black shadow-[4px_4px_0px_#000]">
                🃏 Deine Karten ({playerHand.length})
            </span>
            {currentPlayer === 'player' && (
              <span className={`px-4 py-2 text-xs font-black border-3 border-black transform rotate-1 ${phase === 'draw' ? 'bg-[#0096FF] text-white' : 'bg-[#FFBE0B] text-black'}`}
                style={{ boxShadow: '4px 4px 0px #000' }}>
                {phase === 'draw' ? '👆 KARTE ZIEHEN' : '✋ KARTE ABLEGEN'}
              </span>
            )}
          </div>

          {/* Fan-style card display */}
          <div className="flex justify-center items-end py-6 relative z-10" style={{ minHeight: '140px' }}>
            {playerHand.map((card, index) => {
              const totalCards = playerHand.length;
              const middleIndex = (totalCards - 1) / 2;
              const offset = index - middleIndex;
              const rotation = offset * 4; // 4 degrees per card (more spread)
              const translateY = Math.abs(offset) * 4; // slight curve

              return (
                <div
                  key={card.id}
                  onClick={() => phase === 'play' && toggleCardSelection(card.id)}
                  style={{
                    marginLeft: index > 0 ? '-35px' : '0', // Less overlap for visibility
                    transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                    transformOrigin: 'bottom center',
                    zIndex: selectedCards.has(card.id) ? 100 : index,
                    cursor: phase === 'play' ? 'pointer' : 'default'
                  }}
                >
                  {renderCard(card, undefined, selectedCards.has(card.id), hintCards.has(card.id))}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {phase === 'play' && currentPlayer === 'player' && (
            <div className="flex gap-4 mt-6 justify-center flex-wrap relative z-10">
              {selectedCards.size >= 3 && (
                <button
                  onClick={meldSelectedCards}
                  className="flex items-center gap-2 px-6 py-3 bg-[#06FFA5] hover:bg-[#00D68F] text-black border-3 border-black font-black uppercase transition-all hover:-translate-y-1 active:translate-y-0"
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  <Check size={20} strokeWidth={3} />
                  KOMBINATION LEGEN
                </button>
              )}

              {selectedCards.size === 1 && (
                <button
                  onClick={() => discardCard(Array.from(selectedCards)[0])}
                  className="flex items-center gap-2 px-6 py-3 bg-[#FF006E] hover:bg-[#D60054] text-white border-3 border-black font-black uppercase transition-all hover:-translate-y-1 active:translate-y-0"
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  <X size={20} strokeWidth={3} />
                  ABWERFEN
                </button>
              )}

              <button
                onClick={getHint}
                className="flex items-center gap-2 px-6 py-3 bg-[#FFBE0B] hover:bg-[#E6AB00] text-black border-3 border-black font-black uppercase transition-all hover:-translate-y-1 active:translate-y-0"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                <Lightbulb size={20} strokeWidth={3} />
                HINWEIS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className="bg-[#FFF8E7] p-8 max-w-md w-full border-6 border-black relative"
            style={{ boxShadow: '12px 12px 0px #FF006E', transform: 'rotate(-1deg)' }}
          >
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#FFBE0B] border-4 border-black flex items-center justify-center rotate-12" style={{boxShadow: '4px 4px 0px #000'}}>
                <span className="text-3xl">🃏</span>
            </div>

            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="p-4 bg-[#06FFA5] border-4 border-black" style={{ boxShadow: '6px 6px 0px #000', transform: 'rotate(2deg)' }}>
                <Sparkles size={32} className="text-black" />
              </div>
              <h2 className="text-4xl font-black uppercase text-black tracking-widest" style={{textShadow: '2px 2px 0px #FFF, 4px 4px 0px #000'}}>ROMMÉ</h2>
            </div>

            <div className="bg-white p-5 border-4 border-black mb-6 transform rotate-1" style={{ boxShadow: '6px 6px 0px #000' }}>
              <h3 className="font-black text-lg mb-3 text-black uppercase bg-[#FF006E] text-white inline-block px-2 border-2 border-black">Spielregeln</h3>
              <ul className="text-sm font-bold text-black space-y-2">
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Ziehe vom Stapel oder Ablage</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Bilde 3+ Karten Kombinationen</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Wirf eine Karte ab</li>
                <li className="flex items-center gap-2"><div className="w-2 h-2 bg-black"></div> Ziel: Alle Karten ablegen!</li>
              </ul>
            </div>

            <div className="flex gap-4 mb-6 justify-center bg-black p-3 border-4 border-white transform -rotate-1 shadow-[4px_4px_0px_#000]">
              {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map(suit => (
                <span key={suit} className={`text-3xl ${SUIT_COLORS[suit] === 'text-red-500' ? 'text-[#FF006E]' : 'text-[#06FFA5]'}`}>{SUIT_SYMBOLS[suit]}</span>
              ))}
            </div>

            {!isMultiplayer && (
              <div className="text-center mb-6">
                <span className="bg-[#8338EC] text-white px-6 py-2 border-3 border-black font-black text-xl uppercase transform skew-x-12 inline-block" style={{ boxShadow: '4px 4px 0px #000' }}>LEVEL {levelId}</span>
              </div>
            )}

            <button
              onClick={() => setShowStartModal(false)}
              className="w-full py-5 bg-[#06FFA5] hover:bg-[#00D68F] text-black font-black uppercase text-2xl border-4 border-black transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:translate-y-0"
              style={{ boxShadow: '8px 8px 0px #000' }}
            >
              <Play size={32} strokeWidth={3} />
              SPIEL STARTEN
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div
            className="bg-[#FFF8E7] p-8 max-w-md w-full border-6 border-black relative"
            style={{ boxShadow: '12px 12px 0px #000', transform: 'rotate(1deg)' }}
          >
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center border-4 border-black ${gameStatus === 'won' ? 'bg-[#FFBE0B]' : 'bg-[#FF006E]'}`} style={{boxShadow: '6px 6px 0px #000', transform: 'rotate(-3deg)'}}>
                <Trophy size={48} className="text-black" strokeWidth={2.5} />
              </div>
              <h2 className="text-5xl font-black uppercase mb-2 text-black tracking-wider" style={{textShadow: '3px 3px 0px #FFF'}}>
                {gameStatus === 'won' ? 'GEWONNEN!' : 'VERLOREN!'}
              </h2>
              <div className="bg-white p-4 border-4 border-black mb-8 inline-block transform rotate-2" style={{ boxShadow: '6px 6px 0px #000' }}>
                <p className="text-black font-black text-xl">
                  {gameStatus === 'won'
                    ? `+${50 + levelId * 5} XP • +${20 + levelId * 2} Münzen`
                    : '+10 XP • +5 Münzen'}
                </p>
              </div>

              <div className="flex gap-4 justify-center flex-col sm:flex-row">
                <button
                  onClick={onBack}
                  className="px-6 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase border-4 border-black transition-transform hover:-translate-y-1"
                  style={{ boxShadow: '6px 6px 0px #000' }}
                >
                  MENÜ
                </button>
                {!isMultiplayer && (
                  <button
                    onClick={() => {
                      setGameStatus('playing');
                      setShowStartModal(false);
                      startNewGame();
                    }}
                    className="px-8 py-4 bg-[#06FFA5] hover:bg-[#00D68F] text-black font-black uppercase border-4 border-black transition-transform hover:-translate-y-1"
                    style={{ boxShadow: '6px 6px 0px #000' }}
                  >
                    NOCHMAL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ad/Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 border-6 border-black max-w-sm w-full relative" style={{ boxShadow: '12px 12px 0px #8338EC', transform: 'rotate(-2deg)' }}>
            <h3 className="text-2xl font-black uppercase mb-4 text-black text-center bg-[#FFBE0B] border-3 border-black py-2 shadow-[4px_4px_0px_#000]">HINWEIS FREISCHALTEN</h3>

            {/* Ad with Cat Dance GIF */}
            <div className="w-full h-48 bg-black flex items-center justify-center relative overflow-hidden border-4 border-black mb-6" style={{ boxShadow: '6px 6px 0px #000' }}>
              <img src={catDanceGif} alt="Ad" className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl font-black font-mono text-white drop-shadow-[4px_4px_0px_#FF006E]">
                  {adTimer > 0 ? `${adTimer}` : 'GO!'}
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-[#FF006E] px-3 py-1 text-xs font-black text-white border-2 border-black rotate-3">AD</div>
            </div>

            {hintCost > 0 && (
              <div className="text-center mb-4">
                <span className="bg-[#FF006E] text-white px-4 py-2 text-sm font-black border-3 border-black uppercase transform rotate-1 inline-block">+{hintCost}s Wartezeit</span>
              </div>
            )}

            {/* Skip Button */}
            {adTimer > 0 && (
              <button
                onClick={() => {
                  const skipCost = 30 + hintCost * 2;
                  if (user.coins >= skipCost) {
                    setAdTimer(0);
                  }
                }}
                className="w-full py-4 mb-3 font-black uppercase text-sm flex items-center justify-center gap-2 bg-[#FFBE0B] text-black border-4 border-black hover:bg-[#FFD60A] transition-transform active:translate-y-1"
                style={{ boxShadow: '6px 6px 0px #000', opacity: user.coins >= (30 + hintCost * 2) ? 1 : 0.5 }}
              >
                <Gem size={20} strokeWidth={2.5} /> SKIP ({30 + hintCost * 2} Coins)
              </button>
            )}

            <button
              disabled={adTimer > 0}
              onClick={claimHint}
              className="w-full py-4 font-black uppercase text-lg border-4 border-black transition-all"
              style={{
                background: adTimer > 0 ? '#E5E5E5' : '#06FFA5',
                color: adTimer > 0 ? '#999' : '#000',
                boxShadow: adTimer > 0 ? 'none' : '6px 6px 0px #000',
                transform: adTimer > 0 ? 'none' : 'translateY(-2px)',
                cursor: adTimer > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {adTimer > 0 ? 'BITTE WARTEN...' : 'HINWEIS ANSEHEN'}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default RummyGame;
