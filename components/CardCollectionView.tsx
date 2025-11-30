// ============================================
// Card Collection View Component
// ============================================
// Shows all Kartenschmiede cards with ownership status

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Filter, Search, Flame, Droplets, Mountain, Wind, Moon, Star, Zap, Heart, Shield, X, Trophy } from 'lucide-react';
import { ALL_CARDS } from '../utils/deckbuilder/cards';
import { DeckbuilderCard, CardElement } from '../utils/deckbuilder/types';
import { audio } from '../utils/audio';

interface CardCollectionViewProps {
  user: any;
  onBack: () => void;
  language?: 'EN' | 'DE' | 'ES';
}

// Element configuration
const ELEMENT_CONFIG: Record<CardElement, { icon: React.ReactNode; color: string; name: string; nameDE: string }> = {
  fire: { icon: <Flame className="w-4 h-4" />, color: '#FF006E', name: 'Fire', nameDE: 'Feuer' },
  water: { icon: <Droplets className="w-4 h-4" />, color: '#00D9FF', name: 'Water', nameDE: 'Wasser' },
  earth: { icon: <Mountain className="w-4 h-4" />, color: '#06FFA5', name: 'Earth', nameDE: 'Erde' },
  air: { icon: <Wind className="w-4 h-4" />, color: '#A5B4FC', name: 'Air', nameDE: 'Luft' },
  void: { icon: <Moon className="w-4 h-4" />, color: '#8B5CF6', name: 'Void', nameDE: 'Leere' },
};

// Rarity colors
const RARITY_COLORS: Record<string, string> = {
  starter: '#9CA3AF',
  common: '#9CA3AF',
  uncommon: '#3B82F6',
  rare: '#A855F7',
  legendary: '#FFD700'
};

export const CardCollectionView: React.FC<CardCollectionViewProps> = ({
  user,
  onBack,
  language = 'DE'
}) => {
  const [selectedElement, setSelectedElement] = useState<CardElement | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<string | 'all'>('all');
  const [showOwned, setShowOwned] = useState<'all' | 'owned' | 'missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<DeckbuilderCard | null>(null);
  const isDE = language === 'DE';

  // Get user's collection
  const collection = user?.deckbuilderData?.collection || {};

  // Get unique playable cards (exclude curses/status)
  const allCards = useMemo(() => {
    return ALL_CARDS.filter(c => c.type !== 'curse' && c.type !== 'status');
  }, []);

  // Filter cards
  const filteredCards = useMemo(() => {
    return allCards.filter(card => {
      // Element filter
      if (selectedElement !== 'all' && card.element !== selectedElement) return false;
      
      // Rarity filter
      if (selectedRarity !== 'all' && card.rarity !== selectedRarity) return false;
      
      // Ownership filter
      const isOwned = collection[card.id]?.count > 0;
      if (showOwned === 'owned' && !isOwned) return false;
      if (showOwned === 'missing' && isOwned) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = (isDE ? card.nameDE : card.name).toLowerCase();
        const desc = (isDE ? card.descriptionDE : card.description).toLowerCase();
        if (!name.includes(query) && !desc.includes(query)) return false;
      }
      
      return true;
    });
  }, [allCards, selectedElement, selectedRarity, showOwned, searchQuery, collection, isDE]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = allCards.length;
    const owned = allCards.filter(c => collection[c.id]?.count > 0).length;
    const percentage = Math.round((owned / total) * 100);
    
    // Stats per element
    const elementStats: Record<string, { total: number; owned: number }> = {};
    Object.keys(ELEMENT_CONFIG).forEach(element => {
      const elementCards = allCards.filter(c => c.element === element);
      const ownedElementCards = elementCards.filter(c => collection[c.id]?.count > 0);
      elementStats[element] = {
        total: elementCards.length,
        owned: ownedElementCards.length
      };
    });
    
    return { total, owned, percentage, elementStats };
  }, [allCards, collection]);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--color-bg, #0a0a0a)' }}
    >
      {/* Rainbow Top Bar */}
      <div className="flex h-3 w-full">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header */}
      <div 
        className="sticky top-0 z-20 p-4"
        style={{ 
          background: 'var(--color-surface, #1a1a1a)',
          borderBottom: '4px solid #000'
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              audio.playClose();
              onBack();
            }}
            onMouseEnter={() => audio.playHover()}
            className="p-2"
            style={{ 
              background: '#FF006E', 
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          
          <div 
            className="flex-1 px-4 py-2"
            style={{
              background: '#8B5CF6',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000',
              transform: 'skew(-2deg)'
            }}
          >
            <h1 
              className="text-lg font-black text-white uppercase"
              style={{ transform: 'skew(2deg)' }}
            >
              {isDE ? 'Kartensammlung' : 'Card Collection'}
            </h1>
          </div>

          {/* Overall Progress */}
          <div 
            className="px-4 py-2 text-center"
            style={{
              background: '#FFBE0B',
              border: '3px solid #000',
              boxShadow: '4px 4px 0 #000'
            }}
          >
            <div className="text-xl font-black text-black">{stats.percentage}%</div>
            <div className="text-[10px] font-bold text-black/70">
              {stats.owned}/{stats.total}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder={isDE ? 'Karten suchen...' : 'Search cards...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 font-bold text-sm"
            style={{
              background: 'var(--color-bg, #0a0a0a)',
              border: '3px solid #000',
              color: 'var(--color-text, #fff)'
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Element Filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedElement('all')}
              className="px-2 py-1 text-xs font-black uppercase"
              style={{
                background: selectedElement === 'all' ? '#8B5CF6' : 'var(--color-bg)',
                border: '2px solid #000',
                color: selectedElement === 'all' ? '#FFF' : 'var(--color-text)'
              }}
            >
              {isDE ? 'Alle' : 'All'}
            </button>
            {(Object.entries(ELEMENT_CONFIG) as [CardElement, typeof ELEMENT_CONFIG['fire']][]).map(([element, config]) => (
              <button
                key={element}
                onClick={() => setSelectedElement(element)}
                className="p-1.5"
                style={{
                  background: selectedElement === element ? config.color : 'var(--color-bg)',
                  border: '2px solid #000'
                }}
              >
                {React.cloneElement(config.icon as React.ReactElement, {
                  className: 'w-4 h-4',
                  style: { color: selectedElement === element ? '#000' : config.color }
                })}
              </button>
            ))}
          </div>

          {/* Rarity Filter */}
          <select
            value={selectedRarity}
            onChange={e => setSelectedRarity(e.target.value)}
            className="px-2 py-1 text-xs font-black uppercase"
            style={{
              background: 'var(--color-bg)',
              border: '2px solid #000',
              color: 'var(--color-text)'
            }}
          >
            <option value="all">{isDE ? 'Alle Seltenheiten' : 'All Rarities'}</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="legendary">Legendary</option>
          </select>

          {/* Ownership Filter */}
          <select
            value={showOwned}
            onChange={e => setShowOwned(e.target.value as 'all' | 'owned' | 'missing')}
            className="px-2 py-1 text-xs font-black uppercase"
            style={{
              background: 'var(--color-bg)',
              border: '2px solid #000',
              color: 'var(--color-text)'
            }}
          >
            <option value="all">{isDE ? 'Alle Karten' : 'All Cards'}</option>
            <option value="owned">{isDE ? 'Im Besitz' : 'Owned'}</option>
            <option value="missing">{isDE ? 'Fehlend' : 'Missing'}</option>
          </select>
        </div>
      </div>

      {/* Element Progress Bars */}
      <div className="p-4 grid grid-cols-5 gap-2">
        {(Object.entries(ELEMENT_CONFIG) as [CardElement, typeof ELEMENT_CONFIG['fire']][]).map(([element, config]) => {
          const elemStats = stats.elementStats[element];
          const percent = elemStats ? Math.round((elemStats.owned / elemStats.total) * 100) : 0;
          
          return (
            <div key={element} className="text-center">
              <div 
                className="w-full h-2 mb-1"
                style={{ background: 'var(--color-surface)', border: '1px solid #000' }}
              >
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${percent}%`,
                    background: config.color
                  }}
                />
              </div>
              <div className="flex items-center justify-center gap-1">
                {config.icon}
                <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredCards.map((card, index) => {
            const isOwned = collection[card.id]?.count > 0;
            const count = collection[card.id]?.count || 0;
            const rarityColor = RARITY_COLORS[card.rarity] || '#9CA3AF';
            const elementColor = ELEMENT_CONFIG[card.element as CardElement]?.color || '#9CA3AF';

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01, duration: 0.2 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  audio.playClick();
                  setSelectedCard(card);
                }}
                onMouseEnter={() => audio.playHover()}
                className="cursor-pointer relative"
                style={{
                  opacity: isOwned ? 1 : 0.4,
                  filter: isOwned ? 'none' : 'grayscale(80%)'
                }}
              >
                <div
                  className="w-full aspect-[3/4] flex flex-col items-center justify-center p-2 relative overflow-hidden"
                  style={{
                    background: 'var(--color-surface, #1a1a1a)',
                    border: `3px solid ${isOwned ? rarityColor : '#374151'}`,
                    boxShadow: isOwned && card.rarity === 'legendary' 
                      ? `0 0 10px ${rarityColor}` 
                      : '3px 3px 0 #000'
                  }}
                >
                  {/* Element indicator */}
                  <div 
                    className="absolute top-1 right-1 w-4 h-4 rounded-full"
                    style={{ background: elementColor, border: '2px solid #000' }}
                  />

                  {/* Card Art */}
                  <span className="text-2xl mb-1">{card.artwork}</span>

                  {/* Card Name */}
                  <span 
                    className="text-[8px] font-bold uppercase text-center leading-tight"
                    style={{ color: 'var(--color-text, #fff)' }}
                  >
                    {isDE ? card.nameDE : card.name}
                  </span>

                  {/* Count Badge */}
                  {count > 0 && (
                    <div 
                      className="absolute bottom-1 left-1 w-5 h-5 flex items-center justify-center text-[10px] font-black"
                      style={{
                        background: '#06FFA5',
                        border: '2px solid #000',
                        color: '#000'
                      }}
                    >
                      {count}
                    </div>
                  )}

                  {/* Not owned overlay */}
                  {!isOwned && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl">❓</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="font-bold" style={{ color: 'var(--color-text-muted)' }}>
              {isDE ? 'Keine Karten gefunden' : 'No cards found'}
            </p>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)' }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm"
              style={{
                background: 'var(--color-surface, #1a1a1a)',
                border: `4px solid ${RARITY_COLORS[selectedCard.rarity]}`,
                boxShadow: selectedCard.rarity === 'legendary' 
                  ? `0 0 30px ${RARITY_COLORS[selectedCard.rarity]}, 8px 8px 0 #000`
                  : '8px 8px 0 #000'
              }}
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedCard(null)}
                className="absolute top-2 right-2 p-1"
                style={{ background: '#FF006E', border: '2px solid #000' }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>

              {/* Card Header */}
              <div 
                className="p-4 text-center"
                style={{ 
                  background: ELEMENT_CONFIG[selectedCard.element as CardElement]?.color || '#8B5CF6',
                  borderBottom: '4px solid #000'
                }}
              >
                <span className="text-5xl block mb-2">{selectedCard.artwork}</span>
                <h2 className="text-xl font-black text-black uppercase">
                  {isDE ? selectedCard.nameDE : selectedCard.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span 
                    className="px-2 py-0.5 text-xs font-black uppercase"
                    style={{ background: '#000', color: RARITY_COLORS[selectedCard.rarity] }}
                  >
                    {selectedCard.rarity}
                  </span>
                  <span 
                    className="px-2 py-0.5 text-xs font-black uppercase"
                    style={{ background: '#000', color: '#FFF' }}
                  >
                    {selectedCard.type}
                  </span>
                </div>
              </div>

              {/* Card Stats */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                      {isDE ? 'Kosten' : 'Cost'}
                    </span>
                  </div>
                  <span className="text-2xl font-black text-yellow-500">{selectedCard.cost}</span>
                </div>

                {selectedCard.value > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedCard.type === 'attack' ? (
                        <Heart className="w-5 h-5 text-red-500" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-500" />
                      )}
                      <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                        {isDE ? 'Wert' : 'Value'}
                      </span>
                    </div>
                    <span className="text-2xl font-black" style={{ color: selectedCard.type === 'attack' ? '#EF4444' : '#3B82F6' }}>
                      {selectedCard.value}
                    </span>
                  </div>
                )}

                {/* Description */}
                <div 
                  className="p-3 mt-4"
                  style={{ 
                    background: 'var(--color-bg)',
                    border: '2px solid #000'
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {isDE ? selectedCard.descriptionDE : selectedCard.description}
                  </p>
                </div>

                {/* Ownership Status */}
                <div className="text-center pt-2">
                  {collection[selectedCard.id]?.count > 0 ? (
                    <div className="flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-black text-green-500">
                        {isDE ? 'Im Besitz' : 'Owned'}: {collection[selectedCard.id].count}x
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold" style={{ color: 'var(--color-text-muted)' }}>
                      {isDE ? 'Noch nicht freigeschaltet' : 'Not yet unlocked'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardCollectionView;
