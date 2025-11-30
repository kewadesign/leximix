// ============================================
// KARTENSCHMIEDE - Combat View Component
// ============================================
// Full combat screen with enemies, player stats, and card hand

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Shield, Layers, RotateCcw, Swords, ArrowRight, Target, Crosshair } from 'lucide-react';
import { CombatState, Enemy, DeckbuilderCard } from '../../utils/deckbuilder/types';
import { ACTS } from '../../utils/deckbuilder/mapGeneration';
import { DeckbuilderHand } from './DeckbuilderHand';
import { EnemyDisplay } from './EnemyDisplay';
import { PlayerStatus } from './PlayerStatus';
import { audio } from '../../utils/audio';

interface DeckbuilderCombatViewProps {
  combatState: CombatState;
  enemies: Enemy[];
  currentFloor: number;
  currentAct: number;
  onPlayCard: (cardIndex: number, targetIndex?: number) => void;
  onEndTurn: () => void;
  isProcessing: boolean;
  language?: 'EN' | 'DE' | 'ES';
}

export const DeckbuilderCombatView: React.FC<DeckbuilderCombatViewProps> = ({
  combatState,
  enemies,
  currentFloor,
  currentAct,
  onPlayCard,
  onEndTurn,
  isProcessing,
  language = 'DE'
}) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(0);
  const [targetLineCoords, setTargetLineCoords] = useState<{x1: number, y1: number, x2: number, y2: number} | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const enemyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isDE = language === 'DE';

  const act = ACTS[currentAct - 1];
  const aliveEnemies = enemies.filter(e => e.currentHp > 0);

  // Update target line when selection changes
  useEffect(() => {
    if (selectedCardIndex !== null && playerRef.current && enemyRefs.current[selectedTargetIndex]) {
      const playerRect = playerRef.current.getBoundingClientRect();
      const enemyRect = enemyRefs.current[selectedTargetIndex]?.getBoundingClientRect();
      
      if (enemyRect) {
        setTargetLineCoords({
          x1: playerRect.left + playerRect.width / 2,
          y1: playerRect.top,
          x2: enemyRect.left + enemyRect.width / 2,
          y2: enemyRect.bottom
        });
      }
    } else {
      setTargetLineCoords(null);
    }
  }, [selectedCardIndex, selectedTargetIndex]);

  const handleCardClick = (index: number) => {
    if (isProcessing) return;

    if (selectedCardIndex === index) {
      // Double tap - play card
      audio.playSelect();
      if (aliveEnemies.length === 1) {
        onPlayCard(index, 0);
        setSelectedCardIndex(null);
      } else if (selectedTargetIndex !== null) {
        onPlayCard(index, selectedTargetIndex);
        setSelectedCardIndex(null);
      }
    } else {
      audio.playClick();
      setSelectedCardIndex(index);
      // Auto-select first alive enemy
      const firstAliveIndex = enemies.findIndex(e => e.currentHp > 0);
      setSelectedTargetIndex(firstAliveIndex >= 0 ? firstAliveIndex : 0);
    }
  };

  const handleEnemyClick = (index: number) => {
    if (enemies[index].currentHp > 0) {
      audio.playSelect();
      setSelectedTargetIndex(index);
      
      if (selectedCardIndex !== null) {
        // Play the card
        onPlayCard(selectedCardIndex, index);
        setSelectedCardIndex(null);
      }
    }
  };

  const handlePlaySelected = () => {
    if (selectedCardIndex !== null) {
      audio.playSelect();
      onPlayCard(selectedCardIndex, selectedTargetIndex);
      setSelectedCardIndex(null);
    }
  };

  // Get theme accent color for subtle overlay
  const themeAccent = act?.theme === 'fire' ? '#FF006E' : 
                      act?.theme === 'water' ? '#00D9FF' : 
                      act?.theme === 'earth' ? '#06FFA5' : 
                      act?.theme === 'air' ? '#A5B4FC' : '#8B5CF6';

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{ 
        background: 'var(--color-bg, #0a0a0a)'
      }}
    >
      {/* Theme Accent Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${themeAccent}15 0%, transparent 50%)`,
          opacity: 0.5
        }}
      />
      {/* Header - Floor Info */}
      <div 
        className="p-3 flex items-center justify-between"
        style={{ 
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '2px solid #8B5CF6'
        }}
      >
        <div className="text-sm font-bold text-gray-400">
          {isDE ? act?.nameDE : act?.name} • Floor {currentFloor}
        </div>
        <div className="text-sm font-bold text-gray-400">
          {isDE ? 'Zug' : 'Turn'} {combatState.turn}
        </div>
      </div>

      {/* Target Line SVG Overlay */}
      <AnimatePresence>
        {targetLineCoords && selectedCardIndex !== null && (
          <svg 
            className="fixed inset-0 pointer-events-none z-30"
            style={{ width: '100vw', height: '100vh' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon 
                  points="0 0, 10 3.5, 0 7" 
                  fill="#FF006E"
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              x1={targetLineCoords.x1}
              y1={targetLineCoords.y1}
              x2={targetLineCoords.x2}
              y2={targetLineCoords.y2}
              stroke="#FF006E"
              strokeWidth="4"
              strokeDasharray="10,5"
              markerEnd="url(#arrowhead)"
              filter="url(#glow)"
              style={{ 
                animation: 'dash 0.5s linear infinite'
              }}
            />
            {/* Target Crosshair */}
            <motion.circle
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              cx={targetLineCoords.x2}
              cy={targetLineCoords.y2 - 20}
              r="15"
              fill="none"
              stroke="#FF006E"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <motion.circle
              cx={targetLineCoords.x2}
              cy={targetLineCoords.y2 - 20}
              r="5"
              fill="#FF006E"
            />
          </svg>
        )}
      </AnimatePresence>

      {/* Enemy Area */}
      <div className="flex-shrink-0 p-4">
        <div className="flex justify-center gap-4 flex-wrap">
          {enemies.map((enemy, index) => (
            <div 
              key={enemy.id}
              ref={el => enemyRefs.current[index] = el}
              className="relative"
            >
              {/* Selection Ring */}
              {selectedTargetIndex === index && selectedCardIndex !== null && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="absolute -inset-2 rounded-xl pointer-events-none z-10"
                  style={{
                    border: '3px solid #FF006E',
                    boxShadow: '0 0 20px #FF006E, inset 0 0 20px rgba(255, 0, 110, 0.3)'
                  }}
                />
              )}
              <EnemyDisplay
                enemy={enemy}
                isSelected={selectedCardIndex !== null && selectedTargetIndex === index}
                isTargetable={selectedCardIndex !== null && enemy.currentHp > 0}
                onClick={() => handleEnemyClick(index)}
                language={language}
              />
              {/* Target Icon */}
              {selectedTargetIndex === index && selectedCardIndex !== null && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2"
                >
                  <Crosshair className="w-6 h-6 text-pink-500" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section - Player Stats */}
      <div className="flex-1 flex flex-col justify-center items-center p-4" ref={playerRef}>
        <PlayerStatus
          hp={combatState.player.currentHp}
          maxHp={combatState.player.maxHp}
          block={combatState.player.block}
          energy={combatState.player.energy}
          maxEnergy={combatState.player.maxEnergy}
          statusEffects={combatState.player.statusEffects}
          language={language}
        />

        {/* Draw/Discard Piles */}
        <div className="flex items-center justify-center gap-8 mt-4">
          {/* Draw Pile */}
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-16 rounded-lg flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #4B5563, #374151)',
                border: '2px solid #6B7280',
                boxShadow: '3px 3px 0 #000'
              }}
            >
              <Layers className="w-6 h-6 text-gray-400" />
              <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold px-1.5 rounded">
                {combatState.drawPile.length}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{isDE ? 'Ziehen' : 'Draw'}</span>
          </div>

          {/* End Turn Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEndTurn}
            disabled={isProcessing}
            className="px-6 py-3 font-black uppercase flex items-center gap-2"
            style={{
              background: isProcessing ? '#4B5563' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000',
              color: '#FFF',
              opacity: isProcessing ? 0.6 : 1
            }}
          >
            {isProcessing ? (
              <RotateCcw className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
            {isDE ? 'Zug Beenden' : 'End Turn'}
          </motion.button>

          {/* Discard Pile */}
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-16 rounded-lg flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, #7F1D1D, #991B1B)',
                border: '2px solid #B91C1C',
                boxShadow: '3px 3px 0 #000'
              }}
            >
              <RotateCcw className="w-6 h-6 text-red-400" />
              <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 rounded">
                {combatState.discardPile.length}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{isDE ? 'Ablage' : 'Discard'}</span>
          </div>
        </div>
      </div>

      {/* Card Hand Area */}
      <div className="flex-shrink-0 pb-4">
        <DeckbuilderHand
          cards={combatState.hand}
          energy={combatState.player.energy}
          selectedIndex={selectedCardIndex}
          onCardClick={handleCardClick}
          onPlayCard={handlePlaySelected}
          isProcessing={isProcessing}
          language={language}
        />
      </div>

      {/* Selected Card Info Overlay */}
      <AnimatePresence>
        {selectedCardIndex !== null && combatState.hand[selectedCardIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40"
          >
            <div 
              className="px-4 py-2 text-center"
              style={{
                background: 'rgba(139, 92, 246, 0.9)',
                border: '2px solid #000',
                borderRadius: '8px'
              }}
            >
              <p className="text-white text-sm font-bold">
                {aliveEnemies.length > 1 
                  ? (isDE ? 'Wähle ein Ziel!' : 'Select a target!')
                  : (isDE ? 'Tippe nochmal zum Spielen' : 'Tap again to play')
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeckbuilderCombatView;
