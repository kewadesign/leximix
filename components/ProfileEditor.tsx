import React, { useState } from 'react';
import { Check, Lock, Sparkles, Crown, Type, Palette, CreditCard } from 'lucide-react';
import { UserState, ProfileFrame, ProfileFont, ProfileEffect, ProfileTitle, CardBack } from '../types';
import { PROFILE_FRAMES, PROFILE_FONTS, PROFILE_EFFECTS, PROFILE_TITLES, CARD_BACKS, getFrameById, getFontById, getEffectById, getTitleById, getCardBackById, STICKER_CATEGORIES } from '../constants';
import { getRarityColor } from '../utils/rewards';
import { audio } from '../utils/audio';

interface Props {
  user: UserState;
  selectedFrame: string;
  selectedFont: string;
  selectedEffect: string;
  selectedTitle?: string;
  selectedCardBack?: string;
  onFrameChange: (frameId: string) => void;
  onFontChange: (fontId: string) => void;
  onEffectChange: (effectId: string) => void;
  onTitleChange?: (titleId: string) => void;
  onCardBackChange?: (cardBackId: string) => void;
  onOpenAlbum: () => void;
  t?: any; // Translations
}

export const ProfileEditor: React.FC<Props> = ({
  user,
  selectedFrame,
  selectedFont,
  selectedEffect,
  selectedTitle,
  selectedCardBack,
  onFrameChange,
  onFontChange,
  onEffectChange,
  onTitleChange,
  onCardBackChange,
  onOpenAlbum,
  t
}) => {
  const [activeTab, setActiveTab] = useState<'frames' | 'fonts' | 'effects' | 'titles' | 'cardbacks'>('frames');
  const isDark = user.theme === 'dark';
  const B = isDark ? '#FFF' : '#000';
  const bgSurface = isDark ? '#2a2a4a' : '#FFF';
  
  // Translations with fallbacks
  const p = t?.PROFILE || {};
  const getRarityLabel = (rarity: string) => {
    const labels: Record<string, string> = {
      common: p.RARITY_COMMON || 'Common',
      rare: p.RARITY_RARE || 'Rare',
      epic: p.RARITY_EPIC || 'Epic',
      legendary: p.RARITY_LEGENDARY || 'Legendary'
    };
    return labels[rarity] || rarity;
  };

  // Check if user owns a cosmetic
  const ownsFrame = (frameId: string): boolean => {
    if (frameId === 'frame_none') return true;
    return user.ownedFrames?.includes(frameId) || false;
  };

  const ownsFont = (fontId: string): boolean => {
    if (fontId === 'font_default') return true;
    return user.ownedFonts?.includes(fontId) || false;
  };

  const ownsEffect = (effectId: string): boolean => {
    if (effectId === 'effect_none') return true;
    return user.ownedEffects?.includes(effectId) || false;
  };

  const ownsTitle = (titleId: string): boolean => {
    if (titleId === 'title_none' || titleId === 'title_newcomer') return true;
    return user.ownedTitles?.includes(titleId) || false;
  };

  const ownsCardBack = (cardBackId: string): boolean => {
    if (cardBackId === 'cardback_default') return true;
    return user.ownedCardBacks?.includes(cardBackId) || false;
  };

  // Calculate album progress
  const totalStickers = 72; // 6 categories x 12 stickers
  const collectedStickers = Object.values(user.stickerAlbum || {}).flat().length;
  const albumPercent = Math.round((collectedStickers / totalStickers) * 100);

  const tabStyle = (active: boolean) => ({
    background: active ? '#FFBE0B' : bgSurface,
    color: '#000',
    border: `3px solid ${B}`,
    boxShadow: active ? `4px 4px 0px ${B}` : 'none',
    transform: active ? 'translateY(-2px)' : 'translateY(0)'
  });

  return (
    <div className="space-y-4">
      {/* Sticker Album Button */}
      <button
        onClick={() => { audio.playClick(); onOpenAlbum(); }}
        className="w-full p-4 transition-all hover:-translate-y-1 active:scale-98"
        style={{
          background: 'linear-gradient(135deg, #FF006E 0%, #8338EC 100%)',
          border: `4px solid ${B}`,
          boxShadow: `6px 6px 0px ${B}`,
          transform: 'skewX(-2deg)'
        }}
      >
        <div className="flex items-center justify-between" style={{ transform: 'skewX(2deg)' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎴</span>
            <div className="text-left">
              <h3 className="font-black text-white uppercase tracking-wide">{p.STICKER_ALBUM || 'Sticker Album'}</h3>
              <p className="text-xs font-bold text-white/80">{p.COLLECT_STICKERS || 'Collect 72 unique stickers!'}</p>
            </div>
          </div>
          <div 
            className="px-3 py-2 font-black text-sm"
            style={{ background: '#FFBE0B', color: '#000', border: `3px solid ${B}` }}
          >
            {collectedStickers}/{totalStickers}
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2" style={{ background: 'rgba(0,0,0,0.3)', border: `2px solid ${B}`, transform: 'skewX(2deg)' }}>
          <div 
            className="h-full transition-all" 
            style={{ 
              width: `${albumPercent}%`, 
              background: 'linear-gradient(90deg, #06FFA5 0%, #FFBE0B 100%)' 
            }} 
          />
        </div>
      </button>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('frames')}
          className="flex-1 min-w-[70px] py-3 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
          style={tabStyle(activeTab === 'frames')}
        >
          <Sparkles size={12} /> {p.FRAMES || 'Frames'}
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className="flex-1 min-w-[70px] py-3 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
          style={tabStyle(activeTab === 'effects')}
        >
          <Palette size={12} /> {p.EFFECTS || 'Effects'}
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          className="flex-1 min-w-[70px] py-3 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
          style={tabStyle(activeTab === 'titles')}
        >
          <Crown size={12} /> {p.TITLES || 'Titles'}
        </button>
        <button
          onClick={() => setActiveTab('cardbacks')}
          className="flex-1 min-w-[70px] py-3 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
          style={tabStyle(activeTab === 'cardbacks')}
        >
          <CreditCard size={12} /> {p.CARDS || 'Cards'}
        </button>
        <button
          onClick={() => setActiveTab('fonts')}
          className="flex-1 min-w-[70px] py-3 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
          style={tabStyle(activeTab === 'fonts')}
        >
          <Type size={12} /> {p.FONTS || 'Font'}
        </button>
      </div>

      {/* FRAMES TAB */}
      {activeTab === 'frames' && (
        <div 
          className="p-4"
          style={{ background: bgSurface, border: `4px solid ${B}`, boxShadow: `6px 6px 0px #FF7F00` }}
        >
          <div 
            className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" 
            style={{ background: '#FF7F00', color: '#FFF', border: `2px solid ${B}` }}
          >
            {p.CHOOSE_FRAME || 'Choose Profile Frame'}
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {PROFILE_FRAMES.slice(0, 8).map((frame) => {
              const isOwned = ownsFrame(frame.id);
              const isSelected = selectedFrame === frame.id;
              
              return (
                <button
                  key={frame.id}
                  onClick={() => isOwned && onFrameChange(frame.id)}
                  disabled={!isOwned}
                  className="relative aspect-square flex flex-col items-center justify-center p-1 transition-all"
                  style={{ 
                    background: isSelected ? '#FFBE0B' : (isOwned ? bgSurface : (isDark ? '#1a1a2e' : '#E5E5E5')),
                    border: `3px solid ${isSelected ? '#FF006E' : B}`,
                    boxShadow: isSelected ? `4px 4px 0px ${B}` : 'none',
                    opacity: isOwned ? 1 : 0.5,
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {/* Frame preview */}
                  <div 
                    className={`w-8 h-8 rounded-sm ${frame.cssClass}`}
                    style={{ background: isDark ? '#333' : '#CCC', border: `2px solid ${B}` }}
                  />
                  
                  {/* Frame name */}
                  <span 
                    className="text-[8px] font-bold mt-1 text-center leading-tight"
                    style={{ color: isDark ? '#FFF' : '#000' }}
                  >
                    {frame.name.length > 8 ? frame.name.slice(0, 7) + '…' : frame.name}
                  </span>

                  {/* Lock or check indicator */}
                  {!isOwned && (
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
                      style={{ background: '#000', color: '#FFF' }}
                    >
                      <Lock size={10} />
                    </div>
                  )}
                  {isSelected && isOwned && (
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
                      style={{ background: '#06FFA5', color: '#000', border: `1px solid ${B}` }}
                    >
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}

                  {/* Rarity indicator */}
                  {frame.rarity !== 'common' && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 text-[6px] font-black uppercase text-center py-0.5"
                      style={{ background: getRarityColor(frame.rarity), color: '#000' }}
                    >
                      {frame.rarity === 'legendary' ? '★' : frame.rarity === 'epic' ? '◆' : '●'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Hint for unlocking */}
          <p className="text-[10px] font-bold mt-3 text-center" style={{ color: isDark ? '#AAA' : '#666' }}>
            {p.UNLOCK_FRAMES || 'Unlock new frames via Season Pass!'} 🎁
          </p>
        </div>
      )}

      {/* FONTS TAB */}
      {activeTab === 'fonts' && (
        <div 
          className="p-4"
          style={{ background: bgSurface, border: `4px solid ${B}`, boxShadow: `6px 6px 0px #8338EC` }}
        >
          <div 
            className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" 
            style={{ background: '#8338EC', color: '#FFF', border: `2px solid ${B}` }}
          >
            {p.PROFILE_FONT || 'Profile Name Font'}
          </div>
          
          <div className="space-y-2">
            {PROFILE_FONTS.map((font) => {
              const isOwned = ownsFont(font.id);
              const isSelected = selectedFont === font.id;
              
              return (
                <button
                  key={font.id}
                  onClick={() => isOwned && onFontChange(font.id)}
                  disabled={!isOwned}
                  className="w-full p-3 flex items-center justify-between transition-all"
                  style={{ 
                    background: isSelected ? '#FFBE0B' : (isOwned ? bgSurface : (isDark ? '#1a1a2e' : '#E5E5E5')),
                    border: `3px solid ${isSelected ? '#8338EC' : B}`,
                    boxShadow: isSelected ? `4px 4px 0px ${B}` : 'none',
                    opacity: isOwned ? 1 : 0.5
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Font preview */}
                    <span 
                      className="text-lg"
                      style={{ fontFamily: font.fontFamily, color: isDark ? '#FFF' : '#000' }}
                    >
                      {user.name || p.PLAYER || 'Player'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: isDark ? '#AAA' : '#666' }}>
                      {font.name}
                    </span>
                    {!isOwned && <Lock size={14} style={{ color: isDark ? '#666' : '#999' }} />}
                    {isSelected && isOwned && (
                      <div 
                        className="w-5 h-5 flex items-center justify-center"
                        style={{ background: '#06FFA5', border: `2px solid ${B}` }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* EFFECTS TAB */}
      {activeTab === 'effects' && (
        <div 
          className="p-4"
          style={{ background: bgSurface, border: `4px solid ${B}`, boxShadow: `6px 6px 0px #06FFA5` }}
        >
          <div 
            className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" 
            style={{ background: '#06FFA5', color: '#000', border: `2px solid ${B}` }}
          >
            {p.PROFILE_EFFECTS || 'Profile Effects'}
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {PROFILE_EFFECTS.slice(0, 12).map((effect) => {
              const isOwned = ownsEffect(effect.id);
              const isSelected = selectedEffect === effect.id;
              
              return (
                <button
                  key={effect.id}
                  onClick={() => isOwned && onEffectChange(effect.id)}
                  disabled={!isOwned}
                  className="relative aspect-square flex flex-col items-center justify-center p-2 transition-all"
                  style={{ 
                    background: isSelected ? '#FFBE0B' : (isOwned ? bgSurface : (isDark ? '#1a1a2e' : '#E5E5E5')),
                    border: `3px solid ${isSelected ? '#06FFA5' : B}`,
                    boxShadow: isSelected ? `4px 4px 0px ${B}` : 'none',
                    opacity: isOwned ? 1 : 0.5,
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {/* Effect icon */}
                  <span className="text-2xl">{effect.icon}</span>
                  
                  {/* Effect name */}
                  <span 
                    className="text-[8px] font-bold mt-1 text-center"
                    style={{ color: isDark ? '#FFF' : '#000' }}
                  >
                    {effect.name.length > 10 ? effect.name.slice(0, 9) + '…' : effect.name}
                  </span>

                  {/* Lock indicator */}
                  {!isOwned && (
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
                      style={{ background: '#000', color: '#FFF' }}
                    >
                      <Lock size={10} />
                    </div>
                  )}
                  {isSelected && isOwned && (
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
                      style={{ background: '#06FFA5', color: '#000', border: `1px solid ${B}` }}
                    >
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Show more hint */}
          <p className="text-[10px] font-bold mt-3 text-center" style={{ color: isDark ? '#AAA' : '#666' }}>
            {p.UNLOCK_EFFECTS || 'Unlock new effects via Season Pass!'} ✨
          </p>
        </div>
      )}

      {/* TITLES TAB */}
      {activeTab === 'titles' && (
        <div 
          className="p-4 animate-fade-in-up"
          style={{ background: bgSurface, border: `4px solid ${B}`, boxShadow: `6px 6px 0px #FF006E` }}
        >
          <div 
            className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" 
            style={{ background: '#FF006E', color: '#FFF', border: `2px solid ${B}` }}
          >
            {p.CHOOSE_TITLE || 'Choose Title'}
          </div>
          
          <div className="space-y-2">
            {PROFILE_TITLES.map((title) => {
              const isOwned = ownsTitle(title.id);
              const isSelected = selectedTitle === title.id || (!selectedTitle && title.id === 'title_none');
              const rarityColor = getRarityColor(title.rarity);
              
              return (
                <button
                  key={title.id}
                  onClick={() => isOwned && onTitleChange?.(title.id)}
                  disabled={!isOwned}
                  className="w-full p-3 flex items-center justify-between transition-all reward-card-hover"
                  style={{ 
                    background: isSelected ? '#FFBE0B' : (isOwned ? bgSurface : (isDark ? '#1a1a2e' : '#E5E5E5')),
                    border: `3px solid ${isSelected ? '#FF006E' : B}`,
                    boxShadow: isSelected ? `4px 4px 0px ${B}` : 'none',
                    opacity: isOwned ? 1 : 0.5
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{title.icon}</span>
                    <div className="text-left">
                      <span 
                        className={`font-black ${title.cssClass}`}
                        style={{ color: isSelected ? '#000' : (isDark ? '#FFF' : '#000') }}
                      >
                        {title.name}
                      </span>
                      {title.rarity !== 'common' && (
                        <div 
                          className="text-[9px] font-bold uppercase"
                          style={{ color: rarityColor }}
                        >
                          {getRarityLabel(title.rarity)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isOwned && <Lock size={14} style={{ color: isDark ? '#666' : '#999' }} />}
                    {isSelected && isOwned && (
                      <div 
                        className="w-5 h-5 flex items-center justify-center"
                        style={{ background: '#06FFA5', border: `2px solid ${B}` }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          
          <p className="text-[10px] font-bold mt-3 text-center" style={{ color: isDark ? '#AAA' : '#666' }}>
            {p.UNLOCK_TITLES || 'Unlock new titles via Season Pass!'} 👑
          </p>
        </div>
      )}

      {/* CARD BACKS TAB */}
      {activeTab === 'cardbacks' && (
        <div 
          className="p-4 animate-fade-in-up"
          style={{ background: bgSurface, border: `4px solid ${B}`, boxShadow: `6px 6px 0px #8338EC` }}
        >
          <div 
            className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" 
            style={{ background: '#8338EC', color: '#FFF', border: `2px solid ${B}` }}
          >
            {p.CHOOSE_CARDBACK || 'Choose Card Back'}
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {CARD_BACKS.map((cardBack) => {
              const isOwned = ownsCardBack(cardBack.id);
              const isSelected = selectedCardBack === cardBack.id || (!selectedCardBack && cardBack.id === 'cardback_default');
              const rarityColor = getRarityColor(cardBack.rarity);
              
              return (
                <button
                  key={cardBack.id}
                  onClick={() => isOwned && onCardBackChange?.(cardBack.id)}
                  disabled={!isOwned}
                  className="relative flex flex-col items-center p-3 transition-all animate-card-back-hover"
                  style={{ 
                    background: isSelected ? '#FFBE0B' : (isOwned ? bgSurface : (isDark ? '#1a1a2e' : '#E5E5E5')),
                    border: `3px solid ${isSelected ? '#8338EC' : B}`,
                    boxShadow: isSelected ? `4px 4px 0px ${B}` : 'none',
                    opacity: isOwned ? 1 : 0.5,
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {/* Card preview */}
                  <div 
                    className={`cardback-preview ${cardBack.cssClass || ''}`}
                    style={{ 
                      background: cardBack.cssClass ? undefined : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                    }}
                  >
                    <span className="text-lg">🃏</span>
                  </div>
                  
                  {/* Card back name */}
                  <span 
                    className="text-[8px] font-bold mt-2 text-center leading-tight"
                    style={{ color: isDark ? '#FFF' : '#000' }}
                  >
                    {cardBack.name.length > 10 ? cardBack.name.slice(0, 9) + '…' : cardBack.name}
                  </span>

                  {/* Lock or check indicator */}
                  {!isOwned && (
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
                      style={{ background: '#000', color: '#FFF' }}
                    >
                      <Lock size={10} />
                    </div>
                  )}
                  {isSelected && isOwned && (
                    <div 
                      className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center"
                      style={{ background: '#06FFA5', color: '#000', border: `1px solid ${B}` }}
                    >
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}

                  {/* Rarity indicator */}
                  {cardBack.rarity !== 'common' && (
                    <div 
                      className="absolute bottom-0 left-0 right-0 text-[6px] font-black uppercase text-center py-0.5"
                      style={{ background: rarityColor, color: '#000' }}
                    >
                      {cardBack.rarity === 'legendary' ? '★' : cardBack.rarity === 'epic' ? '◆' : '●'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <p className="text-[10px] font-bold mt-3 text-center" style={{ color: isDark ? '#AAA' : '#666' }}>
            {p.UNLOCK_CARDBACKS || 'Unlock new card backs via Season Pass!'} 🃏
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
