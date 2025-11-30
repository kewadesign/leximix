// ============================================
// Pack Opening Modal Component
// ============================================
// Animated card reveal when opening Kartenschmiede packs

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { DeckbuilderCard } from '../utils/deckbuilder/types';
import { audio } from '../utils/audio';

interface PackOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: DeckbuilderCard[];
  packName: string;
  packColor: string;
  language?: 'EN' | 'DE' | 'ES';
}

// Get rarity color
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'rare': return '#A855F7';
    case 'uncommon': return '#3B82F6';
    case 'common': return '#9CA3AF';
    default: return '#9CA3AF';
  }
};

// Get element color
const getElementColor = (element: string): string => {
  switch (element) {
    case 'fire': return '#FF006E';
    case 'water': return '#00D9FF';
    case 'earth': return '#06FFA5';
    case 'air': return '#A5B4FC';
    case 'void': return '#8B5CF6';
    default: return '#9CA3AF';
  }
};

export const PackOpeningModal: React.FC<PackOpeningModalProps> = ({
  isOpen,
  onClose,
  cards,
  packName,
  packColor,
  language = 'DE'
}) => {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [phase, setPhase] = useState<'pack' | 'revealing' | 'complete'>('pack');
  const isDE = language === 'DE';

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRevealedCount(0);
      setShowAll(false);
      setPhase('pack');
    }
  }, [isOpen]);

  // Handle pack click to start revealing
  const handlePackClick = () => {
    if (phase === 'pack') {
      audio.playWin();
      setPhase('revealing');
      // Start auto-reveal
      revealNextCard();
    }
  };

  // Reveal cards one by one
  const revealNextCard = () => {
    if (revealedCount < cards.length) {
      setTimeout(() => {
        setRevealedCount(prev => {
          const newCount = prev + 1;
          // Play sound based on rarity
          const card = cards[prev];
          if (card) {
            if (card.rarity === 'legendary') {
              audio.playWin();
            } else if (card.rarity === 'rare') {
              audio.playSelect();
            } else {
              audio.playClick();
            }
          }
          return newCount;
        });
      }, 400);
    } else {
      setPhase('complete');
    }
  };

  // Auto-reveal next card when count changes
  useEffect(() => {
    if (phase === 'revealing' && revealedCount < cards.length) {
      revealNextCard();
    } else if (revealedCount >= cards.length && phase === 'revealing') {
      setPhase('complete');
    }
  }, [revealedCount, phase]);

  // Skip to show all
  const handleSkip = () => {
    setRevealedCount(cards.length);
    setShowAll(true);
    setPhase('complete');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.95)' }}
        onClick={phase === 'complete' ? onClose : undefined}
      >
        {/* Close button */}
        {phase === 'complete' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 right-4 p-2"
            style={{
              background: '#FF006E',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}
            onClick={onClose}
          >
            <X className="w-6 h-6 text-white" />
          </motion.button>
        )}

        {/* Pack Phase */}
        {phase === 'pack' && (
          <motion.div
            initial={{ scale: 0.5, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="text-center cursor-pointer"
            onClick={handlePackClick}
          >
            {/* Glow effect */}
            <motion.div
              animate={{ 
                boxShadow: [
                  `0 0 20px ${packColor}`,
                  `0 0 60px ${packColor}`,
                  `0 0 20px ${packColor}`
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-48 h-64 mx-auto flex flex-col items-center justify-center relative"
              style={{
                background: `linear-gradient(135deg, ${packColor}88, ${packColor})`,
                border: '6px solid #000',
                boxShadow: `12px 12px 0 #000`
              }}
            >
              {/* Sparkles */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-20 h-20 text-white/50" />
              </motion.div>
              
              <span className="text-6xl mb-4">🎴</span>
              <span className="text-white font-black text-lg uppercase">{packName}</span>
              <span className="text-white/70 font-bold text-sm mt-2">
                {cards.length} {isDE ? 'Karten' : 'Cards'}
              </span>
            </motion.div>
            
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mt-6 text-white font-bold uppercase"
            >
              {isDE ? 'Tippe zum Öffnen!' : 'Tap to Open!'}
            </motion.p>
          </motion.div>
        )}

        {/* Revealing / Complete Phase */}
        {(phase === 'revealing' || phase === 'complete') && (
          <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center mb-6"
            >
              <h2 
                className="text-2xl font-black uppercase"
                style={{ color: packColor }}
              >
                {packName}
              </h2>
              <p className="text-white/70 font-bold">
                {revealedCount}/{cards.length} {isDE ? 'Karten enthüllt' : 'Cards Revealed'}
              </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {cards.map((card, index) => {
                const isRevealed = index < revealedCount || showAll;
                const rarityColor = getRarityColor(card.rarity);
                const elementColor = getElementColor(card.element);

                return (
                  <motion.div
                    key={`${card.id}-${index}`}
                    initial={{ rotateY: 180, scale: 0.8 }}
                    animate={{ 
                      rotateY: isRevealed ? 0 : 180,
                      scale: isRevealed ? 1 : 0.8
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: showAll ? index * 0.1 : 0
                    }}
                    className="relative"
                    style={{ perspective: '1000px' }}
                  >
                    {/* Card Back */}
                    <div
                      className="absolute inset-0 w-full h-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #374151, #1F2937)',
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0 #000',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        minHeight: '120px'
                      }}
                    >
                      <span className="text-3xl">🎴</span>
                    </div>

                    {/* Card Front */}
                    <div
                      className="w-full flex flex-col items-center p-3 relative overflow-hidden"
                      style={{
                        background: 'var(--color-surface, #1a1a1a)',
                        border: `3px solid ${rarityColor}`,
                        boxShadow: isRevealed && card.rarity === 'legendary' 
                          ? `0 0 20px ${rarityColor}, 4px 4px 0 #000`
                          : '4px 4px 0 #000',
                        minHeight: '120px',
                        opacity: isRevealed ? 1 : 0
                      }}
                    >
                      {/* Legendary Glow */}
                      {card.rarity === 'legendary' && isRevealed && (
                        <motion.div
                          animate={{ opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute inset-0"
                          style={{
                            background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`
                          }}
                        />
                      )}

                      {/* Element Badge */}
                      <div 
                        className="absolute top-1 right-1 w-5 h-5 rounded-full"
                        style={{ 
                          background: elementColor,
                          border: '2px solid #000'
                        }}
                      />

                      {/* Card Artwork/Emoji */}
                      <span className="text-3xl mb-2 relative z-10">{card.artwork}</span>

                      {/* Card Name */}
                      <span 
                        className="text-[10px] font-black uppercase text-center leading-tight relative z-10"
                        style={{ color: 'var(--color-text, #fff)' }}
                      >
                        {isDE ? card.nameDE : card.name}
                      </span>

                      {/* Rarity Badge */}
                      <span 
                        className="text-[8px] font-bold uppercase mt-1 px-1"
                        style={{ 
                          background: rarityColor,
                          color: '#000'
                        }}
                      >
                        {card.rarity}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              {phase === 'revealing' && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSkip}
                  className="px-6 py-3 font-black uppercase"
                  style={{
                    background: '#374151',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0 #000',
                    color: '#FFF'
                  }}
                >
                  {isDE ? 'Alle zeigen' : 'Skip'}
                </motion.button>
              )}

              {phase === 'complete' && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-8 py-4 font-black text-lg uppercase"
                  style={{
                    background: '#06FFA5',
                    border: '4px solid #000',
                    boxShadow: '6px 6px 0 #000',
                    color: '#000'
                  }}
                >
                  {isDE ? 'Super!' : 'Awesome!'}
                </motion.button>
              )}
            </div>

            {/* Summary for complete phase */}
            {phase === 'complete' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-center"
              >
                <div className="flex justify-center gap-4 text-xs font-bold">
                  {['legendary', 'rare', 'uncommon', 'common'].map(rarity => {
                    const count = cards.filter(c => c.rarity === rarity).length;
                    if (count === 0) return null;
                    return (
                      <span key={rarity} style={{ color: getRarityColor(rarity) }}>
                        {count}x {rarity.toUpperCase()}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PackOpeningModal;
