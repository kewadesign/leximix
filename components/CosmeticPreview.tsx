import React from 'react';
import { Crown, Sparkles, Star, User } from 'lucide-react';
import { ProfileFrame, ProfileTitle, CardBack, ProfileEffect } from '../types';
import { getRarityColor } from '../utils/rewards';

interface AvatarPreviewProps {
  avatarId: string;
  frame?: ProfileFrame;
  effect?: ProfileEffect;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  title?: ProfileTitle;
}

// Avatar with frame and effect preview
export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ 
  avatarId, 
  frame, 
  effect,
  size = 'md',
  name,
  title
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  };

  const avatarUrl = avatarId.startsWith('http') 
    ? avatarId 
    : `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${avatarId}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`relative ${sizeClasses[size]} ${frame?.cssClass || ''} ${effect?.cssClass || ''}`}
        style={{ border: '3px solid #000' }}
      >
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="w-full h-full object-cover"
        />
      </div>
      {name && (
        <span 
          className={`font-black text-sm ${title?.cssClass || ''}`}
          style={{ color: 'var(--color-text)' }}
        >
          {name}
        </span>
      )}
      {title && title.id !== 'title_none' && (
        <div 
          className="title-badge"
          style={{ 
            background: getRarityColor(title.rarity), 
            color: title.rarity === 'legendary' || title.rarity === 'epic' ? '#FFF' : '#000' 
          }}
        >
          {title.icon} {title.name}
        </div>
      )}
    </div>
  );
};

interface FramePreviewProps {
  frame: ProfileFrame;
  isSelected?: boolean;
  isOwned?: boolean;
  onClick?: () => void;
}

// Frame preview tile
export const FramePreview: React.FC<FramePreviewProps> = ({ 
  frame, 
  isSelected, 
  isOwned = true,
  onClick 
}) => {
  const rarityColor = getRarityColor(frame.rarity);

  return (
    <button
      onClick={onClick}
      disabled={!isOwned}
      className={`relative aspect-square flex flex-col items-center justify-center p-2 transition-all ${isOwned ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
      style={{ 
        background: isSelected ? '#FFBE0B' : 'var(--color-surface)',
        border: isSelected ? '3px solid #FF006E' : '3px solid #000',
        boxShadow: isSelected ? '4px 4px 0px #000' : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {/* Frame preview box */}
      <div 
        className={`w-10 h-10 ${frame.cssClass} ${frame.animationClass || ''}`}
        style={{ background: 'var(--color-text-muted)', border: '2px solid #000' }}
      />
      
      {/* Frame name */}
      <span 
        className="text-[9px] font-bold mt-1 text-center leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {frame.name.length > 10 ? frame.name.slice(0, 9) + '…' : frame.name}
      </span>

      {/* Rarity indicator */}
      {frame.rarity !== 'common' && (
        <div 
          className="absolute bottom-0 left-0 right-0 text-[7px] font-black uppercase text-center py-0.5"
          style={{ background: rarityColor, color: '#000' }}
        >
          {frame.rarity === 'legendary' ? '★' : frame.rarity === 'epic' ? '◆' : '●'}
        </div>
      )}
    </button>
  );
};

interface TitlePreviewProps {
  title: ProfileTitle;
  isSelected?: boolean;
  isOwned?: boolean;
  onClick?: () => void;
}

// Title preview tile
export const TitlePreview: React.FC<TitlePreviewProps> = ({ 
  title, 
  isSelected, 
  isOwned = true,
  onClick 
}) => {
  const rarityColor = getRarityColor(title.rarity);

  return (
    <button
      onClick={onClick}
      disabled={!isOwned}
      className={`w-full p-3 flex items-center justify-between transition-all ${isOwned ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
      style={{ 
        background: isSelected ? '#FFBE0B' : 'var(--color-surface)',
        border: isSelected ? '3px solid #8338EC' : '3px solid #000',
        boxShadow: isSelected ? '4px 4px 0px #000' : 'none'
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{title.icon}</span>
        <span 
          className={`font-black ${title.cssClass}`}
          style={{ color: 'var(--color-text)' }}
        >
          {title.name}
        </span>
      </div>
      
      <div 
        className="px-2 py-1 text-[8px] font-black uppercase"
        style={{ 
          background: rarityColor, 
          color: title.rarity === 'legendary' || title.rarity === 'epic' ? '#FFF' : '#000',
          border: '2px solid #000'
        }}
      >
        {title.rarity}
      </div>
    </button>
  );
};

interface CardBackPreviewProps {
  cardBack: CardBack;
  isSelected?: boolean;
  isOwned?: boolean;
  onClick?: () => void;
}

// Card back preview
export const CardBackPreview: React.FC<CardBackPreviewProps> = ({ 
  cardBack, 
  isSelected, 
  isOwned = true,
  onClick 
}) => {
  const rarityColor = getRarityColor(cardBack.rarity);

  return (
    <button
      onClick={onClick}
      disabled={!isOwned}
      className={`relative flex flex-col items-center p-3 transition-all animate-card-back-hover ${isOwned ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
      style={{ 
        background: isSelected ? '#FFBE0B' : 'var(--color-surface)',
        border: isSelected ? '3px solid #06FFA5' : '3px solid #000',
        boxShadow: isSelected ? '4px 4px 0px #000' : 'none'
      }}
    >
      {/* Card back preview */}
      <div 
        className={`cardback-preview ${cardBack.cssClass || ''}`}
        style={{ 
          background: cardBack.cssClass ? undefined : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}
      >
        <span className="text-2xl">🃏</span>
      </div>
      
      {/* Card back name */}
      <span 
        className="text-[10px] font-bold mt-2 text-center"
        style={{ color: 'var(--color-text)' }}
      >
        {cardBack.name}
      </span>

      {/* Rarity indicator */}
      {cardBack.rarity !== 'common' && (
        <div 
          className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[8px] font-black"
          style={{ background: rarityColor, border: '1px solid #000' }}
        >
          {cardBack.rarity === 'legendary' ? '★' : cardBack.rarity === 'epic' ? '◆' : '●'}
        </div>
      )}
    </button>
  );
};

interface EffectPreviewProps {
  effect: ProfileEffect;
  isSelected?: boolean;
  isOwned?: boolean;
  onClick?: () => void;
}

// Effect preview tile
export const EffectPreview: React.FC<EffectPreviewProps> = ({ 
  effect, 
  isSelected, 
  isOwned = true,
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!isOwned}
      className={`relative aspect-square flex flex-col items-center justify-center p-2 transition-all ${isOwned ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
      style={{ 
        background: isSelected ? '#FFBE0B' : 'var(--color-surface)',
        border: isSelected ? '3px solid #06FFA5' : '3px solid #000',
        boxShadow: isSelected ? '4px 4px 0px #000' : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)'
      }}
    >
      {/* Effect icon */}
      <span className="text-3xl">{effect.icon}</span>
      
      {/* Effect name */}
      <span 
        className="text-[8px] font-bold mt-1 text-center leading-tight"
        style={{ color: 'var(--color-text)' }}
      >
        {effect.name.length > 10 ? effect.name.slice(0, 9) + '…' : effect.name}
      </span>
    </button>
  );
};

// Preview container with live demo
interface LivePreviewProps {
  avatarId: string;
  frame?: ProfileFrame;
  effect?: ProfileEffect;
  title?: ProfileTitle;
  name: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  avatarId,
  frame,
  effect,
  title,
  name
}) => {
  return (
    <div 
      className="p-6 flex flex-col items-center"
      style={{ 
        background: 'var(--color-bg)', 
        border: '4px solid #000',
        boxShadow: '6px 6px 0px #8338EC'
      }}
    >
      <div 
        className="inline-block px-3 py-1 mb-4 font-black text-xs uppercase"
        style={{ background: '#8338EC', color: '#FFF', border: '2px solid #000' }}
      >
        Vorschau
      </div>
      
      <AvatarPreview 
        avatarId={avatarId}
        frame={frame}
        effect={effect}
        title={title}
        name={name}
        size="lg"
      />
    </div>
  );
};

export default {
  AvatarPreview,
  FramePreview,
  TitlePreview,
  CardBackPreview,
  EffectPreview,
  LivePreview
};
