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

  // Render realistic playing card - BIGGER SIZE
  const renderCard = (card: Card, onClick?: () => void, isSelected?: boolean, isHint?: boolean) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const color = isRed ? '#DC2626' : '#1F2937';

    return (
      <div
        key={card.id}
        onClick={onClick}
        className={`relative cursor-pointer transition-all duration-200 select-none
          ${isSelected ? '-translate-y-4 scale-110' : 'hover:-translate-y-1 hover:scale-102'}
        `}
        style={{
          width: '70px',
          height: '98px',
          background: isHint
            ? 'linear-gradient(145deg, #D1FAE5 0%, #A7F3D0 100%)'
            : 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
          borderRadius: '10px',
          border: isSelected ? '4px solid #FFBE0B' : isHint ? '4px solid #06FFA5' : '2px solid #CCC',
          boxShadow: isSelected
            ? '0 12px 28px rgba(255,190,11,0.5), 0 6px 12px rgba(0,0,0,0.2)'
            : isHint
              ? '0 12px 28px rgba(6,255,165,0.6), 0 6px 12px rgba(0,0,0,0.2), 0 0 20px rgba(6,255,165,0.4)'
              : '0 2px 6px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
          animation: isHint ? 'pulse 1s ease-in-out infinite' : 'none'
        }}
      >
        {/* Hint glow overlay */}
        {isHint && (
          <div className="absolute inset-0 rounded-lg animate-ping" style={{ background: 'rgba(6,255,165,0.3)' }} />
        )}

        {/* Top left corner */}
        <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none">
          <span style={{ color, fontSize: '16px', fontWeight: 800, fontFamily: 'Georgia, serif' }}>
            {VALUE_DISPLAY[card.value]}
          </span>
          <span style={{ color, fontSize: '14px', marginTop: '-2px' }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>

        {/* Center symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color, fontSize: '32px' }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>

        {/* Bottom right corner (rotated) */}
        <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180">
          <span style={{ color, fontSize: '16px', fontWeight: 800, fontFamily: 'Georgia, serif' }}>
            {VALUE_DISPLAY[card.value]}
          </span>
          <span style={{ color, fontSize: '14px', marginTop: '-2px' }}>
            {SUIT_SYMBOLS[card.suit]}
          </span>
        </div>

        {/* Subtle inner border effect */}
        <div
          className="absolute inset-1 pointer-events-none"
          style={{
            border: '1px solid rgba(0,0,0,0.05)',
            borderRadius: '8px'
          }}
        />
      </div>
    );
  };

  // Render card back with elegant pattern - BIGGER SIZE
  const renderCardBack = () => (
    <div
      style={{
        width: '70px',
        height: '98px',
        background: 'linear-gradient(145deg, #1E40AF 0%, #1E3A8A 100%)',
        borderRadius: '8px',
        border: '2px solid #1E3A8A',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Diamond pattern */}
      <div
        className="absolute inset-2 flex items-center justify-center"
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(255,255,255,0.1) 4px,
            rgba(255,255,255,0.1) 8px
          )`,
          borderRadius: '4px',
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)'
          }}
        >
          <span className="text-white/60 text-lg font-black">L</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 geo-pattern">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="p-3 border-3 border-black transition-all hover:-translate-y-1 hover:scale-105"
          style={{ background: modeColor, boxShadow: '4px 4px 0px #000' }}
        >
          <ArrowLeft size={24} className="text-white" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#FFBE0B] px-4 py-2 border-3 border-black font-black" style={{ boxShadow: '3px 3px 0px #000' }}>
            <Coins size={20} className="text-black" />
            <span className="text-black text-lg">{user.coins}</span>
          </div>

          {!isMultiplayer && (
            <div className="px-4 py-2 border-3 border-black font-black text-white" style={{ background: '#8338EC', boxShadow: '3px 3px 0px #000' }}>
              LEVEL {levelId}
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center mb-4">
          <span className="bg-[#059669] text-white px-5 py-3 border-3 border-black text-sm font-black" style={{ boxShadow: '4px 4px 0px #000' }}>{message}</span>
        </div>
      )}

      {/* Game Table - Neo-Brutalist */}
      <div
        className="max-w-4xl mx-auto p-5 md:p-8 mt-4"
        style={{
          background: '#FFF8E7',
          border: '6px solid transparent',
          backgroundImage: 'linear-gradient(#FFF8E7, #FFF8E7), linear-gradient(90deg, #FF006E 0%, #FF7F00 16.66%, #FFBE0B 33.33%, #06FFA5 50%, #0096FF 66.66%, #8338EC 83.33%, #FF006E 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          boxShadow: '8px 8px 0px #000'
        }}
      >
        {/* Title Bar */}
        <div
          className="flex items-center justify-between px-4 py-3 mb-6 border-4 border-black"
          style={{ background: modeColor }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🃏</span>
            <span className="font-black text-white uppercase text-lg">ROMMÉ</span>
          </div>
          <div
            className={`px-4 py-2 font-black text-sm uppercase border-2 border-black ${currentPlayer === 'player' ? 'bg-[#06FFA5] text-black' : 'bg-white text-black'
              }`}
          >
            {currentPlayer === 'player' ? 'DEIN ZUG' : (isMultiplayer ? opponentName?.toUpperCase() : 'KI DENKT')}
          </div>
        </div>
        {/* AI Area */}
        <div className="mb-6 p-4 border-3 border-black" style={{ background: '#E5E5E5', boxShadow: '4px 4px 0px #000' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-black uppercase text-sm text-black">{isMultiplayer ? opponentName : '🤖 KI'} ({aiHand.length} Karten)</span>
            {currentPlayer === 'ai' && <span className="text-[#FF006E] animate-pulse font-black">💭 Denkt...</span>}
          </div>
          <div className="flex gap-1 flex-wrap justify-center">
            {aiHand.map((_, i) => (
              <div key={i} style={{ marginLeft: i > 0 ? '-25px' : '0' }}>{renderCardBack()}</div>
            ))}
          </div>
          {aiMelds.length > 0 && (
            <div className="mt-3 flex gap-3 flex-wrap justify-center">
              {aiMelds.map((meld, mi) => (
                <div key={mi} className="flex -space-x-4 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {meld.cards.map((c, ci) => <div key={c.id} style={{ marginLeft: ci > 0 ? '-20px' : '0', transform: 'scale(0.75)' }}>{renderCard(c)}</div>)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center - Deck and Discard */}
        <div className="flex justify-center gap-12 items-center py-6">
          {/* Deck Stack */}
          <div className="text-center relative">
            <div className="relative">
              {/* Stack effect */}
              <div className="absolute top-1 left-1 opacity-60">{renderCardBack()}</div>
              <div className="absolute top-0.5 left-0.5 opacity-80">{renderCardBack()}</div>
              <div
                onClick={drawFromDeck}
                className={`relative cursor-pointer transition-all duration-200 ${currentPlayer === 'player' && phase === 'draw' ? 'hover:scale-105 hover:-translate-y-1' : 'opacity-50'}`}
              >
                {renderCardBack()}
              </div>
            </div>
            <span className="text-white/80 text-xs mt-2 block font-bold">Stapel ({deck.length})</span>
          </div>

          {/* Discard Pile */}
          <div className="text-center">
            <div
              onClick={drawFromDiscard}
              className={`cursor-pointer transition-all duration-200 ${currentPlayer === 'player' && phase === 'draw' && discardPile.length > 0 ? 'hover:scale-105 hover:-translate-y-1' : ''}`}
            >
              {discardPile.length > 0
                ? renderCard(discardPile[discardPile.length - 1])
                : <div style={{ width: '60px', height: '84px', border: '2px dashed rgba(255,255,255,0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Leer</div>
              }
            </div>
            <span className="text-white/80 text-xs mt-2 block font-bold">Ablage</span>
          </div>
        </div>

        {/* Player Melds */}
        {playerMelds.length > 0 && (
          <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <span className="text-xs font-black uppercase mb-3 block text-white/90">✨ Deine Kombinationen:</span>
            <div className="flex gap-4 flex-wrap justify-center">
              {playerMelds.map((meld, mi) => (
                <div key={mi} className="flex -space-x-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {meld.cards.map((c, ci) => <div key={c.id} style={{ marginLeft: ci > 0 ? '-15px' : '0' }}>{renderCard(c)}</div>)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player Hand */}
        <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-black uppercase text-sm text-white/90">🃏 Deine Karten ({playerHand.length})</span>
            {currentPlayer === 'player' && (
              <span className={`px-4 py-2 text-xs font-black rounded-lg ${phase === 'draw' ? 'bg-blue-500 text-white' : 'bg-yellow-400 text-black'}`}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {phase === 'draw' ? '👆 KARTE ZIEHEN' : '✋ KARTE ABLEGEN'}
              </span>
            )}
          </div>

          {/* Fan-style card display */}
          <div className="flex justify-center items-end py-4" style={{ minHeight: '120px' }}>
            {playerHand.map((card, index) => {
              const totalCards = playerHand.length;
              const middleIndex = (totalCards - 1) / 2;
              const offset = index - middleIndex;
              const rotation = offset * 3; // 3 degrees per card
              const translateY = Math.abs(offset) * 3; // slight curve

              return (
                <div
                  key={card.id}
                  onClick={() => phase === 'play' && toggleCardSelection(card.id)}
                  style={{
                    marginLeft: index > 0 ? '-20px' : '0',
                    transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                    transformOrigin: 'bottom center',
                    zIndex: selectedCards.has(card.id) ? 100 : index
                  }}
                >
                  {renderCard(card, undefined, selectedCards.has(card.id), hintCards.has(card.id))}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {phase === 'play' && currentPlayer === 'player' && (
            <div className="flex gap-3 mt-4 justify-center flex-wrap">
              {selectedCards.size >= 3 && (
                <button
                  onClick={meldSelectedCards}
                  className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase rounded-lg transition-all hover:scale-105"
                  style={{ boxShadow: '0 4px 12px rgba(16,185,129,0.4)' }}
                >
                  <Check size={18} />
                  KOMBINATION LEGEN
                </button>
              )}

              {selectedCards.size === 1 && (
                <button
                  onClick={() => discardCard(Array.from(selectedCards)[0])}
                  className="flex items-center gap-2 px-5 py-3 bg-red-500 hover:bg-red-400 text-white font-black uppercase rounded-lg transition-all hover:scale-105"
                  style={{ boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}
                >
                  <X size={18} />
                  ABWERFEN
                </button>
              )}

              <button
                onClick={getHint}
                className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase rounded-lg transition-all hover:scale-105"
                style={{ boxShadow: '0 4px 12px rgba(251,191,36,0.4)' }}
              >
                <Lightbulb size={18} />
                HINWEIS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#FFF8E7] p-6 max-w-md w-full border-4 border-black"
            style={{ boxShadow: '10px 10px 0px #000' }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-[#059669] border-3 border-black" style={{ boxShadow: '3px 3px 0px #000' }}>
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-3xl font-black uppercase text-black">ROMMÉ</h2>
            </div>

            <div className="bg-white p-4 border-3 border-black mb-4" style={{ boxShadow: '4px 4px 0px #000' }}>
              <h3 className="font-black text-sm mb-2 text-black uppercase">Spielregeln</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Ziehe vom Stapel oder Ablage</li>
                <li>• Bilde 3+ Karten Kombinationen</li>
                <li>• Wirf eine Karte ab</li>
                <li>• Ziel: Alle Karten ablegen!</li>
              </ul>
            </div>

            <div className="flex gap-3 mb-4 justify-center bg-white p-3 border-3 border-black">
              {(['hearts', 'diamonds', 'clubs', 'spades'] as Suit[]).map(suit => (
                <span key={suit} className={`text-3xl ${SUIT_COLORS[suit]}`}>{SUIT_SYMBOLS[suit]}</span>
              ))}
            </div>

            {!isMultiplayer && (
              <div className="text-center mb-4">
                <span className="bg-[#8338EC] text-white px-4 py-2 border-3 border-black font-black" style={{ boxShadow: '3px 3px 0px #000' }}>LEVEL {levelId}</span>
              </div>
            )}

            <button
              onClick={() => setShowStartModal(false)}
              className="w-full py-4 bg-[#06FFA5] hover:bg-emerald-300 text-black font-black uppercase text-xl border-4 border-black transition-all flex items-center justify-center gap-3"
              style={{ boxShadow: '6px 6px 0px #000' }}
            >
              <Play size={28} />
              SPIEL STARTEN
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#FFF8E7] p-6 max-w-md w-full border-4 border-black"
            style={{ boxShadow: '10px 10px 0px #000' }}
          >
            <div className="text-center">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-4 border-black ${gameStatus === 'won' ? 'bg-[#06FFA5]' : 'bg-red-400'}`}>
                <Trophy size={40} className={gameStatus === 'won' ? 'text-black' : 'text-white'} />
              </div>
              <h2 className="text-3xl font-black uppercase mb-2 text-black">
                {gameStatus === 'won' ? 'GEWONNEN!' : 'VERLOREN!'}
              </h2>
              <div className="bg-white p-3 border-3 border-black mb-4 inline-block" style={{ boxShadow: '3px 3px 0px #000' }}>
                <p className="text-black font-bold">
                  {gameStatus === 'won'
                    ? `+${50 + levelId * 5} XP, +${20 + levelId * 2} Münzen`
                    : '+10 XP, +5 Münzen'}
                </p>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-black font-black uppercase border-3 border-black"
                  style={{ boxShadow: '4px 4px 0px #000' }}
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
                    className="px-6 py-3 bg-[#06FFA5] hover:bg-emerald-300 text-black font-black uppercase border-3 border-black"
                    style={{ boxShadow: '4px 4px 0px #000' }}
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 border-4 border-black max-w-sm w-full" style={{ boxShadow: '8px 8px 0px #000' }}>
            <h3 className="text-xl font-black uppercase mb-4 text-black text-center">HINWEIS FREISCHALTEN</h3>

            {/* Ad with Cat Dance GIF */}
            <div className="w-full h-40 bg-black flex items-center justify-center relative overflow-hidden border-4 border-black mb-4" style={{ boxShadow: '4px 4px 0px #000' }}>
              <img src={catDanceGif} alt="Ad" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-5xl font-black font-mono text-white drop-shadow-[4px_4px_0px_#000]">
                  {adTimer > 0 ? `${adTimer}s` : 'FERTIG'}
                </div>
              </div>
              <div className="absolute top-2 right-2 bg-[#FF006E] px-2 py-1 text-[10px] font-black text-white border-2 border-black">AD</div>
            </div>

            {hintCost > 0 && (
              <div className="text-center mb-3">
                <span className="bg-[#FF006E] text-white px-3 py-1 text-xs font-black border-2 border-black">+{hintCost}s Wartezeit</span>
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
                className="w-full py-3 mb-2 font-black uppercase text-sm flex items-center justify-center gap-2 bg-[#FFBE0B] text-black border-3 border-black"
                style={{ boxShadow: '4px 4px 0px #000', opacity: user.coins >= (30 + hintCost * 2) ? 1 : 0.5 }}
              >
                <Gem size={16} /> SKIP ({30 + hintCost * 2} Coins)
              </button>
            )}

            <button
              disabled={adTimer > 0}
              onClick={claimHint}
              className="w-full py-3 font-black uppercase text-sm border-3 border-black"
              style={{
                background: adTimer > 0 ? '#E5E5E5' : '#06FFA5',
                color: adTimer > 0 ? '#999' : '#000',
                boxShadow: adTimer > 0 ? 'none' : '4px 4px 0px #000',
                cursor: adTimer > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {adTimer > 0 ? 'BITTE WARTEN...' : 'HINWEIS ANSEHEN'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RummyGame;
