// ============================================
// KARTENSCHMIEDE - Pack Opening Component
// ============================================
// Beautiful animated pack opening experience

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Gift, ChevronRight, Coins } from 'lucide-react';
import { DeckbuilderCard, CardPack, PackOpeningResult } from '../utils/deckbuilder/types';
import { DeckbuilderCardComponent, CardRevealAnimation } from './DeckbuilderCard';
import { audio } from '../utils/audio';

interface CardPackOpeningProps {
  pack: CardPack;
  result: PackOpeningResult;
  onClose: () => void;
  onComplete?: () => void;
}

type OpeningPhase = 'intro' | 'opening' | 'revealing' | 'complete';

// ===================
// ELEMENT COLORS
// ===================
const PACK_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  basic: { primary: '#666', secondary: '#888', glow: 'rgba(100,100,100,0.5)' },
  standard: { primary: '#0096FF', secondary: '#00D9FF', glow: 'rgba(0,150,255,0.5)' },
  premium: { primary: '#FFD700', secondary: '#FFA500', glow: 'rgba(255,215,0,0.7)' },
  element_fire: { primary: '#FF006E', secondary: '#FF7F00', glow: 'rgba(255,0,110,0.5)' },
  element_water: { primary: '#0096FF', secondary: '#00D9FF', glow: 'rgba(0,150,255,0.5)' },
  element_earth: { primary: '#228B22', secondary: '#90EE90', glow: 'rgba(34,139,34,0.5)' },
  element_air: { primary: '#87CEEB', secondary: '#E0FFFF', glow: 'rgba(135,206,235,0.5)' },
};

// ===================
// MAIN COMPONENT
// ===================
export const CardPackOpening: React.FC<CardPackOpeningProps> = ({
  pack,
  result,
  onClose,
  onComplete,
}) => {
  const [phase, setPhase] = useState<OpeningPhase>('intro');
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAllCards, setShowAllCards] = useState(false);

  const colors = PACK_COLORS[pack.id] || PACK_COLORS.standard;
  const hasLegendary = result.cards.some(c => c.rarity === 'legendary');
  const hasRare = result.cards.some(c => c.rarity === 'rare');

  // Auto-advance intro
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => setPhase('opening'), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Handle pack click
  const handlePackClick = useCallback(() => {
    if (phase === 'opening') {
      setPhase('revealing');
      // Play sound
      if (hasLegendary) {
        audio.playWin();
      } else if (hasRare) {
        audio.playClaim();
      } else {
        audio.playClick();
      }
    }
  }, [phase, hasLegendary, hasRare]);

  // Handle card reveal complete
  const handleRevealComplete = useCallback(() => {
    setRevealedCount(prev => {
      const newCount = prev + 1;
      if (newCount >= result.cards.length) {
        setPhase('complete');
      }
      return newCount;
    });
  }, [result.cards.length]);

  // Skip to all cards
  const handleSkip = useCallback(() => {
    setShowAllCards(true);
    setPhase('complete');
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    onComplete?.();
    onClose();
  }, [onClose, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated particles */}
        {phase !== 'intro' && (
          <>
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: colors.primary,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -200],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}

        {/* Legendary burst effect */}
        {hasLegendary && phase === 'revealing' && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 5, opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
            style={{
              background: `radial-gradient(circle, #FFD700 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 flex items-center justify-center"
        style={{
          background: '#FF006E',
          border: '3px solid #000',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <X size={24} color="#FFF" />
      </button>

      {/* Skip Button */}
      {phase === 'revealing' && !showAllCards && (
        <button
          onClick={handleSkip}
          className="absolute bottom-4 right-4 z-50 px-6 py-3 font-black uppercase flex items-center gap-2"
          style={{
            background: '#000',
            color: '#FFF',
            border: '3px solid #FFF',
          }}
        >
          Überspringen <ChevronRight size={20} />
        </button>
      )}

      {/* Main Content */}
      <div className="relative flex flex-col items-center">
        {/* PHASE: INTRO */}
        <AnimatePresence>
          {phase === 'intro' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-8xl mb-4"
              >
                {pack.icon}
              </motion.div>
              <h2
                className="text-3xl font-black uppercase"
                style={{ color: colors.primary, textShadow: `0 0 20px ${colors.glow}` }}
              >
                {pack.nameDE}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE: OPENING */}
        <AnimatePresence>
          {phase === 'opening' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center cursor-pointer"
              onClick={handlePackClick}
            >
              {/* Pack Visual */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -10, 0],
                  boxShadow: [
                    `0 0 20px ${colors.glow}`,
                    `0 0 40px ${colors.glow}`,
                    `0 0 20px ${colors.glow}`,
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative w-64 h-80 flex items-center justify-center rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  border: '6px solid #000',
                  boxShadow: `0 0 30px ${colors.glow}, 8px 8px 0px #000`,
                }}
              >
                {/* Pack design */}
                <div className="absolute inset-4 border-4 border-black/30 rounded flex items-center justify-center">
                  <span className="text-7xl">{pack.icon}</span>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  animate={{
                    background: [
                      'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                      'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 20%, transparent 40%)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                {/* Card count badge */}
                <div
                  className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl"
                  style={{
                    background: '#FFD700',
                    border: '4px solid #000',
                  }}
                >
                  {pack.cardCount}
                </div>
              </motion.div>

              {/* Instruction */}
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mt-8 text-white font-black uppercase text-xl"
              >
                Tippe zum Öffnen!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE: REVEALING */}
        <AnimatePresence>
          {phase === 'revealing' && !showAllCards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap justify-center gap-4 max-w-4xl px-4"
            >
              {result.cards.map((card, index) => (
                <CardRevealAnimation
                  key={`${card.id}-${index}`}
                  card={card}
                  index={index}
                  onComplete={handleRevealComplete}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* PHASE: COMPLETE */}
        {(phase === 'complete' || showAllCards) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            {/* Summary Header */}
            <div className="mb-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 mb-2"
              >
                <Sparkles className="text-yellow-400" size={28} />
                <h2 className="text-3xl font-black text-white uppercase">
                  Paket Geöffnet!
                </h2>
                <Sparkles className="text-yellow-400" size={28} />
              </motion.div>

              {/* Stats */}
              <div className="flex gap-4 justify-center mt-4">
                <div
                  className="px-4 py-2 font-black uppercase text-sm"
                  style={{
                    background: '#06FFA5',
                    color: '#000',
                    border: '3px solid #000',
                  }}
                >
                  {result.newCards.length} Neue Karten
                </div>
                {result.dustGained > 0 && (
                  <div
                    className="px-4 py-2 font-black uppercase text-sm flex items-center gap-2"
                    style={{
                      background: '#8338EC',
                      color: '#FFF',
                      border: '3px solid #000',
                    }}
                  >
                    <span>+{result.dustGained}</span>
                    <span>✨ Staub</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="flex flex-wrap justify-center gap-4 max-w-5xl px-4 mb-8">
              {result.cards.map((card, index) => (
                <motion.div
                  key={`${card.id}-${index}`}
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DeckbuilderCardComponent
                    card={card}
                    size="medium"
                    isNew={result.newCards.includes(card.id)}
                    animateIn
                    delay={index * 0.1}
                  />
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleClose}
              className="px-8 py-4 font-black uppercase text-xl flex items-center gap-3"
              style={{
                background: '#06FFA5',
                color: '#000',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Gift size={24} />
              Sammlung ansehen
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ===================
// PACK SHOP ITEM
// ===================
export const PackShopItem: React.FC<{
  pack: CardPack;
  coins: number;
  gems: number;
  onPurchase: (pack: CardPack, payWithGems: boolean) => void;
}> = ({ pack, coins, gems, onPurchase }) => {
  const colors = PACK_COLORS[pack.id] || PACK_COLORS.standard;
  const canAffordCoins = pack.coinsCost !== null && coins >= pack.coinsCost;
  const canAffordGems = pack.gemsCost !== null && gems >= pack.gemsCost;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative p-4 flex flex-col items-center"
      style={{
        background: 'var(--color-surface)',
        border: '4px solid #000',
        boxShadow: `6px 6px 0px ${colors.primary}`,
      }}
    >
      {/* Pack Icon */}
      <motion.div
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-5xl mb-2"
      >
        {pack.icon}
      </motion.div>

      {/* Pack Name */}
      <h3 className="font-black uppercase text-lg mb-1" style={{ color: colors.primary }}>
        {pack.nameDE}
      </h3>

      {/* Card Count */}
      <div
        className="px-3 py-1 text-xs font-black uppercase mb-2"
        style={{ background: '#000', color: '#FFF' }}
      >
        {pack.cardCount} Karten
      </div>

      {/* Description */}
      <p className="text-xs text-center mb-4 opacity-70" style={{ color: 'var(--color-text)' }}>
        {pack.descriptionDE}
      </p>

      {/* Purchase Buttons */}
      <div className="flex gap-2 w-full">
        {pack.coinsCost !== null && (
          <button
            onClick={() => onPurchase(pack, false)}
            disabled={!canAffordCoins}
            className="flex-1 py-2 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all disabled:opacity-50"
            style={{
              background: canAffordCoins ? '#FFBE0B' : '#666',
              color: '#000',
              border: '3px solid #000',
            }}
          >
            <Coins size={14} />
            {pack.coinsCost}
          </button>
        )}
        {pack.gemsCost !== null && (
          <button
            onClick={() => onPurchase(pack, true)}
            disabled={!canAffordGems}
            className="flex-1 py-2 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all disabled:opacity-50"
            style={{
              background: canAffordGems ? '#8338EC' : '#666',
              color: '#FFF',
              border: '3px solid #000',
            }}
          >
            💎 {pack.gemsCost}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CardPackOpening;
