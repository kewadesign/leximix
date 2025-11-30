// ============================================
// KARTENSCHMIEDE - Player Status Component
// ============================================
// Shows player HP, block, energy, and status effects

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Zap } from 'lucide-react';
import { StatusEffect } from '../../utils/deckbuilder/types';

interface PlayerStatusProps {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  statusEffects: StatusEffect[];
  language?: 'EN' | 'DE' | 'ES';
}

// Status effect icons and descriptions
const STATUS_CONFIG: Record<string, { icon: string; color: string; desc: string; descDE: string }> = {
  strength: { icon: '💪', color: '#EF4444', desc: '+1 damage per attack', descDE: '+1 Schaden pro Angriff' },
  dexterity: { icon: '🎯', color: '#3B82F6', desc: '+1 block per skill', descDE: '+1 Block pro Fähigkeit' },
  vulnerable: { icon: '💔', color: '#F59E0B', desc: 'Take 50% more damage', descDE: 'Nimm 50% mehr Schaden' },
  weak: { icon: '😵', color: '#8B5CF6', desc: 'Deal 25% less damage', descDE: 'Verursache 25% weniger Schaden' },
  frail: { icon: '🦴', color: '#6B7280', desc: 'Gain 25% less block', descDE: 'Erhalte 25% weniger Block' },
  poison: { icon: '☠️', color: '#10B981', desc: 'Lose HP each turn', descDE: 'Verliere LP pro Runde' },
  burn: { icon: '🔥', color: '#F97316', desc: 'Take damage end of turn', descDE: 'Schaden am Rundenende' },
  regen: { icon: '💚', color: '#22C55E', desc: 'Heal at turn start', descDE: 'Heile am Rundenbeginn' },
  thorns: { icon: '🌹', color: '#DC2626', desc: 'Deal damage when hit', descDE: 'Schaden bei Treffer' },
  artifact: { icon: '🛡️', color: '#FBBF24', desc: 'Block next debuff', descDE: 'Blockiere nächste Schwächung' },
  energized: { icon: '⚡', color: '#A855F7', desc: '+Energy next turn', descDE: '+Energie nächste Runde' },
};

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
  hp,
  maxHp,
  block,
  energy,
  maxEnergy,
  statusEffects,
  language = 'DE'
}) => {
  const isDE = language === 'DE';
  const hpPercent = (hp / maxHp) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main Stats Row */}
      <div className="flex items-center gap-6">
        {/* HP */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" fill="#EF4444" />
            <span className="text-2xl font-black text-white">
              {hp}
            </span>
            <span className="text-gray-400">/ {maxHp}</span>
          </div>
          
          {/* HP Bar */}
          <div 
            className="w-32 h-3 mt-1 rounded-full overflow-hidden"
            style={{ background: '#374151', border: '2px solid #4B5563' }}
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
        </div>

        {/* Block */}
        {block > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0 #000'
            }}
          >
            <Shield className="w-5 h-5 text-white" />
            <span className="text-xl font-black text-white">{block}</span>
          </motion.div>
        )}

        {/* Energy */}
        <div className="flex items-center gap-1">
          {Array.from({ length: maxEnergy }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: i < energy 
                  ? 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
                  : '#374151',
                border: `3px solid ${i < energy ? '#000' : '#4B5563'}`,
                boxShadow: i < energy ? '2px 2px 0 #000' : 'none'
              }}
            >
              <Zap 
                className="w-5 h-5" 
                style={{ color: i < energy ? '#FFF' : '#4B5563' }}
                fill={i < energy ? '#FFF' : 'none'}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Status Effects */}
      {statusEffects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 flex-wrap justify-center"
        >
          {statusEffects.map((effect, index) => {
            const config = STATUS_CONFIG[effect.type];
            if (!config) return null;

            return (
              <motion.div
                key={`${effect.type}-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-1 px-2 py-1 rounded cursor-help"
                style={{ 
                  background: `${config.color}33`,
                  border: `2px solid ${config.color}`
                }}
                title={isDE ? config.descDE : config.desc}
              >
                <span className="text-lg">{config.icon}</span>
                <span 
                  className="font-black text-sm"
                  style={{ color: config.color }}
                >
                  {effect.stacks}
                </span>
                {effect.duration !== undefined && (
                  <span className="text-xs text-gray-400">
                    ({effect.duration})
                  </span>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default PlayerStatus;
