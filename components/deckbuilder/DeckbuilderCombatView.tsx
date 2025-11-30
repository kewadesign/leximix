// ============================================
// KARTENSCHMIEDE - Combat View Component
// ============================================
// Full combat screen with enemies, player stats, and card hand

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, Shield, Layers, RotateCcw, Swords, ArrowRight } from 'lucide-react';
import { CombatState, Enemy, DeckbuilderCard } from '../../utils/deckbuilder/types';
import { ACTS } from '../../utils/deckbuilder/mapGeneration';
import { DeckbuilderHand } from './DeckbuilderHand';
import { EnemyDisplay } from './EnemyDisplay';
import { PlayerStatus } from './PlayerStatus';

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
  const isDE = language === 'DE';

  const act = ACTS[currentAct - 1];
  const aliveEnemies = enemies.filter(e => e.currentHp > 0);

  const handleCardClick = (index: number) => {
    if (isProcessing) return;

    if (selectedCardIndex === index) {
      // Double tap - play card
      if (aliveEnemies.length === 1) {
        onPlayCard(index, 0);
        setSelectedCardIndex(null);
      } else if (selectedTargetIndex !== null) {
        onPlayCard(index, selectedTargetIndex);
        setSelectedCardIndex(null);
      }
    } else {
      setSelectedCardIndex(index);
      // Auto-select first alive enemy
      const firstAliveIndex = enemies.findIndex(e => e.currentHp > 0);
      setSelectedTargetIndex(firstAliveIndex >= 0 ? firstAliveIndex : 0);
    }
  };

  const handleEnemyClick = (index: number) => {
    if (selectedCardIndex !== null && enemies[index].currentHp > 0) {
      setSelectedTargetIndex(index);
      // Play the card
      onPlayCard(selectedCardIndex, index);
      setSelectedCardIndex(null);
    }
  };

  const handlePlaySelected = () => {
    if (selectedCardIndex !== null) {
      onPlayCard(selectedCardIndex, selectedTargetIndex);
      setSelectedCardIndex(null);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        background: `linear-gradient(135deg, ${act?.theme === 'fire' ? '#2d1f1f' : act?.theme === 'water' ? '#1f2d3d' : act?.theme === 'earth' ? '#2d2f1f' : act?.theme === 'air' ? '#2d2d3d' : '#1f1f2d'} 0%, #1a1a2e 50%, #0f0f1a 100%)` 
      }}
    >
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

      {/* Enemy Area */}
      <div className="flex-shrink-0 p-4">
        <div className="flex justify-center gap-4 flex-wrap">
          {enemies.map((enemy, index) => (
            <EnemyDisplay
              key={enemy.id}
              enemy={enemy}
              isSelected={selectedCardIndex !== null && selectedTargetIndex === index}
              isTargetable={selectedCardIndex !== null && enemy.currentHp > 0}
              onClick={() => handleEnemyClick(index)}
              language={language}
            />
          ))}
        </div>
      </div>

      {/* Middle Section - Player Stats */}
      <div className="flex-1 flex flex-col justify-center items-center p-4">
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
