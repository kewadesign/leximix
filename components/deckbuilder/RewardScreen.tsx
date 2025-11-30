// ============================================
// KARTENSCHMIEDE - Reward Screen Component
// ============================================
// Post-combat reward selection screen

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Sparkles, X, Check, ChevronRight } from 'lucide-react';
import { DeckbuilderCard, CardElement, CardRarity } from '../../utils/deckbuilder/types';

interface RewardScreenProps {
  gold: number;
  cardChoices: DeckbuilderCard[];
  onCardSelect: (card: DeckbuilderCard) => void;
  onSkip: () => void;
  language?: 'EN' | 'DE' | 'ES';
}

// Element colors
const ELEMENT_COLORS: Record<CardElement, { bg: string; border: string }> = {
  fire: { bg: 'linear-gradient(135deg, #FF006E, #FF7F00)', border: '#FF006E' },
  water: { bg: 'linear-gradient(135deg, #0096FF, #00D9FF)', border: '#0096FF' },
  earth: { bg: 'linear-gradient(135deg, #228B22, #90EE90)', border: '#228B22' },
  air: { bg: 'linear-gradient(135deg, #87CEEB, #E0FFFF)', border: '#87CEEB' },
  void: { bg: 'linear-gradient(135deg, #4B0082, #8B008B)', border: '#8B008B' },
};

const RARITY_COLORS: Record<CardRarity, string> = {
  starter: '#666666',
  common: '#AAAAAA',
  uncommon: '#00FF00',
  rare: '#0096FF',
  legendary: '#FFD700',
};

const RARITY_NAMES: Record<CardRarity, { en: string; de: string }> = {
  starter: { en: 'Starter', de: 'Starter' },
  common: { en: 'Common', de: 'Gewöhnlich' },
  uncommon: { en: 'Uncommon', de: 'Ungewöhnlich' },
  rare: { en: 'Rare', de: 'Selten' },
  legendary: { en: 'Legendary', de: 'Legendär' },
};

const TYPE_ICONS: Record<string, string> = {
  attack: '⚔️',
  skill: '🛡️',
  power: '⚡',
  curse: '💀',
  status: '❓',
};

export const RewardScreen: React.FC<RewardScreenProps> = ({
  gold,
  cardChoices,
  onCardSelect,
  onSkip,
  language = 'DE'
}) => {
  const [selectedCard, setSelectedCard] = useState<DeckbuilderCard | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const isDE = language === 'DE';

  const handleCardClick = (card: DeckbuilderCard) => {
    setSelectedCard(card);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (selectedCard) {
      onCardSelect(selectedCard);
    }
  };

  const handleCancel = () => {
    setSelectedCard(null);
    setShowConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      {/* Victory Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <div className="text-5xl mb-2">⚔️</div>
        <h1 className="text-3xl font-black text-white mb-2">
          {isDE ? 'SIEG!' : 'VICTORY!'}
        </h1>
      </motion.div>

      {/* Gold Reward */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 px-6 py-3 mb-6 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
          border: '3px solid #000',
          boxShadow: '4px 4px 0 #000'
        }}
      >
        <Coins className="w-8 h-8 text-black" />
        <span className="text-2xl font-black text-black">+{gold}</span>
      </motion.div>

      {/* Card Selection */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-2xl"
      >
        <h2 className="text-xl font-bold text-white text-center mb-4">
          {isDE ? 'Wähle eine Karte:' : 'Choose a card:'}
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {cardChoices.map((card, index) => {
            const colors = ELEMENT_COLORS[card.element];
            const rarityColor = RARITY_COLORS[card.rarity];

            return (
              <motion.button
                key={`${card.id}-${index}`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(card)}
                className="relative rounded-lg overflow-hidden"
                style={{
                  width: '140px',
                  height: '200px',
                  background: colors.bg,
                  border: `4px solid ${rarityColor}`,
                  boxShadow: `6px 6px 0 #000, 0 0 20px ${rarityColor}40`
                }}
              >
                {/* Energy Cost */}
                <div 
                  className="absolute -top-1 -left-1 w-8 h-8 rounded-full flex items-center justify-center font-black text-lg z-10"
                  style={{
                    background: '#8B5CF6',
                    border: '2px solid #000',
                    color: '#FFF'
                  }}
                >
                  {card.cost}
                </div>

                {/* Card Type */}
                <div className="absolute top-1 right-1 text-xl">
                  {TYPE_ICONS[card.type] || '❓'}
                </div>

                {/* Artwork */}
                <div className="h-16 flex items-center justify-center text-5xl mt-6">
                  {card.artwork}
                </div>

                {/* Name Background */}
                <div 
                  className="px-2 py-1"
                  style={{ background: 'rgba(0,0,0,0.7)' }}
                >
                  <span className="text-xs font-black text-white block text-center truncate">
                    {isDE ? card.nameDE : card.name}
                  </span>
                </div>

                {/* Description */}
                <div className="px-2 py-1 flex-1">
                  <span className="text-[10px] text-white/80 leading-tight line-clamp-3 text-center block">
                    {isDE ? card.descriptionDE : card.description}
                  </span>
                </div>

                {/* Rarity */}
                <div 
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[8px] font-bold"
                  style={{ 
                    background: rarityColor,
                    color: card.rarity === 'legendary' ? '#000' : '#FFF'
                  }}
                >
                  {isDE ? RARITY_NAMES[card.rarity].de : RARITY_NAMES[card.rarity].en}
                </div>

                {/* Legendary effect */}
                {card.rarity === 'legendary' && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, transparent 40%, rgba(255,215,0,0.4) 50%, transparent 60%)',
                      animation: 'shimmer 2s infinite',
                      backgroundSize: '200% 200%'
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onSkip}
          className="w-full max-w-xs mx-auto py-3 px-6 font-bold uppercase flex items-center justify-center gap-2"
          style={{
            background: '#374151',
            border: '3px solid #000',
            boxShadow: '3px 3px 0 #000',
            color: '#9CA3AF'
          }}
        >
          <X className="w-5 h-5" />
          {isDE ? 'Überspringen' : 'Skip'}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="p-6 rounded-lg max-w-sm w-full text-center"
              style={{
                background: '#1F2937',
                border: '4px solid #8B5CF6',
                boxShadow: '8px 8px 0 #000'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-white mb-4">
                {isDE ? 'Karte zum Deck hinzufügen?' : 'Add card to deck?'}
              </h3>

              <div className="mb-6">
                <div 
                  className="inline-block text-4xl p-4 rounded-lg mb-2"
                  style={{ 
                    background: ELEMENT_COLORS[selectedCard.element].bg,
                    border: `3px solid ${RARITY_COLORS[selectedCard.rarity]}`
                  }}
                >
                  {selectedCard.artwork}
                </div>
                <p className="text-white font-bold">
                  {isDE ? selectedCard.nameDE : selectedCard.name}
                </p>
                <p className="text-sm text-gray-400">
                  {isDE ? selectedCard.descriptionDE : selectedCard.description}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 font-bold uppercase"
                  style={{
                    background: '#374151',
                    border: '3px solid #000',
                    color: '#FFF'
                  }}
                >
                  <X className="w-5 h-5 inline mr-1" />
                  {isDE ? 'Nein' : 'No'}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 font-bold uppercase"
                  style={{
                    background: '#8B5CF6',
                    border: '3px solid #000',
                    color: '#FFF'
                  }}
                >
                  <Check className="w-5 h-5 inline mr-1" />
                  {isDE ? 'Ja' : 'Yes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      `}</style>
    </motion.div>
  );
};

export default RewardScreen;
