// ============================================
// KARTENSCHMIEDE - Card Collection View
// ============================================
// Shows all collected cards with filtering and stats

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Sparkles, Grid, List, Lock, ChevronDown } from 'lucide-react';
import { DeckbuilderCardComponent, MiniCard } from './DeckbuilderCard';
import { ALL_CARDS, getCardsByElement, getCardsByRarity, TOTAL_CARD_COUNT } from '../utils/deckbuilder/cards';
import { DeckbuilderCard, CardElement, CardRarity, DeckbuilderPlayerState } from '../utils/deckbuilder/types';

interface CardCollectionViewProps {
  playerData: DeckbuilderPlayerState;
  onBack: () => void;
  onCardClick?: (card: DeckbuilderCard) => void;
}

type ViewMode = 'grid' | 'list';
type SortMode = 'rarity' | 'element' | 'cost' | 'name' | 'owned';

const ELEMENT_LABELS: Record<CardElement, { name: string; icon: string; color: string }> = {
  fire: { name: 'Feuer', icon: '🔥', color: '#FF006E' },
  water: { name: 'Wasser', icon: '💧', color: '#0096FF' },
  earth: { name: 'Erde', icon: '🌍', color: '#228B22' },
  air: { name: 'Luft', icon: '💨', color: '#87CEEB' },
  void: { name: 'Leere', icon: '🌑', color: '#4B0082' },
};

const RARITY_ORDER: CardRarity[] = ['legendary', 'rare', 'uncommon', 'common', 'starter'];
const RARITY_COLORS: Record<CardRarity, string> = {
  starter: '#666666',
  common: '#AAAAAA',
  uncommon: '#00FF00',
  rare: '#0096FF',
  legendary: '#FFD700',
};

export const CardCollectionView: React.FC<CardCollectionViewProps> = ({
  playerData,
  onBack,
  onCardClick,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortMode, setSortMode] = useState<SortMode>('rarity');
  const [searchQuery, setSearchQuery] = useState('');
  const [elementFilter, setElementFilter] = useState<CardElement | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<CardRarity | 'all'>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DeckbuilderCard | null>(null);

  // Get playable cards only (no curses/status)
  const playableCards = useMemo(() => 
    ALL_CARDS.filter(c => c.type !== 'curse' && c.type !== 'status'),
    []
  );

  // Calculate stats
  const stats = useMemo(() => {
    const owned = Object.keys(playerData.collection).length;
    const total = playableCards.length;
    const byElement: Record<CardElement, { owned: number; total: number }> = {
      fire: { owned: 0, total: 0 },
      water: { owned: 0, total: 0 },
      earth: { owned: 0, total: 0 },
      air: { owned: 0, total: 0 },
      void: { owned: 0, total: 0 },
    };
    const byRarity: Record<CardRarity, { owned: number; total: number }> = {
      starter: { owned: 0, total: 0 },
      common: { owned: 0, total: 0 },
      uncommon: { owned: 0, total: 0 },
      rare: { owned: 0, total: 0 },
      legendary: { owned: 0, total: 0 },
    };

    playableCards.forEach(card => {
      byElement[card.element].total++;
      byRarity[card.rarity].total++;
      if (playerData.collection[card.id]) {
        byElement[card.element].owned++;
        byRarity[card.rarity].owned++;
      }
    });

    return { owned, total, byElement, byRarity };
  }, [playerData.collection, playableCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let cards = [...playableCards];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.nameDE.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.descriptionDE.toLowerCase().includes(query)
      );
    }

    // Apply element filter
    if (elementFilter !== 'all') {
      cards = cards.filter(c => c.element === elementFilter);
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      cards = cards.filter(c => c.rarity === rarityFilter);
    }

    // Apply owned filter
    if (showOwnedOnly) {
      cards = cards.filter(c => playerData.collection[c.id]);
    }

    // Sort
    cards.sort((a, b) => {
      const aOwned = !!playerData.collection[a.id];
      const bOwned = !!playerData.collection[b.id];

      switch (sortMode) {
        case 'rarity':
          const aRank = RARITY_ORDER.indexOf(a.rarity);
          const bRank = RARITY_ORDER.indexOf(b.rarity);
          if (aRank !== bRank) return aRank - bRank;
          return a.cost - b.cost;
        case 'element':
          if (a.element !== b.element) return a.element.localeCompare(b.element);
          return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
        case 'cost':
          if (a.cost !== b.cost) return a.cost - b.cost;
          return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
        case 'name':
          return a.nameDE.localeCompare(b.nameDE);
        case 'owned':
          if (aOwned !== bOwned) return bOwned ? 1 : -1;
          return RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
        default:
          return 0;
      }
    });

    return cards;
  }, [playableCards, searchQuery, elementFilter, rarityFilter, showOwnedOnly, sortMode, playerData.collection]);

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--color-bg)' }}>
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
        className="mx-4 mt-4 p-4 flex items-center justify-between"
        style={{
          background: 'var(--color-surface)',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
        }}
      >
        <button
          onClick={onBack}
          className="w-12 h-12 flex items-center justify-center"
          style={{
            background: '#FF006E',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          <ArrowLeft size={24} color="#FFF" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black uppercase" style={{ color: 'var(--color-text)' }}>
            Kartensammlung
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Sparkles size={16} className="text-yellow-400" />
            <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              {stats.owned} / {stats.total} Karten
            </span>
          </div>
        </div>

        {/* Collection Progress */}
        <div className="flex flex-col items-end">
          <div className="text-2xl font-black" style={{ color: '#FFD700' }}>
            {Math.round((stats.owned / stats.total) * 100)}%
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mx-4 mt-2 p-3 flex flex-wrap gap-2 justify-center"
        style={{ background: 'var(--color-surface)', border: '3px solid #000' }}
      >
        {Object.entries(ELEMENT_LABELS).map(([element, { name, icon, color }]) => (
          <div
            key={element}
            className="px-3 py-1 flex items-center gap-1 text-xs font-bold cursor-pointer transition-all"
            style={{
              background: elementFilter === element ? color : 'transparent',
              color: elementFilter === element ? '#FFF' : 'var(--color-text)',
              border: `2px solid ${color}`,
            }}
            onClick={() => setElementFilter(elementFilter === element ? 'all' : element as CardElement)}
          >
            <span>{icon}</span>
            <span>{stats.byElement[element as CardElement].owned}/{stats.byElement[element as CardElement].total}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mx-4 mt-2 p-3 flex flex-wrap gap-2 items-center"
        style={{ background: 'var(--color-surface)', border: '3px solid #000' }}
      >
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Karte suchen..."
            className="w-full pl-10 pr-3 py-2 font-bold text-sm"
            style={{
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '2px solid #000',
            }}
          />
        </div>

        {/* Rarity Filter */}
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value as CardRarity | 'all')}
          className="px-3 py-2 font-bold text-sm"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '2px solid #000',
          }}
        >
          <option value="all">Alle Seltenheiten</option>
          <option value="legendary">Legendär</option>
          <option value="rare">Selten</option>
          <option value="uncommon">Ungewöhnlich</option>
          <option value="common">Gewöhnlich</option>
        </select>

        {/* Sort */}
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value as SortMode)}
          className="px-3 py-2 font-bold text-sm"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '2px solid #000',
          }}
        >
          <option value="rarity">Nach Seltenheit</option>
          <option value="element">Nach Element</option>
          <option value="cost">Nach Kosten</option>
          <option value="name">Nach Name</option>
          <option value="owned">Besitz zuerst</option>
        </select>

        {/* Owned Toggle */}
        <button
          onClick={() => setShowOwnedOnly(!showOwnedOnly)}
          className="px-3 py-2 font-bold text-sm"
          style={{
            background: showOwnedOnly ? '#06FFA5' : 'var(--color-bg)',
            color: showOwnedOnly ? '#000' : 'var(--color-text)',
            border: '2px solid #000',
          }}
        >
          Nur Besitz
        </button>

        {/* View Mode */}
        <div className="flex">
          <button
            onClick={() => setViewMode('grid')}
            className="p-2"
            style={{
              background: viewMode === 'grid' ? '#8338EC' : 'var(--color-bg)',
              color: viewMode === 'grid' ? '#FFF' : 'var(--color-text)',
              border: '2px solid #000',
            }}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="p-2"
            style={{
              background: viewMode === 'list' ? '#8338EC' : 'var(--color-bg)',
              color: viewMode === 'list' ? '#FFF' : 'var(--color-text)',
              border: '2px solid #000',
              borderLeft: 'none',
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Card Grid/List */}
      <div className="flex-1 overflow-auto p-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
            {filteredCards.map((card) => {
              const owned = playerData.collection[card.id];
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                  onClick={() => {
                    setSelectedCard(card);
                    onCardClick?.(card);
                  }}
                >
                  <DeckbuilderCardComponent
                    card={card}
                    size="medium"
                    disabled={!owned}
                    glowOnHover={!!owned}
                  />
                  {!owned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                      <Lock size={32} className="text-gray-400" />
                    </div>
                  )}
                  {owned && owned.count > 1 && (
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center font-black text-sm"
                      style={{
                        background: '#FFD700',
                        color: '#000',
                        border: '3px solid #000',
                      }}
                    >
                      x{owned.count}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl mx-auto">
            {filteredCards.map((card) => {
              const owned = playerData.collection[card.id];
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`relative ${!owned ? 'opacity-50' : ''}`}
                  onClick={() => {
                    setSelectedCard(card);
                    onCardClick?.(card);
                  }}
                >
                  <MiniCard
                    card={card}
                    count={owned?.count || 0}
                    onClick={() => setSelectedCard(card)}
                  />
                  {!owned && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Lock size={16} className="text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              Keine Karten gefunden
            </p>
            <p className="text-sm opacity-70" style={{ color: 'var(--color-text)' }}>
              Versuche andere Filter
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
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DeckbuilderCardComponent
                card={selectedCard}
                size="large"
                isNew={false}
                glowOnHover={false}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setSelectedCard(null)}
                  className="px-6 py-2 font-black uppercase"
                  style={{
                    background: '#FF006E',
                    color: '#FFF',
                    border: '3px solid #000',
                  }}
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardCollectionView;
