// ============================================
// KARTENSCHMIEDE - Enemy Display Component
// ============================================
// Shows enemy with HP, intent, and status effects

import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Shield, TrendingUp, AlertTriangle, Zap, HelpCircle, Heart, Crown } from 'lucide-react';
import { Enemy, StatusEffect, EnemyIntent, EnemyIntentType } from '../../utils/deckbuilder/types';

interface EnemyDisplayProps {
  enemy: Enemy;
  isSelected: boolean;
  isTargetable: boolean;
  onClick: () => void;
  language?: 'EN' | 'DE' | 'ES';
}

// Intent icons and colors
const INTENT_CONFIG: Record<EnemyIntentType, { icon: React.ReactNode; color: string; label: string; labelDE: string }> = {
  attack: { icon: <Swords className="w-5 h-5" />, color: '#EF4444', label: 'Attack', labelDE: 'Angriff' },
  defend: { icon: <Shield className="w-5 h-5" />, color: '#3B82F6', label: 'Block', labelDE: 'Block' },
  buff: { icon: <TrendingUp className="w-5 h-5" />, color: '#F59E0B', label: 'Buff', labelDE: 'Stärken' },
  debuff: { icon: <AlertTriangle className="w-5 h-5" />, color: '#8B5CF6', label: 'Debuff', labelDE: 'Schwächen' },
  special: { icon: <Zap className="w-5 h-5" />, color: '#EC4899', label: 'Special', labelDE: 'Spezial' },
  unknown: { icon: <HelpCircle className="w-5 h-5" />, color: '#6B7280', label: '???', labelDE: '???' },
};

// Status effect icons
const STATUS_ICONS: Record<string, string> = {
  strength: '💪',
  dexterity: '🎯',
  vulnerable: '💔',
  weak: '😵',
  frail: '🦴',
  poison: '☠️',
  burn: '🔥',
  regen: '💚',
  thorns: '🌹',
  artifact: '🛡️',
  energized: '⚡',
};

export const EnemyDisplay: React.FC<EnemyDisplayProps> = ({
  enemy,
  isSelected,
  isTargetable,
  onClick,
  language = 'DE'
}) => {
  const isDE = language === 'DE';
  const isDead = enemy.currentHp <= 0;
  const hpPercent = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
  
  // Get current intent
  const currentIntent = enemy.intents[enemy.currentIntentIndex % enemy.intents.length];
  const intentConfig = INTENT_CONFIG[currentIntent?.type || 'unknown'];

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isDead ? 0.8 : 1, 
        opacity: isDead ? 0.3 : 1,
        y: isSelected ? -10 : 0
      }}
      whileHover={isTargetable && !isDead ? { scale: 1.05 } : {}}
      whileTap={isTargetable && !isDead ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isDead || !isTargetable}
      className={`
        relative flex flex-col items-center p-3 rounded-lg
        transition-all duration-200
        ${isTargetable && !isDead ? 'cursor-pointer' : 'cursor-default'}
      `}
      style={{
        background: isDead ? '#1F2937' : 'linear-gradient(135deg, #374151, #1F2937)',
        border: isSelected ? '3px solid #8B5CF6' : isDead ? '2px solid #374151' : '2px solid #4B5563',
        boxShadow: isSelected ? '0 0 20px rgba(139, 92, 246, 0.5), 4px 4px 0 #000' : isDead ? 'none' : '4px 4px 0 #000',
        minWidth: '120px'
      }}
    >
      {/* Boss Crown */}
      {enemy.isBoss && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Crown className="w-6 h-6 text-yellow-400" />
        </div>
      )}

      {/* Elite indicator */}
      {enemy.isElite && !enemy.isBoss && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-black px-1 rounded">
          ELITE
        </div>
      )}

      {/* Intent Indicator */}
      {!isDead && currentIntent && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded"
          style={{ 
            background: intentConfig.color,
            border: '2px solid #000'
          }}
        >
          {intentConfig.icon}
          {currentIntent.value !== undefined && (
            <span className="text-white font-black text-sm">
              {currentIntent.value}
            </span>
          )}
        </motion.div>
      )}

      {/* Enemy Artwork */}
      <div 
        className="text-5xl mb-2"
        style={{ 
          filter: isDead ? 'grayscale(1)' : 'none',
          transform: isDead ? 'rotate(-15deg)' : 'none'
        }}
      >
        {enemy.artwork}
      </div>

      {/* Enemy Name */}
      <div className="text-xs font-bold text-white text-center mb-1 truncate w-full">
        {isDE ? enemy.nameDE : enemy.name}
      </div>

      {/* HP Bar */}
      <div className="w-full">
        <div 
          className="h-3 rounded-full overflow-hidden relative"
          style={{ background: '#1F2937', border: '1px solid #374151' }}
        >
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${hpPercent}%` }}
            className="h-full"
            style={{
              background: hpPercent > 50 
                ? 'linear-gradient(90deg, #10B981, #34D399)'
                : hpPercent > 25 
                  ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                  : 'linear-gradient(90deg, #EF4444, #F87171)'
            }}
          />
        </div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <Heart className="w-3 h-3 text-red-400" />
          <span className="text-xs text-white font-bold">
            {Math.max(0, enemy.currentHp)} / {enemy.maxHp}
          </span>
        </div>
      </div>

      {/* Block Indicator */}
      {enemy.block > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded"
          style={{ background: '#3B82F6', border: '1px solid #000' }}
        >
          <Shield className="w-3 h-3 text-white" />
          <span className="text-xs font-bold text-white">{enemy.block}</span>
        </motion.div>
      )}

      {/* Status Effects */}
      {enemy.statusEffects.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap justify-center">
          {enemy.statusEffects.map((effect, index) => (
            <div
              key={`${effect.type}-${index}`}
              className="flex items-center gap-0.5 px-1 py-0.5 rounded text-xs"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              title={effect.type}
            >
              <span>{STATUS_ICONS[effect.type] || '❓'}</span>
              <span className="text-white font-bold">{effect.stacks}</span>
            </div>
          ))}
        </div>
      )}

      {/* Death overlay */}
      {isDead && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">💀</span>
        </div>
      )}

      {/* Target indicator */}
      {isTargetable && !isDead && (
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            border: '2px dashed #8B5CF6',
            animation: 'pulse 1s infinite'
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </motion.button>
  );
};

export default EnemyDisplay;
