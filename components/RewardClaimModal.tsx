import React, { useEffect, useState } from 'react';
import { X, Check, Sparkles, Crown, Gem, Zap, Star, Gift } from 'lucide-react';
import { SeasonRewardItem } from '../types';
import { getRarityColor } from '../utils/rewards';
import { ParticleEffect, LegendarySparkle } from './ParticleEffect';
import { audio } from '../utils/audio';

interface Props {
  reward: SeasonRewardItem;
  isPremium: boolean;
  onClose: () => void;
  onEquip?: () => void;
}

export const RewardClaimModal: React.FC<Props> = ({ reward, isPremium, onClose, onEquip }) => {
  const [showParticles, setShowParticles] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Play sound and reveal after short delay
    audio.playWin();
    const timer = setTimeout(() => setIsRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const rarityColor = getRarityColor(reward.rarity || 'common');
  const isLegendary = reward.rarity === 'legendary';
  const isEpic = reward.rarity === 'epic';

  const getRewardIcon = () => {
    switch (reward.type) {
      case 'avatar':
        return reward.preview ? (
          <img 
            src={reward.preview} 
            alt={reward.name} 
            className="w-24 h-24 object-cover"
            style={{ border: '4px solid #000' }}
          />
        ) : (
          <div className="w-24 h-24 flex items-center justify-center" style={{ background: '#8338EC', border: '4px solid #000' }}>
            <Star size={48} className="text-white" />
          </div>
        );
      case 'effect':
      case 'frame':
        return (
          <div 
            className="w-24 h-24 flex items-center justify-center"
            style={{ background: rarityColor, border: '4px solid #000' }}
          >
            <Sparkles size={48} className="text-white" />
          </div>
        );
      case 'title':
        return (
          <div 
            className="w-24 h-24 flex items-center justify-center"
            style={{ background: rarityColor, border: '4px solid #000' }}
          >
            <Crown size={48} className="text-white" />
          </div>
        );
      case 'cardback':
        return (
          <div 
            className={`w-20 h-28 flex items-center justify-center ${reward.value ? '' : ''}`}
            style={{ 
              background: 'linear-gradient(135deg, #8338EC 0%, #FF006E 100%)', 
              border: '4px solid #000' 
            }}
          >
            <span className="text-4xl">🃏</span>
          </div>
        );
      case 'coins':
        return (
          <div 
            className="w-24 h-24 flex items-center justify-center"
            style={{ background: '#FFBE0B', border: '4px solid #000' }}
          >
            <Gem size={48} className="text-black" />
          </div>
        );
      case 'booster':
        return (
          <div 
            className="w-24 h-24 flex items-center justify-center"
            style={{ background: '#FF7F00', border: '4px solid #000' }}
          >
            <Zap size={48} className="text-white" />
          </div>
        );
      case 'sticker_pack':
        return (
          <div 
            className="w-24 h-24 flex items-center justify-center"
            style={{ background: rarityColor, border: '4px solid #000' }}
          >
            <Gift size={48} className="text-white" />
          </div>
        );
      default:
        return (
          <div 
            className="w-24 h-24 flex items-center justify-center text-4xl"
            style={{ background: rarityColor, border: '4px solid #000' }}
          >
            {reward.icon || '🎁'}
          </div>
        );
    }
  };

  const canEquip = ['avatar', 'frame', 'effect', 'title', 'cardback'].includes(reward.type);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      {/* Particle Effect */}
      {showParticles && (
        <ParticleEffect 
          type={isLegendary ? 'confetti' : 'claim'} 
          particleCount={isLegendary ? 30 : 15}
          duration={1500}
          onComplete={() => setShowParticles(false)}
        />
      )}

      {/* Modal */}
      <div 
        className={`relative max-w-sm w-full p-6 animate-fade-in-scale ${isLegendary ? 'animate-rainbow-border' : ''}`}
        style={{ 
          background: 'var(--color-surface)', 
          border: '6px solid #000',
          boxShadow: isLegendary ? '12px 12px 0px #FFBE0B' : isEpic ? '12px 12px 0px #8338EC' : '12px 12px 0px #000'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
          style={{ background: '#FF006E', border: '3px solid #000' }}
        >
          <X size={20} className="text-white" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div 
            className="inline-block px-4 py-2 mb-2 font-black text-sm uppercase"
            style={{ 
              background: isPremium ? '#FFBE0B' : '#06FFA5', 
              color: '#000', 
              border: '3px solid #000' 
            }}
          >
            {isPremium ? 'Premium Belohnung' : 'Belohnung'}
          </div>
          <h2 
            className="text-2xl font-black uppercase tracking-wide"
            style={{ color: 'var(--color-text)' }}
          >
            Freigeschaltet!
          </h2>
        </div>

        {/* Reward Display */}
        <div 
          className={`relative flex flex-col items-center p-6 mb-6 ${isRevealed ? 'animate-fade-in-scale' : 'opacity-0'}`}
          style={{ 
            background: 'var(--color-bg)', 
            border: '4px solid #000',
            boxShadow: `6px 6px 0px ${rarityColor}`
          }}
        >
          {isLegendary && <LegendarySparkle />}
          
          {/* Reward Icon */}
          <div className="mb-4 animate-bounce-subtle">
            {getRewardIcon()}
          </div>

          {/* Reward Info */}
          <h3 
            className="text-xl font-black uppercase text-center mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {reward.name}
          </h3>
          
          {reward.desc && (
            <p 
              className="text-sm font-bold text-center mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {reward.desc}
            </p>
          )}

          {/* Rarity Badge */}
          {reward.rarity && (
            <div 
              className="px-3 py-1 font-black text-xs uppercase"
              style={{ 
                background: rarityColor, 
                color: reward.rarity === 'legendary' || reward.rarity === 'epic' ? '#FFF' : '#000',
                border: '2px solid #000'
              }}
            >
              {reward.rarity === 'legendary' ? '★ Legendär' : 
               reward.rarity === 'epic' ? '◆ Episch' : 
               reward.rarity === 'rare' ? '● Selten' : 'Gewöhnlich'}
            </div>
          )}

          {/* Amount for coins */}
          {reward.amount && (
            <div 
              className="mt-2 text-2xl font-black"
              style={{ color: '#FFBE0B' }}
            >
              +{reward.amount}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {canEquip && onEquip && (
            <button
              onClick={() => { onEquip(); onClose(); }}
              className="flex-1 py-4 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
              style={{ 
                background: '#06FFA5', 
                color: '#000', 
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000'
              }}
            >
              <Check size={18} /> Ausrüsten
            </button>
          )}
          <button
            onClick={onClose}
            className={`${canEquip && onEquip ? 'flex-1' : 'w-full'} py-4 font-black text-sm uppercase transition-all hover:-translate-y-1`}
            style={{ 
              background: 'var(--color-surface)', 
              color: 'var(--color-text)', 
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #000'
            }}
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardClaimModal;
