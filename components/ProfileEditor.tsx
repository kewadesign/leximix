import React, { useState } from 'react';
import { Check, Lock, Sparkles, Crown, Type, Palette } from 'lucide-react';
import { UserState, ProfileFrame, ProfileFont, ProfileEffect } from '../types';
import { PROFILE_FRAMES, PROFILE_FONTS, PROFILE_EFFECTS, getFrameById, getFontById, getEffectById, STICKER_CATEGORIES } from '../constants';
import { getRarityColor } from '../utils/rewards';
import { audio } from '../utils/audio';

interface Props {
  user: UserState;
  selectedFrame: string;
  selectedFont: string;
  selectedEffect: string;
  onFrameChange: (frameId: string) => void;
  onFontChange: (fontId: string) => void;
  onEffectChange: (effectId: string) => void;
  onOpenAlbum: () => void;
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Gewöhnlich',
  rare: 'Selten',
  epic: 'Episch',
  legendary: 'Legendär'
};

export const ProfileEditor: React.FC<Props> = ({
  user,
  selectedFrame,
  selectedFont,
  selectedEffect,
  onFrameChange,
  onFontChange,
  onEffectChange,
  onOpenAlbum
}) => {
  const [activeTab, setActiveTab] = useState<'frames' | 'fonts' | 'effects'>('frames');
  const isDark = user.theme === 'dark';
  const B = isDark ? '#FFF' : '#000';
  const bgSurface = isDark ? '#2a2a4a' : '#FFF';

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
              <h3 className="font-black text-white uppercase tracking-wide">Sticker Album</h3>
              <p className="text-xs font-bold text-white/80">Sammle 72 einzigartige Sticker!</p>
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
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('frames')}
          className="flex-1 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all"
          style={tabStyle(activeTab === 'frames')}
        >
          <Sparkles size={14} /> Rahmen
        </button>
        <button
          onClick={() => setActiveTab('fonts')}
          className="flex-1 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all"
          style={tabStyle(activeTab === 'fonts')}
        >
          <Type size={14} /> Schriften
        </button>
        <button
          onClick={() => setActiveTab('effects')}
          className="flex-1 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all"
          style={tabStyle(activeTab === 'effects')}
        >
          <Palette size={14} /> Effekte
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
            Profilrahmen wählen
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
            Schalte neue Rahmen über den Season Pass frei! 🎁
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
            Profilname-Schrift
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
                      {user.name || 'Spieler'}
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
            Profil-Effekte
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
            Schalte neue Effekte über den Season Pass frei! ✨
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
