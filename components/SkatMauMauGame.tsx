import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Coins, Star, Info, Users, Copy, Check, Clock } from 'lucide-react';
import {
  generateDeck,
  drawCards,
  canPlayCard,
  Card,
  CardSuit,
  CardRank,
  getSuitSymbol,
  getSuitColor,
  getSuitName,
  shuffleDeck
} from '../utils/maumau';
import { getCardAssetPath } from '../utils/skatAssets';
import { Modal, Button } from './UI';
import { FriendsModal } from './FriendsModal';
import {
  subscribeToGameState,
  playCardMultiplayer,
  drawCardsMultiplayer,
  cleanupGame,
  MultiplayerGameState
} from '../utils/multiplayerGame';

interface SkatMauMauGameProps {
  onBack: () => void;
  onGameEnd: (coins: number, xp: number) => void;
  friendCode?: string;
  gameId?: string | null;
  opponentUsername?: string | null;
  currentUsername?: string;
}

type GameStatus = 'playing' | 'won' | 'lost';

export default function SkatMauMauGame({
  onBack,
  onGameEnd,
  friendCode,
  gameId,
  opponentUsername,
  currentUsername
}: SkatMauMauGameProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]); // Used as opponent hand in MP
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [wishedSuit, setWishedSuit] = useState<CardSuit | null>(null);
  const [drawCount, setDrawCount] = useState(0);
  const [showWishModal, setShowWishModal] = useState(false);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [isMultiplayerLoading, setIsMultiplayerLoading] = useState(false);

  const isMultiplayer = !!gameId;

  // Multiplayer Subscription
  useEffect(() => {
    if (!gameId || !currentUsername) return;

    setIsMultiplayerLoading(true);

    const unsubscribe = subscribeToGameState(gameId, (state) => {
      if (!state) return;

      // Map Firebase state to local state
      setDeck(state.deck || []);
      setDiscardPile(state.discardPile || []);

      // Ensure wishedSuit is a number if present
      const parsedWish = state.wishedSuit !== null && state.wishedSuit !== undefined
        ? Number(state.wishedSuit)
        : null;
      setWishedSuit(parsedWish as CardSuit);

      setDrawCount(state.drawCount || 0);

      // Hands
      setPlayerHand(state.hands[currentUsername] || []);
      const opponentName = state.players.host === currentUsername ? state.players.guest : state.players.host;
      setAiHand(state.hands[opponentName] || []); // Use aiHand state for opponent

      // Turn
      setCurrentTurn(state.currentTurn === currentUsername ? 'player' : 'ai');

      // Status
      if (state.status === 'finished') {
        if (state.winner === currentUsername) {
          setGameStatus('won');
        } else {
          setGameStatus('lost');
        }
      }
      setIsMultiplayerLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [gameId, currentUsername]);

  const [showChangelog, setShowChangelog] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  // Helper functions defined first to avoid hoisting issues
  const getCurrentTopCard = useCallback(() => discardPile[discardPile.length - 1], [discardPile]);

  const addToDiscard = useCallback((card: Card) => {
    setDiscardPile(prev => [...prev, card]);
  }, []);

  const changeTurn = useCallback(() => {
    setCurrentTurn(prev => prev === 'player' ? 'ai' : 'player');
  }, []);

  const handleCardEffect = useCallback((card: Card, player: 'player' | 'ai', suitWish?: CardSuit) => {
    let nextDrawCount = 0;
    let nextWishedSuit = null;

    if (card.rank === CardRank.SEVEN) {
      nextDrawCount = drawCount + 2;
    }
    else if (card.rank === CardRank.JACK) {
      if (player === 'player') {
        nextWishedSuit = suitWish || null;
      } else {
        nextWishedSuit = [CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS, CardSuit.SPADES][Math.floor(Math.random() * 4)];
      }
    }

    setDrawCount(nextDrawCount);
    setWishedSuit(nextWishedSuit);

    if (card.rank === CardRank.EIGHT) {
      setCurrentTurn(player);
    } else {
      changeTurn();
    }
  }, [drawCount, changeTurn]);

  const playCard = useCallback((card: Card, suitWish?: CardSuit) => {
    console.log('[SkatGame] playCard called', { card, suitWish, isMultiplayer, gameId, currentUsername });
    if (isMultiplayer) {
      if (gameId && currentUsername) {
        const newHand = playerHand.filter(c => c.id !== card.id);
        // No need to cast to string anymore, pass number directly
        playCardMultiplayer(gameId, currentUsername, card, newHand, suitWish);
      } else {
        console.error('[SkatGame] Missing multiplayer data:', { gameId, currentUsername });
      }
      return;
    }

    setPlayerHand(prev => prev.filter(c => c.id !== card.id));
    addToDiscard(card);

    handleCardEffect(card, 'player', suitWish);

    if (playerHand.filter(c => c.id !== card.id).length === 0) {
      setGameStatus('won');
    }
  }, [playerHand, addToDiscard, handleCardEffect, isMultiplayer, gameId, currentUsername]);

  const handleDrawCard = useCallback((player: 'player' | 'ai') => {
    if (isMultiplayer) {
      if (player === 'player' && gameId && currentUsername) {
        drawCardsMultiplayer(gameId, currentUsername, drawCount > 0 ? drawCount : 1);
      }
      return;
    }

    if (deck.length === 0) {
      if (discardPile.length <= 1) return;
      const topCard = discardPile[discardPile.length - 1];
      const rest = discardPile.slice(0, discardPile.length - 1);
      const newDeck = shuffleDeck(rest);
      setDeck(newDeck);
      setDiscardPile([topCard]);

      const count = drawCount > 0 ? drawCount : 1;
      const { drawn, remaining } = drawCards(newDeck, count);

      if (player === 'player') {
        setPlayerHand(prev => [...prev, ...drawn]);
      } else {
        setAiHand(prev => [...prev, ...drawn]);
      }
      setDeck(remaining);
    } else {
      const count = drawCount > 0 ? drawCount : 1;
      const actualCount = Math.min(count, deck.length);
      const { drawn, remaining } = drawCards(deck, actualCount);

      if (player === 'player') {
        setPlayerHand(prev => [...prev, ...drawn]);
      } else {
        setAiHand(prev => [...prev, ...drawn]);
      }
      setDeck(remaining);
    }

    setDrawCount(0);
    changeTurn();
  }, [deck, discardPile, drawCount, changeTurn, isMultiplayer, gameId, currentUsername]);

  const playAiTurn = useCallback(() => {
    if (isMultiplayer) return;

    const topCard = getCurrentTopCard();
    const validCards = aiHand.filter(card => canPlayCard(card, topCard, wishedSuit || undefined));

    if (validCards.length > 0) {
      const actionCard = validCards.find(c => c.isAction);
      const cardToPlay = actionCard || validCards[0];

      setAiHand(prev => prev.filter(c => c.id !== cardToPlay.id));
      addToDiscard(cardToPlay);

      handleCardEffect(cardToPlay, 'ai');

      if (aiHand.filter(c => c.id !== cardToPlay.id).length === 0) {
        setGameStatus('lost');
      }
    } else {
      handleDrawCard('ai');
    }
  }, [aiHand, wishedSuit, getCurrentTopCard, handleDrawCard, addToDiscard, handleCardEffect, isMultiplayer]);

  // Initialize Game
  const startNewGame = useCallback(() => {
    console.log('Starting New Game...', { isMultiplayer });
    if (isMultiplayer) return; // Multiplayer game is initialized by lobby

    try {
      let newDeck = generateDeck();
      // Fallback if generateDeck fails or returns empty
      if (!newDeck || newDeck.length === 0) {
        console.warn('generateDeck returned empty, using fallback deck');
        // Simple manual deck generation
        newDeck = [];
        const suits = [0, 1, 2, 3]; // Spades, Hearts, Diamonds, Clubs
        const ranks = [7, 8, 9, 10, 11, 12, 13, 14];
        for (const s of suits) {
            for (const r of ranks) {
                newDeck.push({
                    id: `${s}_${r}`,
                    suit: s as any,
                    rank: r as any,
                    points: r >= 11 ? 10 : r,
                    isAction: r === 7 || r === 8 || r === 11
                });
            }
        }
        // Shuffle manually
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
      }

      console.log('Deck size:', newDeck.length);
      const { drawn: pHand, remaining: d1 } = drawCards(newDeck, 5);
      const { drawn: aHand, remaining: d2 } = drawCards(d1, 5);
      const { drawn: startCards, remaining: finalDeck } = drawCards(d2, 1);

      setPlayerHand(pHand);
      setAiHand(aHand);
      setDiscardPile(startCards);
      setDeck(finalDeck);
      setCurrentTurn('player');
      setGameStatus('playing');
      setWishedSuit(null);
      setDrawCount(0);
      setShowWishModal(false);
      setPendingCard(null);

      const firstCard = startCards[0];
      if (firstCard && firstCard.rank === CardRank.SEVEN) {
        setDrawCount(2);
      }
    } catch (e) {
      console.error("Error starting game:", e);
    }
  }, [isMultiplayer]);

  useEffect(() => {
    if (!isMultiplayer) {
        startNewGame();
    }
  }, [isMultiplayer, startNewGame]);

  // AI Turn Logic
  useEffect(() => {
    if (currentTurn === 'ai' && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        playAiTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameStatus, playAiTurn]);



  const handlePlayerCardClick = (card: Card) => {
    console.log('[SkatGame] Card clicked:', card, 'Turn:', currentTurn, 'Status:', gameStatus);
    if (currentTurn !== 'player' || gameStatus !== 'playing') return;

    const topCard = getCurrentTopCard();
    console.log('[SkatGame] Validating against top card:', topCard, 'Wished:', wishedSuit);

    if (canPlayCard(card, topCard, wishedSuit || undefined)) {
      if (card.rank === CardRank.JACK) {
        setPendingCard(card);
        setShowWishModal(true);
        return;
      }
      playCard(card);
    } else {
      console.log('[SkatGame] Invalid move');
    }
  };

  const handleWishSelection = (suit: CardSuit) => {
    if (pendingCard) {
      playCard(pendingCard, suit);
      setShowWishModal(false);
      setPendingCard(null);
    }
  };

  const getRankDisplay = (rank: CardRank): string => {
    switch (rank) {
      case CardRank.SEVEN: return '7';
      case CardRank.EIGHT: return '8';
      case CardRank.NINE: return '9';
      case CardRank.TEN: return '10';
      case CardRank.JACK: return 'J';
      case CardRank.QUEEN: return 'Q';
      case CardRank.KING: return 'K';
      case CardRank.ACE: return 'A';
      default: return '?';
    }
  };

  // Helper to render suit icon
  const renderSuitIcon = (suit: CardSuit) => {
    const symbol = getSuitSymbol(suit);
    const isRed = suit === CardSuit.HEARTS || suit === CardSuit.DIAMONDS;
    return (
      <span style={{ fontSize: '32px', color: isRed ? '#FF006E' : '#000' }}>
        {symbol}
      </span>
    );
  };

  // Placeholder for friend handling
  const handleAddFriend = (code: string) => {
    console.log('Add friend:', code);
  };

  const renderCard = (card: Card, onClick?: () => void, isPlayable: boolean = false) => {
    const isRed = card.suit === CardSuit.HEARTS || card.suit === CardSuit.DIAMONDS;
    const color = isRed ? '#FF006E' : '#000';
    const symbol = getSuitSymbol(card.suit);
    const display = getRankDisplay(card.rank);

    return (
      <div
        onClick={onClick}
        className={`relative cursor-pointer transition-all duration-200 select-none bg-white
          ${isPlayable ? 'hover:-translate-y-4 hover:scale-110 z-50' : ''}
          ${!isPlayable && currentTurn === 'player' ? 'brightness-90 grayscale-[30%]' : ''}
        `}
        style={{
          width: '80px',
          height: '112px',
          borderRadius: '6px',
          border: isPlayable ? '3px solid #06FFA5' : '3px solid #000',
          boxShadow: isPlayable ? '6px 6px 0px #06FFA5' : '4px 4px 0px #000',
        }}
      >
        {/* Top left */}
        <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
          <span style={{ color, fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
            {display}
          </span>
          <span style={{ color, fontSize: '16px', marginTop: '-2px' }}>
            {symbol}
          </span>
        </div>

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ color, fontSize: '42px', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.1))' }}>
            {symbol}
          </span>
        </div>

        {/* Bottom right */}
        <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
          <span style={{ color, fontSize: '18px', fontWeight: 900, fontFamily: 'monospace' }}>
            {display}
          </span>
          <span style={{ color, fontSize: '16px', marginTop: '-2px' }}>
            {symbol}
          </span>
        </div>
      </div>
    );
  };

  const renderCardBack = () => (
    <div
      style={{
        width: '80px',
        height: '112px',
        background: '#3B82F6',
        borderRadius: '6px',
        border: '3px solid #000',
        boxShadow: '4px 4px 0px #000',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center opacity-40"
        style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #3B82F6 25%, #3B82F6 75%, #000 75%, #000)',
            backgroundPosition: '0 0, 10px 10px',
            backgroundSize: '20px 20px'
        }}
      ></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 bg-black rotate-45 border-2 border-white flex items-center justify-center shadow-[4px_4px_0px_#FFF]">
             <span className="text-white -rotate-45 font-black text-xl">M</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between p-4 overflow-hidden z-[100] geo-pattern geo-shapes" style={{ background: '#FFF8E7' }}>
      {/* Rainbow Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex h-3 w-full z-50">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#0096FF' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center relative z-10 mt-6 px-4">
        <button
          onClick={onBack}
          className="w-14 h-14 flex items-center justify-center transition-all active:translate-y-1 hover:-translate-y-1 bg-[#FF006E] border-3 border-black shadow-[4px_4px_0px_#000]"
        >
          <ArrowLeft size={26} style={{ color: '#000' }} />
        </button>

        <div className="flex flex-col items-center">
          <h2 
            className="text-3xl md:text-4xl font-black uppercase tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]" 
            style={{ color: '#000', transform: 'skewX(-3deg)' }}
          >
            Mau Mau
          </h2>
          {isMultiplayer && (
            <div 
              className="flex items-center gap-2 mt-1 px-3 py-1 border-2 border-black bg-[#06FFA5] shadow-[2px_2px_0px_#000]"
            >
              <div className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-[10px] font-bold text-black uppercase tracking-wider">Multiplayer</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setShowChangelog(true)} 
            className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1 bg-white border-3 border-black shadow-[4px_4px_0px_#000]"
          >
            <Info size={20} style={{ color: '#000' }} />
          </button>
          <button 
            onClick={() => setShowFriends(true)} 
            className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1 bg-[#8338EC] border-3 border-black shadow-[4px_4px_0px_#000]"
          >
            <Users size={20} style={{ color: '#FFF' }} />
          </button>
        </div>
      </div>

      {/* AI Hand */}
      <div className="flex -space-x-8 pt-8 relative z-0">
        {aiHand.map((card, index) => (
          <motion.div
            key={`ai-${card.id}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="relative"
            style={{ zIndex: index }}
          >
            {renderCardBack()}
          </motion.div>
        ))}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 bg-black text-white px-3 py-1 font-black uppercase text-xs border-2 border-white -rotate-3 shadow-lg">
           {isMultiplayer ? (opponentUsername || 'Gegner') : 'AI'} ({aiHand.length})
        </div>
      </div>

      {/* Center Area */}
      <div className="flex items-center gap-12 md:gap-16 my-6 relative z-0 p-8 border-4 border-black bg-[#FFBE0B] shadow-[8px_8px_0px_#000] rotate-1">
        
        {/* Decorative corners */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-black"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-black"></div>

        {/* Draw Pile */}
        <div className="relative group">
           <div className="absolute top-2 left-2">{renderCardBack()}</div>
           <div className="absolute top-1 left-1">{renderCardBack()}</div>
           <div
            onClick={() => currentTurn === 'player' && handleDrawCard('player')}
            className={`cursor-pointer transition-transform ${currentTurn === 'player' ? 'hover:-translate-y-2 hover:scale-105 active:scale-95' : 'opacity-80'}`}
           >
             {renderCardBack()}
           </div>
           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-black text-xs uppercase bg-black text-white px-2 py-1">Deck ({deck.length})</div>
        </div>

        {/* Discard Pile */}
        <div className="relative w-20 h-28 flex items-center justify-center">
          {discardPile.length === 0 ? (
             <div className="w-[80px] h-[112px] border-3 border-black border-dashed flex items-center justify-center bg-white/30 font-black text-black/50 uppercase text-xs">Ablage</div>
          ) : (
            discardPile.slice(-3).map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: Math.random() * 6 - 3 }}
                className="absolute"
                style={{ zIndex: index }}
              >
                {renderCard(card)}
              </motion.div>
            ))
          )}

          {/* Indicators */}
          {wishedSuit !== null && (
            <div 
              className="absolute -top-20 left-1/2 -translate-x-1/2 px-4 py-3 bg-white border-3 border-black shadow-[6px_6px_0px_#FF006E] animate-bounce z-20 whitespace-nowrap flex flex-col items-center"
            >
              <span className="text-[10px] font-black text-black uppercase tracking-wider mb-1">Wunsch</span>
              {renderSuitIcon(wishedSuit)}
            </div>
          )}

          {drawCount > 0 && (
            <div className="absolute -right-12 -top-12 bg-[#FF006E] text-white w-14 h-14 flex items-center justify-center font-black text-xl border-3 border-black shadow-[4px_4px_0px_#000] animate-pulse z-20 rotate-12">
              +{drawCount}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div 
        className="px-8 py-3 mb-2 border-3 border-black bg-white shadow-[6px_6px_0px_#000] transform -skew-x-6"
      >
        <div className="font-black text-sm uppercase tracking-widest transform skew-x-6">
          {gameStatus === 'playing' ? (
            currentTurn === 'player' ?
              <span className="text-black bg-[#06FFA5] px-3 py-1 border-2 border-black">Dein Zug</span> :
              <span className="text-gray-500 flex items-center gap-2">Gegner denkt... <Clock size={16} className="animate-spin" /></span>
          ) : (
            gameStatus === 'won' ? <span className="text-[#FFBE0B] bg-black px-3 py-1">Gewonnen!</span> : <span className="text-[#FF006E] bg-black px-3 py-1">Verloren</span>
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div className="flex -space-x-8 pb-6 items-end h-48 overflow-visible px-4 perspective-1000 w-full justify-center max-w-4xl">
        <AnimatePresence>
          {playerHand.map((card, index) => {
            const isPlayable = currentTurn === 'player' && canPlayCard(card, getCurrentTopCard(), wishedSuit || undefined);
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ y: 200, opacity: 0 }}
                animate={{
                  y: isPlayable ? -20 : 0,
                  opacity: 1,
                  scale: isPlayable ? 1.1 : 1,
                  zIndex: index
                }}
                whileHover={{ y: -50, scale: 1.2, zIndex: 100 }}
                className="origin-bottom"
              >
                 {renderCard(card, () => handlePlayerCardClick(card), isPlayable)}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Wish Selection Modal */}
      <Modal isOpen={showWishModal} title="Farbe Wünschen">
        <div className="grid grid-cols-2 gap-4">
          {[CardSuit.HEARTS, CardSuit.DIAMONDS, CardSuit.CLUBS, CardSuit.SPADES].map(suit => (
            <button
              key={suit}
              onClick={() => handleWishSelection(suit)}
              className={`p-6 bg-white border-3 border-black shadow-[4px_4px_0px_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center text-5xl active:scale-95`}
            >
              <span style={{ color: getSuitColor(suit) === 'text-red-500' ? '#FF006E' : '#000' }}>
                 {getSuitSymbol(suit)}
              </span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Changelog Modal */}
      <Modal isOpen={showChangelog} onClose={() => setShowChangelog(false)} title="Changelog">
        <div className="space-y-4 text-sm font-bold">
          <div className="p-4 bg-white border-3 border-black shadow-[4px_4px_0px_#000]">
            <h4 className="font-black text-[#0096FF] mb-2 uppercase tracking-wide bg-black px-2 py-1 inline-block">v3.2.0 - Neo-Brutalism Update</h4>
            <ul className="space-y-2 text-black mt-2">
              <li className="flex items-start gap-2"><span className="text-[#FF006E] font-black">•</span> Komplett neues Neo-Brutalism Design</li>
              <li className="flex items-start gap-2"><span className="text-[#FF006E] font-black">•</span> Verbesserte Kartenanimationen</li>
              <li className="flex items-start gap-2"><span className="text-[#FF006E] font-black">•</span> Bugfix: Spiel lädt jetzt korrekt</li>
              <li className="flex items-start gap-2"><span className="text-[#FF006E] font-black">•</span> Freundesliste (Beta)</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Friends Modal */}
      <FriendsModal
        isOpen={showFriends}
        onClose={() => setShowFriends(false)}
        friendCode={friendCode}
        onAddFriend={handleAddFriend}
      />

      {/* Game Over Modal */}
      <Modal isOpen={gameStatus !== 'playing'} title={gameStatus === 'won' ? 'VICTORY!' : 'DEFEAT'}>
        <div className="text-center">
          <div className={`text-6xl mb-6 animate-bounce inline-block p-4 border-4 border-black rounded-full shadow-[6px_6px_0px_#000] ${gameStatus === 'won' ? 'bg-[#FFBE0B]' : 'bg-[#FF006E]'}`}>
            {gameStatus === 'won' ? '🏆' : '💀'}
          </div>

          <p className="text-black mb-8 font-black text-lg">
            {gameStatus === 'won' ? 'Du hast das Match dominiert!' : 'Der Gegner war besser.'}
          </p>

          {gameStatus === 'won' ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-[#FFBE0B] px-5 py-3 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col items-center min-w-[100px] transform -rotate-2">
                  <span className="text-[10px] font-black text-black uppercase tracking-widest mb-1 bg-white px-1">Coins</span>
                  <div className="flex items-center gap-1 text-2xl font-black text-black">
                    <Coins size={20} fill="currentColor" /> 150
                  </div>
                </div>
                <div className="bg-[#8338EC] px-5 py-3 border-3 border-black shadow-[4px_4px_0px_#000] flex flex-col items-center min-w-[100px] transform rotate-2">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1 bg-black px-1">XP</span>
                  <div className="flex items-center gap-1 text-2xl font-black text-white">
                    <Star size={20} fill="currentColor" /> 75
                  </div>
                </div>
              </div>
              <button
                onClick={() => onGameEnd(150, 75)}
                className="w-full py-4 font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 bg-[#06FFA5] border-3 border-black shadow-[6px_6px_0px_#000] hover:-translate-y-1"
              >
                <Trophy size={18} className="mr-2" />
                Belohnung abholen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button 
                onClick={startNewGame} 
                className="w-full py-4 font-black uppercase transition-all active:scale-95 flex items-center justify-center gap-2 bg-[#06FFA5] border-3 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1"
              >
                <RotateCcw size={18} />
                Nochmal versuchen
              </button>
              <button 
                onClick={onBack} 
                className="w-full py-4 font-black uppercase transition-all active:scale-95 bg-white border-3 border-black shadow-[4px_4px_0px_#000] hover:-translate-y-1"
              >
                Zurück zum Menü
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
