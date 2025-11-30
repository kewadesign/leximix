// ============================================
// KARTENSCHMIEDE - Hand Component
// ============================================
// Fan-style card hand with selection and play mechanics

import React from 'react';
import { motion } from 'framer-motion';
import { DeckbuilderCard, CardElement, CardRarity } from '../../utils/deckbuilder/types';

interface DeckbuilderHandProps {
  cards: DeckbuilderCard[];
  energy: number;
  selectedIndex: number | null;
  onCardClick: (index: number) => void;
  onPlayCard: () => void;
  isProcessing: boolean;
  language?: 'EN' | 'DE' | 'ES';
}

// Element colors
const ELEMENT_COLORS: Record<CardElement, { bg: string; border: string; glow: string }> = {
  fire: { bg: 'linear-gradient(135deg, #FF006E, #FF7F00)', border: '#FF006E', glow: 'rgba(255, 0, 110, 0.5)' },
  water: { bg: 'linear-gradient(135deg, #0096FF, #00D9FF)', border: '#0096FF', glow: 'rgba(0, 150, 255, 0.5)' },
  earth: { bg: 'linear-gradient(135deg, #228B22, #90EE90)', border: '#228B22', glow: 'rgba(34, 139, 34, 0.5)' },
  air: { bg: 'linear-gradient(135deg, #87CEEB, #E0FFFF)', border: '#87CEEB', glow: 'rgba(135, 206, 235, 0.5)' },
  void: { bg: 'linear-gradient(135deg, #4B0082, #8B008B)', border: '#8B008B', glow: 'rgba(139, 0, 139, 0.5)' },
};

const RARITY_BORDERS: Record<CardRarity, string> = {
  starter: '#666666',
  common: '#AAAAAA',
  uncommon: '#00FF00',
  rare: '#0096FF',
  legendary: '#FFD700',
};

const TYPE_ICONS: Record<string, string> = {
  attack: '⚔️',
  skill: '🛡️',
  power: '⚡',
  curse: '💀',
  status: '❓',
};

export const DeckbuilderHand: React.FC<DeckbuilderHandProps> = ({
  cards,
  energy,
  selectedIndex,
  onCardClick,
  onPlayCard,
  isProcessing,
  language = 'DE'
}) => {
  const isDE = language === 'DE';
  const handSize = cards.length;

  // Calculate card positions for fan effect
  const getCardTransform = (index: number, isSelected: boolean, isHovered: boolean) => {
    const centerIndex = (handSize - 1) / 2;
    const offset = index - centerIndex;
    
    // Fan rotation (-15 to +15 degrees)
    const maxRotation = Math.min(15, 30 / handSize);
    const rotation = offset * maxRotation;
    
    // Horizontal spread
    const spreadX = offset * Math.min(60, 300 / handSize);
    
    // Arc effect (cards on edges are lower)
    const arcY = Math.abs(offset) * 8;
    
    // Selected card lifts up
    const liftY = isSelected ? -40 : isHovered ? -20 : 0;
    
    return {
      rotate: isSelected ? 0 : rotation,
      x: spreadX,
      y: arcY + liftY,
      scale: isSelected ? 1.15 : 1,
      zIndex: isSelected ? 100 : isHovered ? 50 : handSize - Math.abs(offset)
    };
  };

  const renderCard = (card: DeckbuilderCard, index: number) => {
    const isSelected = selectedIndex === index;
    const canPlay = card.cost <= energy;
    const colors = ELEMENT_COLORS[card.element];
    const rarityBorder = RARITY_BORDERS[card.rarity];

    return (
      <motion.button
        key={`${card.id}-${index}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{
          ...getCardTransform(index, isSelected, false),
          opacity: 1,
          filter: canPlay ? 'none' : 'grayscale(0.7) brightness(0.6)'
        }}
        whileHover={!isProcessing && canPlay ? {
          ...getCardTransform(index, isSelected, true),
          transition: { duration: 0.15 }
        } : {}}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 25,
          delay: index * 0.05
        }}
        onClick={() => !isProcessing && onCardClick(index)}
        disabled={isProcessing}
        className="absolute left-1/2 cursor-pointer"
        style={{
          width: '90px',
          height: '130px',
          marginLeft: '-45px',
          transformOrigin: 'center bottom'
        }}
      >
        <div 
          className="w-full h-full rounded-lg overflow-hidden relative"
          style={{
            background: colors.bg,
            border: `3px solid ${isSelected ? '#FFF' : canPlay ? rarityBorder : '#333'}`,
            boxShadow: isSelected 
              ? `0 0 20px ${colors.glow}, 6px 6px 0 #000`
              : canPlay 
                ? '4px 4px 0 #000'
                : '2px 2px 0 #000'
          }}
        >
          {/* Energy Cost */}
          <div 
            className="absolute -top-1 -left-1 w-7 h-7 rounded-full flex items-center justify-center font-black text-sm z-10"
            style={{
              background: canPlay ? '#8B5CF6' : '#EF4444',
              border: '2px solid #000',
              color: '#FFF'
            }}
          >
            {card.cost}
          </div>

          {/* Card Type Icon */}
          <div className="absolute top-1 right-1 text-lg">
            {TYPE_ICONS[card.type] || '❓'}
          </div>

          {/* Artwork Area */}
          <div className="h-14 flex items-center justify-center text-3xl mt-4">
            {card.artwork}
          </div>

          {/* Card Name */}
          <div 
            className="px-1.5 py-0.5 text-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <span className="text-[10px] font-bold text-white leading-tight block truncate">
              {isDE ? card.nameDE : card.name}
            </span>
          </div>

          {/* Card Value/Description */}
          <div className="px-1.5 py-1 text-center flex-1">
            <span className="text-[8px] text-white/80 leading-tight line-clamp-2">
              {isDE ? card.descriptionDE : card.description}
            </span>
          </div>

          {/* Rarity indicator */}
          {card.rarity !== 'starter' && card.rarity !== 'common' && (
            <div 
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded"
              style={{ background: rarityBorder }}
            />
          )}

          {/* Legendary shimmer effect */}
          {card.rarity === 'legendary' && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 40%, rgba(255,215,0,0.3) 50%, transparent 60%)',
                animation: 'shimmer 2s infinite',
                backgroundSize: '200% 200%'
              }}
            />
          )}

          {/* Not playable overlay */}
          {!canPlay && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-red-400 text-xs font-bold">
                {isDE ? 'Zu teuer' : 'No energy'}
              </span>
            </div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="relative w-full" style={{ height: '160px' }}>
      {/* Hand Container */}
      <div 
        className="absolute bottom-0 left-0 right-0 flex justify-center items-end"
        style={{ 
          height: '140px',
          paddingBottom: '10px'
        }}
      >
        {cards.map((card, index) => renderCard(card, index))}
      </div>

      {/* Hand size indicator */}
      <div className="absolute bottom-2 right-4 text-xs text-gray-500 font-mono">
        {cards.length} {isDE ? 'Karten' : 'cards'}
      </div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 200%; }
          100% { background-position: -200% -200%; }
        }
      `}</style>
    </div>
  );
};

export default DeckbuilderHand;
