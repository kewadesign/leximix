// ============================================
// KARTENSCHMIEDE - Card Component
// ============================================
// Beautiful card rendering with effects, animations,
// holographic shine, and rarity indicators

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeckbuilderCard, CardElement, CardRarity } from '../utils/deckbuilder/types';

interface DeckbuilderCardProps {
  card: DeckbuilderCard;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  showBack?: boolean;
  isNew?: boolean;
  playable?: boolean;
  inHand?: boolean;
  glowOnHover?: boolean;
  animateIn?: boolean;
  delay?: number;
}

// ===================
// COLOR SCHEMES
// ===================
const ELEMENT_COLORS: Record<CardElement, { primary: string; secondary: string; glow: string; gradient: string }> = {
  fire: {
    primary: '#FF006E',
    secondary: '#FF7F00',
    glow: 'rgba(255, 0, 110, 0.6)',
    gradient: 'linear-gradient(135deg, #FF006E 0%, #FF7F00 50%, #FFBE0B 100%)',
  },
  water: {
    primary: '#0096FF',
    secondary: '#00D9FF',
    glow: 'rgba(0, 150, 255, 0.6)',
    gradient: 'linear-gradient(135deg, #0096FF 0%, #00D9FF 50%, #00FFB3 100%)',
  },
  earth: {
    primary: '#8B4513',
    secondary: '#228B22',
    glow: 'rgba(34, 139, 34, 0.6)',
    gradient: 'linear-gradient(135deg, #8B4513 0%, #228B22 50%, #90EE90 100%)',
  },
  air: {
    primary: '#E0E0E0',
    secondary: '#87CEEB',
    glow: 'rgba(135, 206, 235, 0.6)',
    gradient: 'linear-gradient(135deg, #FFFFFF 0%, #87CEEB 50%, #E0FFFF 100%)',
  },
  void: {
    primary: '#4B0082',
    secondary: '#8B008B',
    glow: 'rgba(75, 0, 130, 0.8)',
    gradient: 'linear-gradient(135deg, #000000 0%, #4B0082 50%, #8B008B 100%)',
  },
};

const RARITY_EFFECTS: Record<CardRarity, { border: string; shine: boolean; particles: boolean; holo: boolean }> = {
  starter: { border: '#666666', shine: false, particles: false, holo: false },
  common: { border: '#AAAAAA', shine: false, particles: false, holo: false },
  uncommon: { border: '#00FF00', shine: true, particles: false, holo: false },
  rare: { border: '#0096FF', shine: true, particles: true, holo: false },
  legendary: { border: '#FFD700', shine: true, particles: true, holo: true },
};

const RARITY_NAMES: Record<CardRarity, string> = {
  starter: 'Basis',
  common: 'Gewöhnlich',
  uncommon: 'Ungewöhnlich',
  rare: 'Selten',
  legendary: 'Legendär',
};

const TYPE_ICONS: Record<string, string> = {
  attack: '⚔️',
  skill: '🛡️',
  power: '⭐',
  curse: '💀',
  status: '⚠️',
};

// ===================
// SIZE CONFIGS
// ===================
const SIZES = {
  small: { width: 80, height: 112, fontSize: 10, iconSize: 20 },
  medium: { width: 140, height: 196, fontSize: 12, iconSize: 32 },
  large: { width: 200, height: 280, fontSize: 14, iconSize: 48 },
};

// ===================
// MAIN COMPONENT
// ===================
export const DeckbuilderCardComponent: React.FC<DeckbuilderCardProps> = ({
  card,
  size = 'medium',
  onClick,
  disabled = false,
  selected = false,
  showBack = false,
  isNew = false,
  playable = true,
  inHand = false,
  glowOnHover = true,
  animateIn = false,
  delay = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const cardRef = useRef<HTMLDivElement>(null);

  const config = SIZES[size];
  const colors = ELEMENT_COLORS[card.element];
  const rarityEffect = RARITY_EFFECTS[card.rarity];

  // Track mouse for holographic effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x, y });
  };

  // Holographic gradient calculation
  const holoGradient = rarityEffect.holo
    ? `linear-gradient(
        ${110 + mousePos.x * 40}deg,
        rgba(255, 0, 0, 0.3) 0%,
        rgba(255, 127, 0, 0.3) 14%,
        rgba(255, 255, 0, 0.3) 28%,
        rgba(0, 255, 0, 0.3) 42%,
        rgba(0, 0, 255, 0.3) 57%,
        rgba(75, 0, 130, 0.3) 71%,
        rgba(143, 0, 255, 0.3) 85%,
        rgba(255, 0, 0, 0.3) 100%
      )`
    : 'none';

  // Card tilt based on mouse position
  const tiltX = isHovered ? (mousePos.y - 0.5) * 20 : 0;
  const tiltY = isHovered ? (mousePos.x - 0.5) * -20 : 0;

  // Card back rendering
  if (showBack) {
    return (
      <motion.div
        initial={animateIn ? { scale: 0, rotateY: 180 } : false}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay, duration: 0.4, type: 'spring' }}
        className="relative cursor-pointer"
        style={{
          width: config.width,
          height: config.height,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
          borderRadius: 8,
        }}
        onClick={onClick}
      >
        {/* Card back pattern */}
        <div
          className="absolute inset-2 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #8338EC 0px,
              #8338EC 2px,
              transparent 2px,
              transparent 10px
            )`,
          }}
        />
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex items-center justify-center font-black text-white rotate-45"
            style={{
              width: config.iconSize * 1.5,
              height: config.iconSize * 1.5,
              background: '#000',
              border: '3px solid #FFD700',
            }}
          >
            <span className="-rotate-45" style={{ fontSize: config.iconSize * 0.8 }}>K</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={animateIn ? { scale: 0, y: 50, opacity: 0 } : false}
      animate={{
        scale: selected ? 1.1 : 1,
        y: selected ? -10 : inHand && isHovered ? -20 : 0,
        opacity: disabled ? 0.5 : 1,
        rotateX: tiltX,
        rotateY: tiltY,
      }}
      transition={{ delay, duration: 0.3, type: 'spring', stiffness: 300 }}
      className={`relative cursor-pointer select-none ${disabled ? 'pointer-events-none' : ''}`}
      style={{
        width: config.width,
        height: config.height,
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={glowOnHover && !disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
    >
      {/* Card Base */}
      <div
        className="absolute inset-0 rounded-lg overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: `4px solid ${selected ? '#FFD700' : playable ? rarityEffect.border : '#666'}`,
          boxShadow: selected
            ? `0 0 20px ${colors.glow}, 8px 8px 0px ${rarityEffect.border}`
            : isHovered && glowOnHover
            ? `0 0 15px ${colors.glow}, 6px 6px 0px #000`
            : '6px 6px 0px #000',
          transition: 'all 0.2s ease',
        }}
      >
        {/* Element Background Gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: colors.gradient }}
        />

        {/* Holographic Overlay (Legendary only) */}
        {rarityEffect.holo && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background: holoGradient,
              opacity: isHovered ? 0.8 : 0.4,
              transition: 'opacity 0.3s ease',
            }}
          />
        )}

        {/* Shine Effect */}
        {rarityEffect.shine && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(
                ${45 + mousePos.x * 90}deg,
                transparent 30%,
                rgba(255, 255, 255, ${isHovered ? 0.4 : 0.2}) 50%,
                transparent 70%
              )`,
            }}
          />
        )}

        {/* Energy Cost */}
        <div
          className="absolute top-1 left-1 w-8 h-8 flex items-center justify-center font-black text-white rounded-full z-10"
          style={{
            background: colors.primary,
            border: '3px solid #000',
            fontSize: config.fontSize + 4,
          }}
        >
          {card.cost}
        </div>

        {/* Card Type Icon */}
        <div
          className="absolute top-1 right-1 z-10"
          style={{ fontSize: config.fontSize + 2 }}
        >
          {TYPE_ICONS[card.type]}
        </div>

        {/* Artwork Area */}
        <div
          className="absolute left-2 right-2 flex items-center justify-center"
          style={{
            top: config.height * 0.15,
            height: config.height * 0.35,
            background: 'rgba(0,0,0,0.3)',
            border: '2px solid #000',
            borderRadius: 4,
          }}
        >
          <span style={{ fontSize: config.iconSize }}>{card.artwork}</span>
        </div>

        {/* Card Name */}
        <div
          className="absolute left-1 right-1 text-center font-black uppercase truncate px-1"
          style={{
            top: config.height * 0.52,
            fontSize: config.fontSize,
            color: 'var(--color-text)',
            textShadow: '1px 1px 0px #000',
          }}
        >
          {card.nameDE}
        </div>

        {/* Element Indicator */}
        <div
          className="absolute left-1/2 -translate-x-1/2 px-2 py-0.5 text-center font-bold uppercase"
          style={{
            top: config.height * 0.59,
            fontSize: config.fontSize - 2,
            background: colors.primary,
            color: '#FFF',
            border: '2px solid #000',
          }}
        >
          {card.element === 'fire' && '🔥 Feuer'}
          {card.element === 'water' && '💧 Wasser'}
          {card.element === 'earth' && '🌍 Erde'}
          {card.element === 'air' && '💨 Luft'}
          {card.element === 'void' && '🌑 Leere'}
        </div>

        {/* Description */}
        <div
          className="absolute left-1 right-1 overflow-hidden text-center px-1"
          style={{
            top: config.height * 0.68,
            height: config.height * 0.22,
            fontSize: config.fontSize - 2,
            color: 'var(--color-text)',
            lineHeight: 1.2,
          }}
        >
          {card.descriptionDE}
        </div>

        {/* Rarity Bar */}
        <div
          className="absolute bottom-1 left-1 right-1 text-center font-black uppercase"
          style={{
            fontSize: config.fontSize - 3,
            color: rarityEffect.border,
            textShadow: rarityEffect.holo ? `0 0 10px ${rarityEffect.border}` : 'none',
          }}
        >
          {RARITY_NAMES[card.rarity]}
          {card.upgraded && <span className="ml-1 text-green-400">+</span>}
        </div>

        {/* Value Badge (for attacks) */}
        {card.type === 'attack' && (
          <div
            className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center font-black text-white rounded-full"
            style={{
              background: '#FF006E',
              border: '2px solid #000',
              fontSize: config.fontSize - 2,
            }}
          >
            {card.value}
          </div>
        )}

        {/* Particle Effects (Rare+) */}
        {rarityEffect.particles && isHovered && (
          <ParticleOverlay color={colors.primary} />
        )}

        {/* NEW Badge */}
        {isNew && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -15 }}
            className="absolute -top-2 -right-2 px-2 py-1 font-black text-xs uppercase z-20"
            style={{
              background: '#FF006E',
              color: '#FFF',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px #000',
            }}
          >
            NEU!
          </motion.div>
        )}

        {/* Not Playable Overlay */}
        {!playable && !disabled && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'grayscale(1)',
            }}
          >
            <span className="text-red-500 font-black text-lg">✕</span>
          </div>
        )}
      </div>

      {/* Selection Ring */}
      {selected && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -inset-2 rounded-xl pointer-events-none"
          style={{
            border: '3px solid #FFD700',
            boxShadow: '0 0 20px #FFD700',
          }}
        />
      )}
    </motion.div>
  );
};

// ===================
// PARTICLE OVERLAY
// ===================
const ParticleOverlay: React.FC<{ color: string }> = ({ color }) => {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random(),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            left: `${p.x}%`,
            bottom: 0,
            boxShadow: `0 0 4px ${color}`,
          }}
          animate={{
            y: [-10, -100],
            opacity: [1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

// ===================
// CARD REVEAL ANIMATION (for pack opening)
// ===================
export const CardRevealAnimation: React.FC<{
  card: DeckbuilderCard;
  onComplete?: () => void;
  index?: number;
}> = ({ card, onComplete, index = 0 }) => {
  const [revealed, setRevealed] = useState(false);
  const colors = ELEMENT_COLORS[card.element];
  const rarityEffect = RARITY_EFFECTS[card.rarity];

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
      setTimeout(() => onComplete?.(), 500);
    }, index * 300 + 500);
    return () => clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="back"
            initial={{ rotateY: 0, scale: 0.8 }}
            animate={{ 
              rotateY: 0, 
              scale: [0.8, 1.1, 1],
              y: [0, -20, 0],
            }}
            exit={{ rotateY: 90, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <DeckbuilderCardComponent card={card} showBack size="large" />
          </motion.div>
        ) : (
          <motion.div
            key="front"
            initial={{ rotateY: -90, scale: 0.9 }}
            animate={{ 
              rotateY: 0, 
              scale: 1,
            }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            {/* Rarity burst effect */}
            {rarityEffect.holo && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 rounded-full pointer-events-none z-50"
                style={{
                  background: `radial-gradient(circle, ${rarityEffect.border} 0%, transparent 70%)`,
                }}
              />
            )}
            <DeckbuilderCardComponent 
              card={card} 
              size="large" 
              isNew={true}
              glowOnHover={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===================
// MINI CARD (for deck display)
// ===================
export const MiniCard: React.FC<{
  card: DeckbuilderCard;
  count?: number;
  onClick?: () => void;
}> = ({ card, count = 1, onClick }) => {
  const colors = ELEMENT_COLORS[card.element];
  const rarityEffect = RARITY_EFFECTS[card.rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex items-center gap-2 p-2 cursor-pointer"
      style={{
        background: 'var(--color-surface)',
        border: `2px solid ${rarityEffect.border}`,
        boxShadow: '3px 3px 0px #000',
      }}
      onClick={onClick}
    >
      {/* Cost */}
      <div
        className="w-6 h-6 flex items-center justify-center font-black text-white text-xs rounded-full"
        style={{ background: colors.primary, border: '2px solid #000' }}
      >
        {card.cost}
      </div>

      {/* Artwork */}
      <span className="text-lg">{card.artwork}</span>

      {/* Name */}
      <span className="flex-1 font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
        {card.nameDE}
      </span>

      {/* Count */}
      {count > 1 && (
        <div
          className="w-5 h-5 flex items-center justify-center font-black text-xs"
          style={{ background: '#000', color: '#FFF' }}
        >
          x{count}
        </div>
      )}
    </motion.div>
  );
};

export default DeckbuilderCardComponent;
