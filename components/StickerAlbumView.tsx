import React, { useState } from 'react';
import { ArrowLeft, Gift, Trophy, Lock, Check, Sparkles, Star, Crown } from 'lucide-react';
import { UserState, StickerCategory, Sticker } from '../types';
import { STICKER_CATEGORIES, STICKERS, getStickersByCategory, getFrameById } from '../constants';
import { audio } from '../utils/audio';

interface Props {
  user: UserState;
  onClose: () => void;
  onClaimCategoryReward: (categoryId: string) => void;
}

const RARITY_COLORS = {
  common: { bg: '#06FFA5', border: '#000', text: '#000' },
  rare: { bg: '#0096FF', border: '#000', text: '#FFF' },
  epic: { bg: '#8338EC', border: '#000', text: '#FFF' },
  legendary: { bg: 'linear-gradient(135deg, #FFBE0B 0%, #FF7F00 100%)', border: '#000', text: '#000' }
};

export const StickerAlbumView: React.FC<Props> = ({ user, onClose, onClaimCategoryReward }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const isDark = user.theme === 'dark';
  const B = isDark ? '#FFF' : '#000';

  // Get user's stickers per category
  const getUserStickersInCategory = (categoryId: string): string[] => {
    return user.stickerAlbum?.[categoryId] || [];
  };

  // Calculate total progress
  const totalStickers = STICKERS.length;
  const collectedStickers = Object.values(user.stickerAlbum || {}).flat().length;
  const progressPercent = Math.round((collectedStickers / totalStickers) * 100);

  // Check if category is complete
  const isCategoryComplete = (categoryId: string): boolean => {
    const category = STICKER_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    const collected = getUserStickersInCategory(categoryId);
    return collected.length >= category.totalStickers;
  };

  // Check if category reward was claimed
  const isCategoryRewardClaimed = (categoryId: string): boolean => {
    return user.completedCategories?.includes(categoryId) || false;
  };

  return (
    <div className={`${user.theme} fixed inset-0 z-50 overflow-hidden`} style={{ 
      background: isDark 
        ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' 
        : 'linear-gradient(180deg, #FFF8E7 0%, #FFF 100%)' 
    }}>
      {/* Rainbow Bar */}
      <div className="fixed top-0 left-0 right-0 flex h-2 z-[60]">
        {['#FF006E', '#FF7F00', '#FFBE0B', '#06FFA5', '#8338EC'].map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>

      <div className="h-full flex flex-col pt-2 overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 mx-2 mt-1 mb-3" style={{
          background: 'linear-gradient(135deg, #8338EC 0%, #FF006E 100%)',
          border: `4px solid ${B}`,
          boxShadow: `6px 6px 0px ${B}`,
          transform: 'skewX(-2deg)'
        }}>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
            style={{ 
              background: isDark ? '#1a1a2e' : '#FFF', 
              border: `3px solid ${B}`,
              boxShadow: `3px 3px 0px ${B}`,
              transform: 'skewX(2deg) rotate(-3deg)'
            }}
          >
            <ArrowLeft size={20} style={{ color: B }} />
          </button>

          <div className="flex-1 text-center" style={{ transform: 'skewX(2deg)' }}>
            <h1 className="text-xl font-black uppercase text-white tracking-wider" style={{ textShadow: `2px 2px 0px ${B}` }}>
              🎴 STICKER ALBUM
            </h1>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2" style={{ transform: 'skewX(2deg)' }}>
            <div 
              className="px-3 py-1 font-black text-sm"
              style={{ 
                background: '#FFBE0B', 
                color: '#000',
                border: `3px solid ${B}`,
                boxShadow: `3px 3px 0px ${B}`,
                transform: 'rotate(2deg)'
              }}
            >
              {collectedStickers}/{totalStickers}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mx-4 mb-4 p-3" style={{
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          border: `3px solid ${B}`,
          boxShadow: `4px 4px 0px ${B}`
        }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-sm uppercase" style={{ color: isDark ? '#FFF' : '#000' }}>
              Fortschritt
            </span>
            <span 
              className="px-2 py-0.5 font-black text-xs"
              style={{ background: '#06FFA5', color: '#000', border: `2px solid ${B}` }}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="h-4 relative" style={{ background: isDark ? '#333' : '#E5E5E5', border: `2px solid ${B}` }}>
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${progressPercent}%`, 
                background: 'linear-gradient(90deg, #06FFA5 0%, #FFBE0B 50%, #FF006E 100%)' 
              }}
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">
          {!selectedCategory ? (
            // CATEGORY GRID
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {STICKER_CATEGORIES.map((category, idx) => {
                const collected = getUserStickersInCategory(category.id);
                const isComplete = isCategoryComplete(category.id);
                const isRewardClaimed = isCategoryRewardClaimed(category.id);
                const rotations = [-2, 2, -1, 1, -2, 2];

                return (
                  <button
                    key={category.id}
                    onClick={() => { audio.playClick(); setSelectedCategory(category.id); }}
                    className="relative p-4 transition-all hover:-translate-y-2 active:scale-95"
                    style={{
                      background: isDark ? '#2a2a4a' : '#FFF',
                      border: `4px solid ${B}`,
                      boxShadow: isComplete 
                        ? `6px 6px 0px #06FFA5` 
                        : `6px 6px 0px ${B}`,
                      transform: `rotate(${rotations[idx]}deg)`
                    }}
                  >
                    {/* Complete badge */}
                    {isComplete && (
                      <div 
                        className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center"
                        style={{ 
                          background: '#06FFA5', 
                          border: `3px solid ${B}`,
                          transform: 'rotate(12deg)'
                        }}
                      >
                        <Check size={16} style={{ color: '#000' }} strokeWidth={3} />
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-5xl mb-2">{category.icon}</div>

                    {/* Name */}
                    <h3 className="font-black text-sm uppercase mb-2" style={{ color: isDark ? '#FFF' : '#000' }}>
                      {category.name}
                    </h3>

                    {/* Progress */}
                    <div 
                      className="px-2 py-1 font-black text-xs"
                      style={{ 
                        background: isComplete ? '#06FFA5' : (isDark ? '#333' : '#E5E5E5'),
                        color: isComplete ? '#000' : (isDark ? '#FFF' : '#000'),
                        border: `2px solid ${B}`
                      }}
                    >
                      {collected.length}/{category.totalStickers}
                    </div>

                    {/* Reward indicator */}
                    {category.rewardFrame && (
                      <div className="mt-2 text-xs font-bold" style={{ color: '#8338EC' }}>
                        🖼️ Rahmen
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // CATEGORY DETAIL VIEW
            <div>
              {/* Back to categories */}
              <button
                onClick={() => setSelectedCategory(null)}
                className="mb-4 px-4 py-2 font-black text-sm uppercase flex items-center gap-2 transition-all hover:-translate-y-1"
                style={{ 
                  background: '#FF006E', 
                  color: '#FFF',
                  border: `3px solid ${B}`,
                  boxShadow: `4px 4px 0px ${B}`
                }}
              >
                <ArrowLeft size={16} /> Zurück
              </button>

              {(() => {
                const category = STICKER_CATEGORIES.find(c => c.id === selectedCategory)!;
                const stickers = getStickersByCategory(selectedCategory);
                const collected = getUserStickersInCategory(selectedCategory);
                const isComplete = isCategoryComplete(selectedCategory);
                const isRewardClaimed = isCategoryRewardClaimed(selectedCategory);

                return (
                  <>
                    {/* Category Header */}
                    <div 
                      className="p-4 mb-4 text-center"
                      style={{
                        background: 'linear-gradient(135deg, #FFBE0B 0%, #FF7F00 100%)',
                        border: `4px solid ${B}`,
                        boxShadow: `6px 6px 0px ${B}`,
                        transform: 'skewX(-1deg)'
                      }}
                    >
                      <div className="text-5xl mb-2">{category.icon}</div>
                      <h2 className="text-2xl font-black uppercase text-black">{category.name}</h2>
                      <div 
                        className="inline-block px-4 py-1 mt-2 font-black text-sm"
                        style={{ background: '#000', color: '#FFF' }}
                      >
                        {collected.length}/{category.totalStickers} GESAMMELT
                      </div>
                    </div>

                    {/* Reward Card */}
                    {category.rewardFrame && (
                      <div 
                        className="p-4 mb-4"
                        style={{
                          background: isComplete 
                            ? 'linear-gradient(135deg, #06FFA5 0%, #00D68F 100%)' 
                            : (isDark ? '#2a2a4a' : '#E5E5E5'),
                          border: `4px solid ${B}`,
                          boxShadow: `6px 6px 0px ${isComplete ? '#FFBE0B' : B}`,
                          transform: 'rotate(1deg)'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 flex items-center justify-center"
                              style={{ background: '#FFBE0B', border: `3px solid ${B}` }}
                            >
                              <Gift size={24} style={{ color: '#000' }} />
                            </div>
                            <div>
                              <h4 className="font-black text-sm uppercase" style={{ color: isComplete ? '#000' : (isDark ? '#FFF' : '#000') }}>
                                Belohnung
                              </h4>
                              <p className="text-xs font-bold" style={{ color: isComplete ? '#000' : (isDark ? '#AAA' : '#666') }}>
                                🖼️ {getFrameById(category.rewardFrame)?.name} + {category.rewardCoins} 💰
                              </p>
                            </div>
                          </div>

                          {isComplete && !isRewardClaimed && (
                            <button
                              onClick={() => { audio.playWin(); onClaimCategoryReward(category.id); }}
                              className="px-4 py-2 font-black text-sm uppercase flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
                              style={{ 
                                background: '#FFBE0B', 
                                color: '#000',
                                border: `3px solid ${B}`,
                                boxShadow: `4px 4px 0px ${B}`
                              }}
                            >
                              <Sparkles size={16} /> ABHOLEN!
                            </button>
                          )}

                          {isRewardClaimed && (
                            <div 
                              className="px-4 py-2 font-black text-sm uppercase flex items-center gap-2"
                              style={{ background: '#000', color: '#06FFA5', border: `3px solid ${B}` }}
                            >
                              <Check size={16} /> ERHALTEN
                            </div>
                          )}

                          {!isComplete && (
                            <div 
                              className="px-4 py-2 font-black text-sm flex items-center gap-2"
                              style={{ background: isDark ? '#333' : '#CCC', color: isDark ? '#666' : '#999', border: `3px solid ${B}` }}
                            >
                              <Lock size={16} /> GESPERRT
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sticker Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                      {stickers.map((sticker, idx) => {
                        const isCollected = collected.includes(sticker.id);
                        const rarityStyle = RARITY_COLORS[sticker.rarity];
                        const rotations = [-3, 2, -1, 3, -2, 1, -3, 2, -1, 3, -2, 1];

                        return (
                          <div
                            key={sticker.id}
                            className="relative aspect-square flex flex-col items-center justify-center p-2 transition-all"
                            style={{
                              background: isCollected 
                                ? (typeof rarityStyle.bg === 'string' && rarityStyle.bg.includes('gradient') ? rarityStyle.bg : rarityStyle.bg)
                                : (isDark ? '#1a1a2e' : '#E5E5E5'),
                              border: `3px solid ${isCollected ? rarityStyle.border : (isDark ? '#333' : '#CCC')}`,
                              boxShadow: isCollected ? `4px 4px 0px ${rarityStyle.border}` : 'none',
                              transform: `rotate(${rotations[idx % 12]}deg)`,
                              opacity: isCollected ? 1 : 0.5
                            }}
                          >
                            {isCollected ? (
                              <>
                                <span className="text-3xl">{sticker.emoji}</span>
                                <span 
                                  className="text-[8px] font-black uppercase mt-1 px-1"
                                  style={{ 
                                    color: rarityStyle.text,
                                    background: 'rgba(0,0,0,0.2)',
                                  }}
                                >
                                  {sticker.name}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-2xl opacity-30">❓</span>
                                <span className="text-[8px] font-bold mt-1" style={{ color: isDark ? '#666' : '#999' }}>
                                  ???
                                </span>
                              </>
                            )}

                            {/* Rarity indicator */}
                            {isCollected && sticker.rarity !== 'common' && (
                              <div 
                                className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[8px]"
                                style={{ 
                                  background: rarityStyle.bg,
                                  border: `2px solid ${B}`,
                                  transform: 'rotate(12deg)'
                                }}
                              >
                                {sticker.rarity === 'rare' && '⭐'}
                                {sticker.rarity === 'epic' && '💜'}
                                {sticker.rarity === 'legendary' && '👑'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickerAlbumView;
