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
    <div className="fixed inset-0 bg-[#0b1120] flex flex-col items-center justify-between p-4 overflow-hidden z-[100]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900/50 to-cyan-900/20 pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-6xl flex justify-between items-center relative z-10">
        <button
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 group"
        >
          <ArrowLeft className="text-white group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            Mau Mau
          </h2>
          {isMultiplayer && (
            <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Multiplayer</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowChangelog(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 text-white/70 hover:text-white">
            <Info size={20} />
          </button>
          <button onClick={() => setShowFriends(true)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 text-white/70 hover:text-white">
            <Users size={20} />
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
            className="w-20 h-32 bg-gradient-to-b from-indigo-900 to-slate-900 rounded-xl border-2 border-white/10 shadow-2xl relative overflow-hidden"
            style={{ zIndex: index }}
          >
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-indigo-950/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white/50 text-[10px] font-bold border border-white/10">
                AI
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Center Area */}
      <div className="flex items-center gap-12 my-4 relative z-0">
        {/* Draw Pile */}
        <div
          onClick={() => currentTurn === 'player' && handleDrawCard('player')}
          className={`w-28 h-40 glass-panel rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform relative overflow-hidden group ${currentTurn === 'player' ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : ''}`}
        >
          <div className="text-white/80 font-black text-center z-10 group-hover:scale-110 transition-transform">
            <div className="text-[10px] uppercase tracking-widest mb-1 text-cyan-400">Deck</div>
            <div className="text-3xl font-mono">{deck.length}</div>
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
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-full shadow-xl animate-bounce flex gap-2 items-center border border-lexi-fuchsia z-20 whitespace-nowrap">
              <span className="text-[10px] font-black text-lexi-fuchsia uppercase tracking-wider">Wunsch:</span>
              {renderSuitIcon(wishedSuit)}
            </div>
          )}

          {drawCount > 0 && (
            <div className="absolute -right-6 -top-6 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 border-[#0b1120] shadow-lg animate-pulse z-20">
              +{drawCount}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="glass-panel px-8 py-3 rounded-full shadow-lg mb-2 backdrop-blur-xl border-white/5">
        <div className="text-white font-black text-sm uppercase tracking-widest">
          {gameStatus === 'playing' ? (
            currentTurn === 'player' ?
              <span className="text-cyan-400 animate-pulse">Dein Zug</span> :
              <span className="text-gray-400 flex items-center gap-2">Gegner denkt nach <span className="inline-block w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span></span>
          ) : (
            gameStatus === 'won' ? <span className="text-yellow-400">Gewonnen!</span> : <span className="text-red-400">Verloren</span>
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
              className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-5xl border-2 border-transparent hover:border-cyan-400 transition-all active:scale-95"
            >
              <span style={{ color: getSuitColor(suit) }}>{getSuitSymbol(suit)}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Changelog Modal */}
      <Modal isOpen={showChangelog} onClose={() => setShowChangelog(false)} title="Changelog">
        <div className="space-y-4 text-sm">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
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
              <Button
                fullWidth
                onClick={() => onGameEnd(150, 75)}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:brightness-110 text-white"
              >
                <Trophy size={18} className="mr-2" fill="currentColor" />
                Belohnung abholen
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button fullWidth onClick={startNewGame} variant="primary">
                <RotateCcw size={18} className="mr-2" />
                Nochmal versuchen
              </Button>
              <Button fullWidth onClick={onBack} variant="ghost">
                Zurück zum Menü
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
