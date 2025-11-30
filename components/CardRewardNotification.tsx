// ============================================
// KARTENSCHMIEDE - Card Reward Notification
// ============================================
// Shows when player earns a random card drop or pack

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, X, ChevronRight } from 'lucide-react';
import { DeckbuilderCard } from '../utils/deckbuilder/types';
import { DeckbuilderCardComponent } from './DeckbuilderCard';
import { audio } from '../utils/audio';

// ===================
// SINGLE CARD DROP
// ===================
interface CardDropNotificationProps {
  card: DeckbuilderCard;
  onClose: () => void;
  onViewCollection?: () => void;
}

export const CardDropNotification: React.FC<CardDropNotificationProps> = ({
  card,
  onClose,
  onViewCollection,
}) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    // Play sound based on rarity
    if (card.rarity === 'legendary') {
      audio.playWin();
    } else if (card.rarity === 'rare') {
      audio.playClaim();
    } else {
      audio.playClick();
    }

    // Reveal card after short delay
    const timer = setTimeout(() => setShowCard(true), 300);
    return () => clearTimeout(timer);
  }, [card]);

  const rarityColors: Record<string, string> = {
    common: '#AAAAAA',
    uncommon: '#00FF00',
    rare: '#0096FF',
    legendary: '#FFD700',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="relative flex flex-col items-center max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 mb-4"
        >
          <Sparkles size={24} style={{ color: rarityColors[card.rarity] }} />
          <h2
            className="text-2xl font-black uppercase"
            style={{ color: rarityColors[card.rarity], textShadow: `0 0 10px ${rarityColors[card.rarity]}` }}
          >
            Karte gefunden!
          </h2>
          <Sparkles size={24} style={{ color: rarityColors[card.rarity] }} />
        </motion.div>

        {/* Card */}
        <AnimatePresence>
          {showCard && (
            <motion.div
              initial={{ rotateY: 180, scale: 0.5 }}
              animate={{ rotateY: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <DeckbuilderCardComponent
                card={card}
                size="large"
                isNew
                glowOnHover={false}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rarity Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 px-4 py-2 font-black uppercase text-sm"
          style={{
            background: rarityColors[card.rarity],
            color: card.rarity === 'common' ? '#000' : '#FFF',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {card.rarity === 'common' && 'Gewöhnlich'}
          {card.rarity === 'uncommon' && 'Ungewöhnlich'}
          {card.rarity === 'rare' && 'Selten'}
          {card.rarity === 'legendary' && 'Legendär!'}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 mt-6"
        >
          <button
            onClick={onClose}
            className="px-6 py-3 font-black uppercase flex items-center gap-2"
            style={{
              background: '#000',
              color: '#FFF',
              border: '3px solid #FFF',
            }}
          >
            Weiter
          </button>
          {onViewCollection && (
            <button
              onClick={onViewCollection}
              className="px-6 py-3 font-black uppercase flex items-center gap-2"
              style={{
                background: '#06FFA5',
                color: '#000',
                border: '3px solid #000',
              }}
            >
              Sammlung <ChevronRight size={18} />
            </button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ===================
// PACK REWARD (5 Cards)
// ===================
interface PackRewardNotificationProps {
  cards: DeckbuilderCard[];
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onViewCollection?: () => void;
}

export const PackRewardNotification: React.FC<PackRewardNotificationProps> = ({
  cards,
  title = 'Belohnungspaket!',
  subtitle = 'Schwierigkeitsgrad abgeschlossen',
  onClose,
  onViewCollection,
}) => {
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [allRevealed, setAllRevealed] = useState(false);

  useEffect(() => {
    audio.playWin();
  }, []);

  // Reveal cards one by one
  useEffect(() => {
    if (revealedCards.length < cards.length && !allRevealed) {
      const timer = setTimeout(() => {
        setRevealedCards(prev => [...prev, prev.length]);
        if (revealedCards.length + 1 >= cards.length) {
          setAllRevealed(true);
        }
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [revealedCards, cards.length, allRevealed]);

  // Skip to reveal all
  const handleSkip = () => {
    setRevealedCards(cards.map((_, i) => i));
    setAllRevealed(true);
  };

  const bestRarity = cards.reduce((best, card) => {
    const order = { legendary: 4, rare: 3, uncommon: 2, common: 1, starter: 0 };
    return order[card.rarity] > order[best] ? card.rarity : best;
  }, 'common' as string);

  const headerColor = bestRarity === 'legendary' ? '#FFD700' : bestRarity === 'rare' ? '#0096FF' : '#06FFA5';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 overflow-auto"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center"
        style={{ background: '#FF006E', border: '3px solid #000' }}
      >
        <X size={20} color="#FFF" />
      </button>

      {/* Skip button */}
      {!allRevealed && (
        <button
          onClick={handleSkip}
          className="absolute bottom-4 right-4 z-50 px-4 py-2 font-bold text-sm"
          style={{ background: '#000', color: '#FFF', border: '2px solid #FFF' }}
        >
          Überspringen
        </button>
      )}

      <div className="flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gift size={32} style={{ color: headerColor }} />
            <h2
              className="text-3xl font-black uppercase"
              style={{ color: headerColor, textShadow: `0 0 15px ${headerColor}` }}
            >
              {title}
            </h2>
            <Gift size={32} style={{ color: headerColor }} />
          </div>
          <p className="text-white/70 font-bold uppercase text-sm">{subtitle}</p>
        </motion.div>

        {/* Cards Grid */}
        <div className="flex flex-wrap justify-center gap-4 mb-8 max-w-4xl">
          {cards.map((card, index) => (
            <motion.div
              key={`${card.id}-${index}`}
              initial={{ scale: 0, rotateY: 180 }}
              animate={
                revealedCards.includes(index)
                  ? { scale: 1, rotateY: 0 }
                  : { scale: 0.8, rotateY: 180 }
              }
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {revealedCards.includes(index) ? (
                <DeckbuilderCardComponent
                  card={card}
                  size="medium"
                  isNew
                  glowOnHover={false}
                />
              ) : (
                <DeckbuilderCardComponent
                  card={card}
                  size="medium"
                  showBack
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Summary & Actions */}
        {allRevealed && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Stats */}
            <div className="flex gap-3">
              {['legendary', 'rare', 'uncommon', 'common'].map((rarity) => {
                const count = cards.filter(c => c.rarity === rarity).length;
                if (count === 0) return null;
                const colors: Record<string, string> = {
                  legendary: '#FFD700',
                  rare: '#0096FF',
                  uncommon: '#00FF00',
                  common: '#AAAAAA',
                };
                return (
                  <div
                    key={rarity}
                    className="px-3 py-1 font-black text-xs uppercase"
                    style={{
                      background: colors[rarity],
                      color: rarity === 'common' ? '#000' : '#FFF',
                      border: '2px solid #000',
                    }}
                  >
                    {count}x {rarity}
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-8 py-3 font-black uppercase"
                style={{
                  background: '#06FFA5',
                  color: '#000',
                  border: '4px solid #000',
                  boxShadow: '4px 4px 0px #000',
                }}
              >
                Weiter spielen
              </button>
              {onViewCollection && (
                <button
                  onClick={onViewCollection}
                  className="px-8 py-3 font-black uppercase flex items-center gap-2"
                  style={{
                    background: '#8338EC',
                    color: '#FFF',
                    border: '4px solid #000',
                    boxShadow: '4px 4px 0px #000',
                  }}
                >
                  Sammlung <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ===================
// CARD DROP CHANCE DISPLAY
// ===================
export const CardDropChanceIndicator: React.FC<{
  didWin: boolean;
  className?: string;
}> = ({ didWin, className = '' }) => {
  const chance = didWin ? 20 : 10;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1 ${className}`}
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: '2px solid #8338EC',
      }}
    >
      <Sparkles size={14} className="text-purple-400" />
      <span className="text-xs font-bold text-white">
        {chance}% Kartenchance
      </span>
    </div>
  );
};

export default CardDropNotification;
