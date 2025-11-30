// ============================================
// KARTENSCHMIEDE - Card Pack Shop
// ============================================
// Dedicated shop section for card packs

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Coins, Sparkles, Info, X, ChevronRight } from 'lucide-react';
import { CardPack, DeckbuilderPlayerState, PackOpeningResult } from '../utils/deckbuilder/types';
import { CARD_PACKS, getPackById, PITY_CONFIG } from '../utils/deckbuilder/gacha';
import { purchasePack } from '../utils/deckbuilder/rewards';
import { CardPackOpening } from './CardPackOpening';

interface CardPackShopProps {
  playerData: DeckbuilderPlayerState;
  coins: number;
  onPurchase: (
    packId: string, 
    payWithGems: boolean, 
    coinsSpent: number, 
    gemsSpent: number,
    updatedDeckbuilderData: DeckbuilderPlayerState
  ) => void;
  onViewCollection?: () => void;
}

const PACK_COLORS: Record<string, { primary: string; accent: string }> = {
  basic: { primary: '#666', accent: '#888' },
  standard: { primary: '#0096FF', accent: '#00D9FF' },
  premium: { primary: '#FFD700', accent: '#FFA500' },
  element_fire: { primary: '#FF006E', accent: '#FF7F00' },
  element_water: { primary: '#0096FF', accent: '#00D9FF' },
  element_earth: { primary: '#228B22', accent: '#90EE90' },
  element_air: { primary: '#87CEEB', accent: '#E0FFFF' },
};

export const CardPackShop: React.FC<CardPackShopProps> = ({
  playerData,
  coins,
  onPurchase,
  onViewCollection,
}) => {
  const [selectedPack, setSelectedPack] = useState<CardPack | null>(null);
  const [openingResult, setOpeningResult] = useState<{ pack: CardPack; result: PackOpeningResult } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handlePurchase = (pack: CardPack, withGems: boolean) => {
    const result = purchasePack(playerData, pack.id, withGems, coins);
    
    if (result.success && result.cards && result.updatedData) {
      // Show opening animation
      setOpeningResult({
        pack,
        result: {
          cards: result.cards,
          newCards: result.newCards || [],
          dustGained: result.dustGained || 0,
          pityProgress: result.updatedData.pityCounters.standard,
        },
      });
      
      // Notify parent
      onPurchase(
        pack.id,
        withGems,
        result.coinsSpent || 0,
        result.gemsSpent || 0,
        result.updatedData
      );
    }
    
    setSelectedPack(null);
  };

  const handleOpeningComplete = () => {
    setOpeningResult(null);
  };

  // Get pity progress for display
  const getPityProgress = () => {
    const current = playerData.pityCounters.standard;
    const softPity = PITY_CONFIG.softPityStart;
    const hardPity = PITY_CONFIG.hardPity;
    
    if (current >= softPity) {
      return {
        text: `Soft Pity aktiv! (${current}/${hardPity})`,
        color: '#FFD700',
        percent: ((current - softPity) / (hardPity - softPity)) * 100,
      };
    }
    
    return {
      text: `${current}/${softPity} bis Soft Pity`,
      color: '#8338EC',
      percent: (current / softPity) * 100,
    };
  };

  const pityInfo = getPityProgress();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift size={24} className="text-purple-500" />
          <h3 className="font-black text-lg uppercase" style={{ color: 'var(--color-text)' }}>
            Kartenpakete
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Pity Counter */}
          <div
            className="px-3 py-1 flex items-center gap-2 cursor-pointer"
            style={{ background: 'var(--color-surface)', border: '2px solid #000' }}
            onClick={() => setShowInfo(true)}
          >
            <Sparkles size={14} style={{ color: pityInfo.color }} />
            <span className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
              {pityInfo.text}
            </span>
            <Info size={12} className="text-gray-400" />
          </div>
          
          {/* Collection Button */}
          {onViewCollection && (
            <button
              onClick={onViewCollection}
              className="px-3 py-1 font-bold text-xs uppercase flex items-center gap-1"
              style={{
                background: '#8338EC',
                color: '#FFF',
                border: '2px solid #000',
              }}
            >
              Sammlung <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Currency Display */}
      <div className="flex gap-3">
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: '#FFBE0B',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          <Coins size={18} style={{ color: '#000' }} />
          <span className="font-black text-black">{coins.toLocaleString()}</span>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: '#8338EC',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          <span>💎</span>
          <span className="font-black text-white">{playerData.gems.toLocaleString()}</span>
        </div>
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CARD_PACKS.map((pack, index) => {
          const colors = PACK_COLORS[pack.id] || PACK_COLORS.standard;
          const canAffordCoins = pack.coinsCost !== null && coins >= pack.coinsCost;
          const canAffordGems = pack.gemsCost !== null && playerData.gems >= pack.gemsCost;
          
          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="relative p-4 flex flex-col items-center cursor-pointer"
              style={{
                background: 'var(--color-surface)',
                border: '4px solid #000',
                boxShadow: `6px 6px 0px ${colors.primary}`,
              }}
              onClick={() => setSelectedPack(pack)}
            >
              {/* Pack Icon */}
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-5xl mb-2"
              >
                {pack.icon}
              </motion.div>

              {/* Pack Name */}
              <h4
                className="font-black uppercase text-sm text-center mb-1"
                style={{ color: colors.primary }}
              >
                {pack.nameDE}
              </h4>

              {/* Card Count */}
              <div
                className="px-2 py-0.5 text-xs font-black uppercase mb-2"
                style={{ background: '#000', color: '#FFF' }}
              >
                {pack.cardCount} Karten
              </div>

              {/* Description */}
              <p
                className="text-[10px] text-center mb-3 opacity-70"
                style={{ color: 'var(--color-text)' }}
              >
                {pack.descriptionDE}
              </p>

              {/* Prices */}
              <div className="flex gap-2 w-full mt-auto">
                {pack.coinsCost !== null && (
                  <div
                    className={`flex-1 py-1.5 text-center font-black text-xs flex items-center justify-center gap-1 ${!canAffordCoins ? 'opacity-50' : ''}`}
                    style={{
                      background: canAffordCoins ? '#FFBE0B' : '#666',
                      color: '#000',
                      border: '2px solid #000',
                    }}
                  >
                    <Coins size={12} />
                    {pack.coinsCost}
                  </div>
                )}
                {pack.gemsCost !== null && (
                  <div
                    className={`flex-1 py-1.5 text-center font-black text-xs flex items-center justify-center gap-1 ${!canAffordGems ? 'opacity-50' : ''}`}
                    style={{
                      background: canAffordGems ? '#8338EC' : '#666',
                      color: '#FFF',
                      border: '2px solid #000',
                    }}
                  >
                    💎 {pack.gemsCost}
                  </div>
                )}
              </div>

              {/* Premium Badge */}
              {pack.id === 'premium' && (
                <div
                  className="absolute -top-2 -right-2 px-2 py-0.5 font-black text-[8px] uppercase"
                  style={{
                    background: '#FFD700',
                    color: '#000',
                    border: '2px solid #000',
                    transform: 'rotate(12deg)',
                  }}
                >
                  Best Value
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {selectedPack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setSelectedPack(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md p-6"
              style={{
                background: 'var(--color-surface)',
                border: '4px solid #000',
                boxShadow: '8px 8px 0px #000',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPack(null)}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center"
                style={{ background: '#FF006E', border: '2px solid #000' }}
              >
                <X size={16} color="#FFF" />
              </button>

              {/* Pack Info */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{selectedPack.icon}</div>
                <h3
                  className="text-2xl font-black uppercase mb-2"
                  style={{ color: PACK_COLORS[selectedPack.id]?.primary || '#8338EC' }}
                >
                  {selectedPack.nameDE}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  {selectedPack.descriptionDE}
                </p>
              </div>

              {/* Purchase Options */}
              <div className="space-y-3">
                {selectedPack.coinsCost !== null && (
                  <button
                    onClick={() => handlePurchase(selectedPack, false)}
                    disabled={coins < selectedPack.coinsCost}
                    className="w-full py-4 font-black uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    style={{
                      background: coins >= selectedPack.coinsCost ? '#FFBE0B' : '#666',
                      color: '#000',
                      border: '4px solid #000',
                      boxShadow: '4px 4px 0px #000',
                    }}
                  >
                    <Coins size={20} />
                    {selectedPack.coinsCost.toLocaleString()} Münzen
                    {coins < selectedPack.coinsCost && (
                      <span className="text-xs">(nicht genug)</span>
                    )}
                  </button>
                )}
                {selectedPack.gemsCost !== null && (
                  <button
                    onClick={() => handlePurchase(selectedPack, true)}
                    disabled={playerData.gems < selectedPack.gemsCost}
                    className="w-full py-4 font-black uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    style={{
                      background: playerData.gems >= selectedPack.gemsCost ? '#8338EC' : '#666',
                      color: '#FFF',
                      border: '4px solid #000',
                      boxShadow: '4px 4px 0px #000',
                    }}
                  >
                    💎 {selectedPack.gemsCost.toLocaleString()} Gems
                    {playerData.gems < selectedPack.gemsCost && (
                      <span className="text-xs">(nicht genug)</span>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pack Opening Animation */}
      <AnimatePresence>
        {openingResult && (
          <CardPackOpening
            pack={openingResult.pack}
            result={openingResult.result}
            onClose={handleOpeningComplete}
            onComplete={handleOpeningComplete}
          />
        )}
      </AnimatePresence>

      {/* Pity Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm p-6"
              style={{
                background: 'var(--color-surface)',
                border: '4px solid #000',
                boxShadow: '8px 8px 0px #8338EC',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black uppercase mb-4 text-center" style={{ color: '#8338EC' }}>
                Pity-System
              </h3>
              
              <div className="space-y-3 text-sm" style={{ color: 'var(--color-text)' }}>
                <p>
                  <strong>Soft Pity (ab {PITY_CONFIG.softPityStart} Pulls):</strong><br />
                  Die Chance auf eine Legendäre Karte steigt mit jedem Pull um {PITY_CONFIG.softPityBonus}%.
                </p>
                <p>
                  <strong>Hard Pity ({PITY_CONFIG.hardPity} Pulls):</strong><br />
                  Garantierte Legendäre Karte!
                </p>
                <p className="opacity-70">
                  Der Zähler wird zurückgesetzt, wenn du eine Legendäre Karte erhältst.
                </p>
              </div>

              {/* Current Progress */}
              <div className="mt-4 p-3" style={{ background: 'var(--color-bg)', border: '2px solid #000' }}>
                <div className="flex justify-between text-xs font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                  <span>Aktueller Fortschritt</span>
                  <span>{playerData.pityCounters.standard}/{PITY_CONFIG.hardPity}</span>
                </div>
                <div className="h-3 bg-gray-700 rounded">
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${(playerData.pityCounters.standard / PITY_CONFIG.hardPity) * 100}%`,
                      background: playerData.pityCounters.standard >= PITY_CONFIG.softPityStart ? '#FFD700' : '#8338EC',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowInfo(false)}
                className="w-full mt-4 py-2 font-black uppercase"
                style={{
                  background: '#8338EC',
                  color: '#FFF',
                  border: '3px solid #000',
                }}
              >
                Verstanden
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardPackShop;
