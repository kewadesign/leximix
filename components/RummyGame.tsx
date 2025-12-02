import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Lightbulb, Coins, Play, Trophy, Plus, Check, X, Sparkles, Gem, Zap, Sun, Moon } from 'lucide-react';
import { startGamePolling, makeGameMove } from '../utils/gamePolling';
import { Language, UserState, GameMode } from '../types';
import { TRANSLATIONS } from '../constants';
import catDanceGif from '../assets/cat-dance.gif';
import { getPlayingCardAssetPath, Suit as CardSuit, CardValue as CardVal } from '../utils/playingCardAssets';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card { suit: Suit; value: CardValue; id: string; }
interface Meld { cards: Card[]; type: 'set' | 'run'; }

interface RummyGameProps {
  language: Language;
  user: UserState;
  onGameEnd: (xp: number, coins: number) => void;
  onBack: () => void;
  multiplayerGameId?: string | null;
  opponentName?: string | null;
  isHost?: boolean;
  levelId?: number;
  onThemeToggle?: () => void;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS: Record<Suit, string> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const VALUE_DISPLAY: Record<CardValue, string> = { 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K' };

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value: value as CardValue, id: `${suit}-${value}` });
    }
  }
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value: value as CardValue, id: `${suit}-${value}-2` });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const isValidSet = (cards: Card[]): boolean => {
  if (cards.length < 3 || cards.length > 4) return false;
  const value = cards[0].value;
  const suits = new Set(cards.map(c => c.suit));
  return cards.every(c => c.value === value) && suits.size === cards.length;
};

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

const isValidMeld = (cards: Card[]): { valid: boolean; type: 'set' | 'run' | null } => {
  if (isValidSet(cards)) return { valid: true, type: 'set' };
  if (isValidRun(cards)) return { valid: true, type: 'run' };
  return { valid: false, type: null };
};

const getCardPoints = (card: Card): number => {
  if (card.value === 1) return 11;
  if (card.value >= 10) return 10;
  return card.value;
};

const getAISkill = (levelId: number): number => {
  if (levelId <= 15) return 1;
  if (levelId <= 40) return 2;
  if (levelId <= 75) return 3;
  return 4;
};

export const RummyGame: React.FC<RummyGameProps> = ({
  language, user, onGameEnd, onBack, multiplayerGameId, opponentName, isHost = true, levelId = 1, onThemeToggle
}) => {
  // Theme colors
  const isDark = user.theme === 'dark';
  const B = isDark ? '#FFF' : '#000'; // Border color
  const bgMain = isDark ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(180deg, #FFF8E7 0%, #FFF 100%)';
  const bgSurface = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const bgCard = isDark ? '#2a2a4a' : '#FFF';

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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const isMultiplayer = !!multiplayerGameId;
  const aiSkill = getAISkill(levelId);

  useEffect(() => { if (!showStartModal) startNewGame(); }, [showStartModal]);

  const startNewGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck.slice(27));
    setPlayerHand(sortHand(newDeck.slice(0, 13)));
    setAiHand(newDeck.slice(13, 26));
    setDiscardPile(newDeck.slice(26, 27));
    setPlayerMelds([]); setAiMelds([]); setSelectedCards(new Set());
    setCurrentPlayer('player'); setPhase('draw'); setGameStatus('playing');
    setMessage('Ziehe eine Karte!');
  };

  const sortHand = (hand: Card[]): Card[] => [...hand].sort((a, b) => a.suit !== b.suit ? SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit) : a.value - b.value);

  // Multiplayer sync (polling)
  useEffect(() => {
    if (!isMultiplayer || !multiplayerGameId) return;
    
    const cleanup = startGamePolling(multiplayerGameId, (data: any) => {
      if (data.deck) setDeck(data.deck);
      if (data.discardPile) setDiscardPile(data.discardPile);
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
      if (data.currentPlayer) {
        const isMyTurn = (isHost && data.currentPlayer === 'host') || (!isHost && data.currentPlayer === 'guest');
        setCurrentPlayer(isMyTurn ? 'player' : 'ai');
      }
      if (data.phase) setPhase(data.phase);
      if (data.status === 'finished' && data.winner) {
        setGameStatus((isHost && data.winner === 'host') || (!isHost && data.winner === 'guest') ? 'won' : 'lost');
      }
    });
    
    return cleanup;
  }, [isMultiplayer, multiplayerGameId, isHost]);

  const syncToFirebase = useCallback(() => {
    if (!isMultiplayer || !multiplayerGameId) return;
    const updateData: any = { deck, discardPile, currentPlayer: currentPlayer === 'player' ? (isHost ? 'host' : 'guest') : (isHost ? 'guest' : 'host'), phase, lastActivity: Date.now() };
    if (isHost) { updateData.hostHand = playerHand; updateData.hostMelds = playerMelds.map(m => m.cards); }
    else { updateData.guestHand = playerHand; updateData.guestMelds = playerMelds.map(m => m.cards); }
    makeGameMove(multiplayerGameId, updateData);
  }, [isMultiplayer, multiplayerGameId, deck, discardPile, playerHand, playerMelds, currentPlayer, phase, isHost]);

  // AI Turn
  useEffect(() => {
    if (isMultiplayer || gameStatus !== 'playing' || showStartModal || currentPlayer !== 'ai') return;
    const timer = setTimeout(() => makeAITurn(), 1000);
    return () => clearTimeout(timer);
  }, [currentPlayer, phase, gameStatus, showStartModal, isMultiplayer]);

  const makeAITurn = () => {
    if (phase === 'draw') {
      const topDiscard = discardPile[discardPile.length - 1];
      let shouldTakeDiscard = false;
      if (topDiscard && aiSkill >= 2) {
        const testHand = [...aiHand, topDiscard];
        outer: for (let i = 0; i < testHand.length - 2; i++) {
          for (let j = i + 1; j < testHand.length - 1; j++) {
            for (let k = j + 1; k < testHand.length; k++) {
              if ([testHand[i], testHand[j], testHand[k]].some(c => c.id === topDiscard.id) && isValidMeld([testHand[i], testHand[j], testHand[k]]).valid) {
                shouldTakeDiscard = true; break outer;
              }
            }
          }
        }
      }
      if (shouldTakeDiscard && topDiscard) {
        setDiscardPile(prev => prev.slice(0, -1));
        setAiHand(prev => [...prev, topDiscard]);
      } else if (deck.length > 0) {
        setDeck(prev => prev.slice(0, -1));
        setAiHand(prev => [...prev, deck[deck.length - 1]]);
      }
      setPhase('play');
      setTimeout(() => aiPlayPhase(), 800);
    }
  };

  const aiPlayPhase = () => {
    const hand = [...aiHand];
    const newMelds: Meld[] = [];
    const usedIndices = new Set<number>();

    for (let v = 1; v <= 13; v++) {
      const sameValue = hand.filter((c, i) => c.value === v && !usedIndices.has(i));
      if (sameValue.length >= 3) {
        const meldCards = sameValue.slice(0, Math.min(4, sameValue.length));
        newMelds.push({ cards: meldCards, type: 'set' });
        meldCards.forEach(c => { const idx = hand.findIndex((h, i) => h.id === c.id && !usedIndices.has(i)); if (idx !== -1) usedIndices.add(idx); });
      }
    }

    for (const suit of SUITS) {
      const suitCards = hand.filter((c, i) => c.suit === suit && !usedIndices.has(i)).sort((a, b) => a.value - b.value);
      let runStart = 0;
      for (let i = 1; i <= suitCards.length; i++) {
        if (i === suitCards.length || suitCards[i].value !== suitCards[i - 1].value + 1) {
          if (i - runStart >= 3) {
            const runCards = suitCards.slice(runStart, i);
            newMelds.push({ cards: runCards, type: 'run' });
            runCards.forEach(c => { const idx = hand.findIndex((h, hi) => h.id === c.id && !usedIndices.has(hi)); if (idx !== -1) usedIndices.add(idx); });
          }
          runStart = i;
        }
      }
    }

    if (newMelds.length > 0) {
      setAiMelds(prev => [...prev, ...newMelds]);
      const meldCardIds = new Set(newMelds.flatMap(m => m.cards.map(c => c.id)));
      const newHand = hand.filter(c => !meldCardIds.has(c.id));
      setAiHand(newHand);
      if (newHand.length === 0) { setGameStatus('lost'); onGameEnd(10, 5); return; }
    }

    const handToDiscard = aiHand.filter((_, i) => !usedIndices.has(i));
    if (handToDiscard.length > 0) {
      const cardToDiscard = handToDiscard.reduce((worst, card) => getCardPoints(card) > getCardPoints(worst) ? card : worst, handToDiscard[0]);
      setAiHand(prev => prev.filter(c => c.id !== cardToDiscard.id));
      setDiscardPile(prev => [...prev, cardToDiscard]);
    }
    setCurrentPlayer('player'); setPhase('draw'); setMessage('Dein Zug! 🃏');
  };

  const drawFromDeck = () => {
    if (currentPlayer !== 'player' || phase !== 'draw') return;
    if (deck.length === 0) { if (discardPile.length > 1) { setDeck(shuffleDeck(discardPile.slice(0, -1))); setDiscardPile([discardPile[discardPile.length - 1]]); } return; }
    setDeck(prev => prev.slice(0, -1));
    setPlayerHand(prev => sortHand([...prev, deck[deck.length - 1]]));
    setPhase('play'); setMessage('Lege ab oder wirf! ✨');
    if (isMultiplayer) setTimeout(syncToFirebase, 100);
  };

  const drawFromDiscard = () => {
    if (currentPlayer !== 'player' || phase !== 'draw' || discardPile.length === 0) return;
    const drawn = discardPile[discardPile.length - 1];
    setDiscardPile(prev => prev.slice(0, -1));
    setPlayerHand(prev => sortHand([...prev, drawn]));
    setPhase('play'); setMessage('Lege ab oder wirf! ✨');
    if (isMultiplayer) setTimeout(syncToFirebase, 100);
  };

  const toggleCardSelection = (cardId: string) => {
    if (currentPlayer !== 'player' || phase !== 'play') return;
    setSelectedCards(prev => { const newSet = new Set(prev); if (newSet.has(cardId)) newSet.delete(cardId); else newSet.add(cardId); return newSet; });
  };

  const meldSelectedCards = () => {
    if (selectedCards.size < 3) { setMessage('Min. 3 Karten! ⚠️'); return; }
    const cards = playerHand.filter(c => selectedCards.has(c.id));
    const result = isValidMeld(cards);
    if (result.valid && result.type) {
      setPlayerMelds(prev => [...prev, { cards, type: result.type! }]);
      setPlayerHand(prev => prev.filter(c => !selectedCards.has(c.id)));
      setSelectedCards(new Set());
      if (playerHand.filter(c => !selectedCards.has(c.id)).length === 0) { setGameStatus('won'); onGameEnd(50 + levelId * 5, 20 + levelId * 2); return; }
      setMessage('Super! 🎉');
      if (isMultiplayer) setTimeout(syncToFirebase, 100);
    } else { setMessage('Ungültig! ❌'); }
  };

  const discardCard = (cardId: string) => {
    if (currentPlayer !== 'player' || phase !== 'play') return;
    const card = playerHand.find(c => c.id === cardId);
    if (!card) return;
    setPlayerHand(prev => prev.filter(c => c.id !== cardId));
    setDiscardPile(prev => [...prev, card]);
    setSelectedCards(new Set());
    setCurrentPlayer('ai'); setPhase('draw');
    setMessage(isMultiplayer ? `${opponentName || 'Gegner'} ist dran...` : 'KI denkt... 🤖');
    if (isMultiplayer) setTimeout(syncToFirebase, 100);
  };

  const getHint = () => { setAdTimer(5 + hintCost); setShowHintModal(true); };

  useEffect(() => {
    if (!showHintModal || adTimer <= 0) return;
    const timer = setTimeout(() => setAdTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showHintModal, adTimer]);

  const claimHint = () => {
    const hints = new Set<string>();
    for (let i = 0; i < playerHand.length - 2; i++) {
      for (let j = i + 1; j < playerHand.length - 1; j++) {
        for (let k = j + 1; k < playerHand.length; k++) {
          const testMeld = [playerHand[i], playerHand[j], playerHand[k]];
          if (isValidMeld(testMeld).valid) testMeld.forEach(c => hints.add(c.id));
        }
      }
    }
    if (hints.size > 0) { setHintCards(hints); setTimeout(() => setHintCards(new Set()), 3000); }
    else { setMessage('Keine Kombi! 🔍'); }
    setHintCost(prev => prev + 5); setShowHintModal(false);
  };

  // CARD RENDER
  const renderCard = (card: Card, onClick?: () => void, isSelected?: boolean, isHint?: boolean, size: 'xs' | 'sm' | 'md' = 'md') => {
    const cardImagePath = getPlayingCardAssetPath(card.suit as CardSuit, card.value as CardVal);
    const isHovered = hoveredCard === card.id;
    const sizes = { xs: { w: 40, h: 56 }, sm: { w: 52, h: 73 }, md: { w: 65, h: 91 } };
    const s = sizes[size];

    return (
      <div
        key={card.id}
        onClick={onClick}
        onMouseEnter={() => setHoveredCard(card.id)}
        onMouseLeave={() => setHoveredCard(null)}
        className="relative cursor-pointer select-none"
        style={{
          width: s.w, height: s.h, borderRadius: '8px',
          border: isSelected ? '4px solid #FFBE0B' : isHint ? '4px solid #06FFA5' : `3px solid ${B}`,
          boxShadow: isSelected ? `0 0 0 2px ${B}, 8px 8px 0px #FF006E` : isHint ? `0 0 0 2px ${B}, 6px 6px 0px #06FFA5` : isHovered ? `0 0 0 2px ${B}, 8px 8px 0px #8338EC` : `4px 4px 0px ${B}`,
          overflow: 'hidden',
          transition: 'all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: isSelected ? 'translateY(-16px) rotate(-3deg) scale(1.1)' : isHovered ? 'translateY(-10px) rotate(2deg) scale(1.08)' : 'translateY(0) scale(1)',
          zIndex: isSelected ? 100 : isHovered ? 50 : 1
        }}
      >
        <img src={cardImagePath} alt={`${VALUE_DISPLAY[card.value]} ${card.suit}`} className="w-full h-full object-cover" draggable={false} />
        {isHint && <div className="absolute inset-0 bg-[#06FFA5] opacity-40 animate-pulse" />}
        {isSelected && (
          <>
            <div className="absolute inset-0 bg-[#FFBE0B] opacity-25" />
            <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center font-black text-xs" style={{ background: '#FF006E', color: '#FFF', border: `2px solid ${B}` }}>✓</div>
          </>
        )}
      </div>
    );
  };

  const renderCardBack = (size: 'xs' | 'sm' | 'md' = 'md') => {
    const sizes = { xs: { w: 40, h: 56 }, sm: { w: 52, h: 73 }, md: { w: 65, h: 91 } };
    const s = sizes[size];
    return (
      <div style={{ width: s.w, height: s.h, background: 'linear-gradient(135deg, #8338EC 0%, #3B82F6 100%)', borderRadius: '8px', border: `3px solid ${B}`, boxShadow: `4px 4px 0px ${B}`, position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FFF 0, #FFF 2px, transparent 2px, transparent 8px)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#FFBE0B] flex items-center justify-center" style={{ width: size === 'xs' ? 16 : size === 'sm' ? 22 : 28, height: size === 'xs' ? 16 : size === 'sm' ? 22 : 28, transform: 'rotate(45deg)', border: `2px solid ${B}` }}>
            <span className="font-black" style={{ color: B, transform: 'rotate(-45deg)', fontSize: size === 'xs' ? 8 : size === 'sm' ? 11 : 14 }}>L</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${user.theme} fixed inset-0 z-50 overflow-hidden`} style={{ background: bgMain }}>
      {/* RAINBOW BAR */}
      <div className="fixed top-0 left-0 right-0 flex h-2 z-[60]">
        {['#FF006E', '#FF7F00', '#FFBE0B', '#06FFA5', '#8338EC'].map((c, i) => <div key={i} className="flex-1" style={{ background: c }} />)}
      </div>

      <div className="h-full flex flex-col pt-2">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 mx-2 mt-1 mb-2" style={{
          background: 'linear-gradient(135deg, #FF006E 0%, #FF7F00 100%)',
          border: `4px solid ${B}`, boxShadow: `6px 6px 0px ${B}`, transform: 'skewX(-2deg)'
        }}>
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ background: isDark ? '#1a1a2e' : '#FFF', border: `3px solid ${B}`, boxShadow: `3px 3px 0px ${B}`, transform: 'skewX(2deg) rotate(-3deg)' }}>
            <ArrowLeft size={20} style={{ color: B }} />
          </button>

          <div className="flex items-center gap-2" style={{ transform: 'skewX(2deg)' }}>
            {/* THEME TOGGLE */}
            {onThemeToggle && (
              <button onClick={onThemeToggle} className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: isDark ? '#FFBE0B' : '#1a1a2e', border: `3px solid ${B}`, boxShadow: `3px 3px 0px ${B}`, transform: 'rotate(3deg)' }}>
                {isDark ? <Sun size={18} style={{ color: '#000' }} /> : <Moon size={18} style={{ color: '#FFF' }} />}
              </button>
            )}
            <div className="flex items-center gap-1 px-3 py-1 font-black" style={{ background: '#FFBE0B', border: `3px solid ${B}`, boxShadow: `3px 3px 0px ${B}`, transform: 'rotate(2deg)' }}>
              <Gem size={16} style={{ color: '#000' }} />
              <span style={{ color: '#000' }} className="text-sm">{user.coins}</span>
            </div>
            {!isMultiplayer && (
              <div className="px-3 py-1 font-black text-white text-sm" style={{ background: '#8338EC', border: `3px solid ${B}`, boxShadow: `3px 3px 0px ${B}`, transform: 'rotate(-2deg)' }}>
                LV{levelId}
              </div>
            )}
          </div>
        </div>

        {/* TURN INDICATOR */}
        <div className="flex justify-center mb-2">
          <div className={`px-6 py-2 font-black text-sm uppercase tracking-wider transition-all ${currentPlayer === 'player' ? 'animate-pulse-subtle' : ''}`} style={{
            background: currentPlayer === 'player' ? '#06FFA5' : '#FF006E',
            color: currentPlayer === 'player' ? '#000' : '#FFF',
            border: `4px solid ${B}`, boxShadow: `6px 6px 0px ${B}`, transform: 'skewX(-5deg) rotate(-1deg)'
          }}>
            <span style={{ transform: 'skewX(5deg)', display: 'inline-block' }}>
              {currentPlayer === 'player' ? (phase === 'draw' ? '👆 ZIEHE!' : '✋ SPIELE!') : '🤖 KI...'}
            </span>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="flex justify-center mb-2 px-2">
            <span className="px-4 py-1 text-xs font-black uppercase" style={{ background: '#FFBE0B', color: '#000', border: `3px solid ${B}`, boxShadow: `4px 4px 0px #8338EC`, transform: 'rotate(1deg)' }}>
              {message}
            </span>
          </div>
        )}

        {/* GAME AREA */}
        <div className="flex-1 flex flex-col px-2 pb-2 overflow-hidden">
          {/* AI AREA */}
          <div className="mb-2 p-2" style={{ background: bgSurface, border: `3px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`, borderRadius: '12px' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 font-black text-xs uppercase" style={{ background: '#FF006E', color: '#FFF', border: `2px solid ${B}` }}>
                {isMultiplayer ? opponentName : '🤖 KI'} • {aiHand.length}
              </span>
              {currentPlayer === 'ai' && <span className="px-2 py-0.5 text-xs font-black animate-bounce" style={{ background: isDark ? '#FFF' : '#000', color: isDark ? '#000' : '#FFF' }}>💭</span>}
            </div>
            <div className="flex justify-center overflow-x-auto pb-1">
              {aiHand.map((_, i) => <div key={i} style={{ marginLeft: i > 0 ? -28 : 0, flexShrink: 0 }}>{renderCardBack('sm')}</div>)}
            </div>
            {aiMelds.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap justify-center p-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                {aiMelds.map((meld, mi) => (
                  <div key={mi} className="flex">
                    {meld.cards.map((c, ci) => <div key={c.id} style={{ marginLeft: ci > 0 ? -18 : 0 }}>{renderCard(c, undefined, false, false, 'xs')}</div>)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CENTER - DECK & DISCARD */}
          <div className="flex justify-center items-center gap-8 py-4 mb-2" style={{
            background: 'linear-gradient(135deg, #06FFA5 0%, #FFBE0B 50%, #FF006E 100%)',
            border: `4px solid ${B}`, boxShadow: `8px 8px 0px ${B}`, transform: 'skewX(-1deg)'
          }}>
            <div className="text-center" style={{ transform: 'skewX(1deg)' }}>
              <div onClick={drawFromDeck} className={`relative transition-all ${currentPlayer === 'player' && phase === 'draw' ? 'cursor-pointer hover:-translate-y-3 hover:rotate-3 active:scale-95' : 'opacity-60'}`}>
                <div className="absolute top-1 left-1">{renderCardBack('md')}</div>
                {renderCardBack('md')}
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-black uppercase" style={{ background: B, color: isDark ? '#000' : '#FFF', transform: 'rotate(-3deg)' }}>
                STAPEL ({deck.length})
              </span>
            </div>

            <div className="w-12 h-12 flex items-center justify-center font-black text-lg" style={{ background: isDark ? '#1a1a2e' : '#FFF', border: `4px solid ${B}`, boxShadow: `4px 4px 0px #8338EC`, transform: 'rotate(12deg)', color: B }}>
              VS
            </div>

            <div className="text-center" style={{ transform: 'skewX(1deg)' }}>
              <div onClick={drawFromDiscard} className={`transition-all ${currentPlayer === 'player' && phase === 'draw' && discardPile.length > 0 ? 'cursor-pointer hover:-translate-y-3 hover:-rotate-3 active:scale-95' : ''}`}>
                {discardPile.length > 0 ? renderCard(discardPile[discardPile.length - 1], undefined, false, false, 'md') : (
                  <div className="flex items-center justify-center text-xs font-black" style={{ width: 65, height: 91, border: `3px dashed ${B}`, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', color: B }}>LEER</div>
                )}
              </div>
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-black uppercase" style={{ background: B, color: isDark ? '#000' : '#FFF', transform: 'rotate(3deg)' }}>ABLAGE</span>
            </div>
          </div>

          {/* PLAYER MELDS */}
          {playerMelds.length > 0 && (
            <div className="mb-2 p-2 relative" style={{ background: 'linear-gradient(135deg, #8338EC 0%, #FF006E 100%)', border: `4px solid ${B}`, boxShadow: `6px 6px 0px #FFBE0B`, transform: 'skewX(-1deg)' }}>
              <span className="absolute -top-3 left-3 px-2 py-0.5 text-xs font-black uppercase" style={{ background: '#06FFA5', color: '#000', border: `2px solid ${B}`, transform: 'rotate(-2deg)' }}>✨ KOMBIS</span>
              <div className="flex gap-3 flex-wrap justify-center mt-1" style={{ transform: 'skewX(1deg)' }}>
                {playerMelds.map((meld, mi) => (
                  <div key={mi} className="flex p-1 rounded" style={{ background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.3)' }}>
                    {meld.cards.map((c, ci) => <div key={c.id} style={{ marginLeft: ci > 0 ? -18 : 0 }}>{renderCard(c, undefined, false, false, 'sm')}</div>)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAYER HAND */}
          <div className="flex-1 p-3 flex flex-col" style={{ background: isDark ? 'linear-gradient(180deg, #1F2937 0%, #111827 100%)' : 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)', border: `4px solid #FFBE0B`, boxShadow: `0 -8px 0px #FFBE0B, 8px 8px 0px ${B}`, borderRadius: '16px 16px 0 0' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 font-black uppercase text-sm" style={{ background: '#FFBE0B', color: '#000', border: `3px solid ${B}`, boxShadow: `3px 3px 0px #FF006E`, transform: 'rotate(-2deg)' }}>
                🃏 KARTEN ({playerHand.length})
              </span>
            </div>

            <div className="flex-1 flex justify-center items-center overflow-x-auto py-2">
              {playerHand.map((card, index) => {
                const totalCards = playerHand.length;
                const middleIndex = (totalCards - 1) / 2;
                const offset = index - middleIndex;
                const rotation = totalCards <= 8 ? offset * 4 : offset * 2.5;
                const translateY = Math.abs(offset) * 3;
                return (
                  <div key={card.id} onClick={() => phase === 'play' && toggleCardSelection(card.id)}
                    style={{ marginLeft: index > 0 ? (totalCards > 10 ? -32 : -28) : 0, transform: `rotate(${rotation}deg) translateY(${translateY}px)`, transformOrigin: 'bottom center', zIndex: selectedCards.has(card.id) ? 100 : hoveredCard === card.id ? 50 : index, cursor: phase === 'play' ? 'pointer' : 'default', flexShrink: 0 }}>
                    {renderCard(card, undefined, selectedCards.has(card.id), hintCards.has(card.id), 'md')}
                  </div>
                );
              })}
            </div>

            {phase === 'play' && currentPlayer === 'player' && (
              <div className="flex gap-2 justify-center flex-wrap pt-2">
                {selectedCards.size >= 3 && (
                  <button onClick={meldSelectedCards} className="flex items-center gap-1 px-4 py-2 font-black uppercase text-sm transition-all hover:-translate-y-1 hover:rotate-1 active:scale-95"
                    style={{ background: '#06FFA5', color: '#000', border: `3px solid ${B}`, boxShadow: `4px 4px 0px ${B}` }}>
                    <Check size={18} strokeWidth={3} /> LEGEN
                  </button>
                )}
                {selectedCards.size === 1 && (
                  <button onClick={() => discardCard(Array.from(selectedCards)[0])} className="flex items-center gap-1 px-4 py-2 font-black uppercase text-sm transition-all hover:-translate-y-1 hover:-rotate-1 active:scale-95"
                    style={{ background: '#FF006E', color: '#FFF', border: `3px solid ${B}`, boxShadow: `4px 4px 0px ${B}` }}>
                    <X size={18} strokeWidth={3} /> WEG
                  </button>
                )}
                <button onClick={getHint} className="flex items-center gap-1 px-4 py-2 font-black uppercase text-sm transition-all hover:-translate-y-1 hover:rotate-2 active:scale-95"
                  style={{ background: '#8338EC', color: '#FFF', border: `3px solid ${B}`, boxShadow: `4px 4px 0px #FFBE0B` }}>
                  <Lightbulb size={18} strokeWidth={3} /> TIPP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* START MODAL */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-sm w-full p-5 relative" style={{ background: isDark ? '#1a1a2e' : '#FFF', border: `6px solid ${B}`, boxShadow: `12px 12px 0px #FF006E, 18px 18px 0px ${B}`, transform: 'rotate(-2deg)' }}>
            <div className="absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center font-black text-2xl" style={{ background: '#FFBE0B', border: `4px solid ${B}`, transform: 'rotate(15deg)', boxShadow: `4px 4px 0px ${B}` }}>🃏</div>
            <div className="text-center mb-4">
              <h2 className="text-4xl font-black uppercase tracking-tight" style={{ background: 'linear-gradient(135deg, #FF006E, #8338EC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ROMMÉ</h2>
            </div>
            <div className="p-3 mb-4" style={{ background: '#06FFA5', border: `4px solid ${B}`, boxShadow: `6px 6px 0px #8338EC`, transform: 'rotate(1deg)' }}>
              <h3 className="font-black text-sm mb-2 uppercase inline-block px-2 py-0.5" style={{ background: '#000', color: '#FFF' }}>REGELN</h3>
              <ul className="text-xs font-bold text-black space-y-1">
                <li>📥 Ziehe vom Stapel oder Ablage</li>
                <li>🎴 Bilde 3+ Karten Kombis</li>
                <li>📤 Wirf eine Karte ab</li>
                <li>🏆 Ziel: Alle Karten weg!</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-center py-3 mb-4" style={{ background: B }}>
              {['♥', '♦', '♣', '♠'].map((s, i) => <span key={i} className="text-3xl" style={{ color: i < 2 ? '#FF006E' : '#06FFA5' }}>{s}</span>)}
            </div>
            {!isMultiplayer && (
              <div className="text-center mb-4">
                <span className="px-5 py-2 font-black text-xl uppercase inline-block" style={{ background: '#8338EC', color: '#FFF', border: `4px solid ${B}`, boxShadow: `4px 4px 0px #FFBE0B`, transform: 'skewX(-5deg)' }}>LEVEL {levelId}</span>
              </div>
            )}
            <button onClick={() => setShowStartModal(false)} className="w-full py-4 font-black uppercase text-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-2 hover:rotate-1 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #FF006E 0%, #FF7F00 100%)', color: '#FFF', border: `4px solid ${B}`, boxShadow: `8px 8px 0px ${B}` }}>
              <Zap size={28} strokeWidth={3} /> LOS!
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gameStatus !== 'playing' && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-sm w-full p-5 relative" style={{ background: gameStatus === 'won' ? 'linear-gradient(180deg, #06FFA5 0%, #00D68F 100%)' : 'linear-gradient(180deg, #FF006E 0%, #D60054 100%)', border: `6px solid ${B}`, boxShadow: `12px 12px 0px #FFBE0B, 18px 18px 0px ${B}`, transform: 'rotate(1deg)' }}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ background: isDark ? '#1a1a2e' : '#FFF', border: `4px solid ${B}`, boxShadow: `6px 6px 0px ${B}`, transform: 'rotate(-5deg)' }}>
                <Trophy size={40} style={{ color: B }} />
              </div>
              <h2 className="text-4xl font-black uppercase mb-3 text-white" style={{ textShadow: `4px 4px 0px ${B}` }}>{gameStatus === 'won' ? 'GEWONNEN!' : 'VERLOREN!'}</h2>
              <div className="p-3 mb-5 inline-block" style={{ background: isDark ? '#1a1a2e' : '#FFF', border: `4px solid ${B}`, boxShadow: `6px 6px 0px #8338EC`, transform: 'rotate(-2deg)' }}>
                <p className="font-black text-lg" style={{ color: B }}>{gameStatus === 'won' ? `+${50 + levelId * 5} XP • +${20 + levelId * 2} 💰` : '+10 XP • +5 💰'}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={onBack} className="px-5 py-3 font-black uppercase text-sm transition-all hover:-translate-y-1 active:scale-95"
                  style={{ background: isDark ? '#1a1a2e' : '#FFF', color: B, border: `4px solid ${B}`, boxShadow: `4px 4px 0px ${B}` }}>MENÜ</button>
                {!isMultiplayer && (
                  <button onClick={() => { setGameStatus('playing'); setShowStartModal(false); startNewGame(); }} className="px-5 py-3 font-black uppercase text-sm transition-all hover:-translate-y-1 active:scale-95"
                    style={{ background: '#FFBE0B', color: '#000', border: `4px solid ${B}`, boxShadow: `4px 4px 0px ${B}` }}>NOCHMAL</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HINT MODAL */}
      {showHintModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-xs w-full p-4" style={{ background: isDark ? '#1a1a2e' : '#FFF', border: `6px solid ${B}`, boxShadow: `10px 10px 0px #8338EC`, transform: 'rotate(-1deg)' }}>
            <h3 className="text-xl font-black uppercase mb-3 text-center py-2" style={{ background: '#FFBE0B', color: '#000', border: `3px solid ${B}`, boxShadow: `4px 4px 0px #FF006E` }}>💡 TIPP</h3>
            <div className="w-full h-28 flex items-center justify-center relative overflow-hidden mb-4" style={{ background: '#000', border: `4px solid #FFBE0B` }}>
              <img src={catDanceGif} alt="Ad" className="w-full h-full object-cover opacity-40 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-black text-white" style={{ textShadow: '4px 4px 0px #FF006E' }}>{adTimer > 0 ? adTimer : '✓'}</span>
              </div>
            </div>
            {adTimer > 0 && user.coins >= (30 + hintCost * 2) && (
              <button onClick={() => setAdTimer(0)} className="w-full py-3 mb-2 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background: '#8338EC', color: '#FFF', border: `3px solid ${B}`, boxShadow: `4px 4px 0px #FFBE0B` }}>
                <Gem size={16} /> SKIP ({30 + hintCost * 2} 💰)
              </button>
            )}
            <button disabled={adTimer > 0} onClick={claimHint} className="w-full py-3 font-black uppercase text-sm transition-all"
              style={{ background: adTimer > 0 ? '#CCC' : '#06FFA5', color: adTimer > 0 ? '#888' : '#000', border: `3px solid ${B}`, boxShadow: adTimer > 0 ? 'none' : `4px 4px 0px ${B}`, cursor: adTimer > 0 ? 'not-allowed' : 'pointer' }}>
              {adTimer > 0 ? 'WARTEN...' : 'ZEIGEN!'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RummyGame;
