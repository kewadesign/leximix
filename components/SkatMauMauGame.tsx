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
    if (isMultiplayer) return; // Multiplayer game is initialized by lobby

    const newDeck = generateDeck();
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
    if (firstCard.rank === CardRank.SEVEN) {
      setDrawCount(2);
    }
  }, [isMultiplayer]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

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

  const handleAddFriend = (code: string) => {
    // Placeholder - actual logic would call Firebase
    console.log("Adding friend:", code);
    // You might want to show a toast or status here
  };

  const renderSuitIcon = (suit: CardSuit) => (
    <span style={{ color: getSuitColor(suit), fontSize: '1.5rem' }}>
      {getSuitSymbol(suit)}
    </span>
  );

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between p-4 overflow-hidden z-[100] geo-pattern geo-shapes" style={{ background: 'var(--color-bg)' }}>
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
          className="w-14 h-14 flex items-center justify-center transition-all active:translate-y-1 hover:-translate-y-1"
          style={{
            background: '#FF006E',
            border: '3px solid var(--color-border)',
            boxShadow: '4px 4px 0px var(--color-border)'
          }}
        >
          <ArrowLeft size={26} style={{ color: 'var(--color-text)' }} />
        </button>

        <div className="flex flex-col items-center">
          <h2
            className="text-2xl md:text-3xl font-black uppercase tracking-widest"
            style={{ color: 'var(--color-text)', transform: 'skewX(-3deg)' }}
          >
            Mau Mau
          </h2>
          {isMultiplayer && (
            <div
              className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full border-2 border-[var(--color-border)]"
              style={{ background: '#06FFA5' }}
            >
              <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
              <span className="text-[10px] font-bold text-[var(--color-text)] uppercase tracking-wider">Multiplayer</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">

          <button
            onClick={() => setShowFriends(true)}
            className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1"
            style={{
              background: '#8338EC',
              border: '3px solid var(--color-border)',
              boxShadow: '4px 4px 0px var(--color-border)'
            }}
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
            className="w-20 h-32 rounded-xl border-2 border-[var(--color-border)] shadow-xl relative overflow-hidden"
            style={{ zIndex: index, background: '#8338EC' }}
          >
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center border-2 border-[var(--color-border)]">
                <span className="font-black text-xs">AI</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Center Area */}
      <div className="flex items-center gap-8 md:gap-12 my-6 relative z-0">
        {/* Draw Pile */}
        <div
          onClick={() => currentTurn === 'player' && handleDrawCard('player')}
          className={`w-28 h-40 rounded-2xl flex items-center justify-center cursor-pointer transition-transform relative overflow-hidden group border-4 border-[var(--color-border)] shadow-[6px_6px_0px_#000] ${currentTurn === 'player' ? 'animate-pulse' : ''}`}
          style={{ background: 'var(--color-surface)' }}
        >
          <div className="font-black text-center z-10 group-hover:scale-110 transition-transform">
            <div className="text-[10px] uppercase tracking-widest mb-1 text-[var(--color-text)]">Deck</div>
            <div className="text-3xl font-mono text-[var(--color-text)]">{deck.length}</div>
          </div>
        </div>

        {/* Discard Pile */}
        <div className="relative w-28 h-40">
          {discardPile.slice(-3).map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: Math.random() * 6 - 3 }}
              className="absolute inset-0"
              style={{ zIndex: index }}
            >
              <img
                src={getCardAssetPath(card)}
                alt={`${getSuitName(card.suit)} ${card.rank}`}
                className="w-full h-full object-contain drop-shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x150?text=Card'; }}
              />
            </motion.div>
          ))}

          {/* Indicators */}
          {wishedSuit !== null && (
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl shadow-xl animate-bounce flex gap-2 items-center border-2 border-[var(--color-border)] z-20 whitespace-nowrap"
              style={{ background: 'var(--color-surface)' }}
            >
              <span className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-wider">Wunsch:</span>
              {renderSuitIcon(wishedSuit)}
            </div>
          )}

          {drawCount > 0 && (
            <div className="absolute -right-6 -top-6 bg-[#FF006E] text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 border-[var(--color-border)] shadow-lg animate-pulse z-20">
              +{drawCount}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div
        className="px-8 py-3 rounded-xl shadow-[4px_4px_0px_#000] mb-2 border-2 border-[var(--color-border)]"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="font-black text-sm uppercase tracking-widest">
          {gameStatus === 'playing' ? (
            currentTurn === 'player' ?
              <span className="text-[#06FFA5] animate-pulse bg-black px-2 py-1">Dein Zug</span> :
              <span className="text-gray-500 flex items-center gap-2">Gegner denkt nach <span className="inline-block w-1 h-1 bg-black rounded-full animate-bounce"></span></span>
          ) : (
            gameStatus === 'won' ? <span className="text-[#FFBE0B]">Gewonnen!</span> : <span className="text-[#FF006E]">Verloren</span>
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div className="flex -space-x-8 pb-6 items-end h-48 overflow-visible px-4 perspective-1000 w-full justify-center max-w-3xl">
        <AnimatePresence>
          {playerHand.map((card, index) => {
            const isPlayable = currentTurn === 'player' && canPlayCard(card, getCurrentTopCard(), wishedSuit || undefined);
            return (
              <motion.div
                key={card.id}
                layout
                initial={{ y: 200, opacity: 0 }}
                animate={{
                  y: isPlayable ? -30 : 0,
                  opacity: 1,
                  scale: isPlayable ? 1.1 : 1,
                  zIndex: index
                }}
                whileHover={{ y: -60, scale: 1.2, zIndex: 100 }}
                onClick={() => handlePlayerCardClick(card)}
                className={`w-28 h-40 relative cursor-pointer transition-all duration-200 origin-bottom`}
              >
                <img
                  src={getCardAssetPath(card)}
                  alt={`${getSuitName(card.suit)} ${card.rank}`}
                  className={`w-full h-full object-contain drop-shadow-2xl ${!isPlayable && currentTurn === 'player' ? 'brightness-50 grayscale-[50%]' : ''}`}
                />
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
              className="p-6 bg-[var(--color-surface)]/5 hover:bg-[var(--color-surface)]/10 rounded-2xl flex items-center justify-center text-5xl border-2 border-transparent hover:border-cyan-400 transition-all active:scale-95"
            >
              <span style={{ color: getSuitColor(suit) }}>{getSuitSymbol(suit)}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Changelog Modal */}
      <Modal isOpen={showChangelog} onClose={() => setShowChangelog(false)} title="Changelog">
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-[var(--color-surface)]/5 rounded-xl border border-white/10">
            <h4 className="font-bold text-cyan-400 mb-2 uppercase tracking-wide">v2.7.0 - Mau Mau Update</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2"><span className="text-cyan-500">•</span> Skat Mau Mau umbenannt zu Mau Mau</li>
              <li className="flex items-start gap-2"><span className="text-cyan-500">•</span> Neues Design im LexiMix Stil</li>
              <li className="flex items-start gap-2"><span className="text-cyan-500">•</span> Belohnungen für Siege (XP & Coins)</li>
              <li className="flex items-start gap-2"><span className="text-cyan-500">•</span> Freundesliste (Beta)</li>
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
          <div className="text-6xl mb-6 animate-bounce drop-shadow-lg">
            {gameStatus === 'won' ? '🏆' : '💀'}
          </div>

          <p className="text-gray-400 mb-8 font-medium">
            {gameStatus === 'won' ? 'Du hast das Match dominiert!' : 'Der Gegner war besser.'}
          </p>

          {gameStatus === 'won' ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-yellow-500/10 px-5 py-3 rounded-2xl flex flex-col items-center border border-yellow-500/30 min-w-[100px]">
                  <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mb-1">Coins</span>
                  <div className="flex items-center gap-1 text-2xl font-black text-yellow-400">
                    <Coins size={20} fill="currentColor" /> 150
                  </div>
                </div>
                <div className="bg-purple-500/10 px-5 py-3 rounded-2xl flex flex-col items-center border border-purple-500/30 min-w-[100px]">
                  <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">XP</span>
                  <div className="flex items-center gap-1 text-2xl font-black text-purple-400">
                    <Star size={20} fill="currentColor" /> 75
                  </div>
                </div>
              </div>
              <button
                onClick={() => onGameEnd(150, 75)}
                className="w-full py-4 font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: '#FFBE0B',
                  color: 'var(--color-text)',
                  border: '3px solid var(--color-border)',
                  boxShadow: '4px 4px 0px var(--color-border)'
                }}
              >
                <Trophy size={18} className="mr-2" fill="currentColor" />
                Belohnung abholen
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={startNewGame}
                className="w-full py-3 font-black uppercase transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: '#06FFA5',
                  color: 'var(--color-text)',
                  border: '3px solid var(--color-border)',
                  boxShadow: '4px 4px 0px var(--color-border)'
                }}
              >
                <RotateCcw size={18} />
                Nochmal versuchen
              </button>
              <button
                onClick={onBack}
                className="w-full py-3 font-black uppercase transition-all active:scale-95"
                style={{
                  background: '#F5F5F5',
                  color: 'var(--color-text)',
                  border: '3px solid var(--color-border)'
                }}
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
