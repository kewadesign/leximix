import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  xp: number;
  level: number;
  isPremium: boolean;
  onBuyPremium: () => void;
  lang: Language;
  theme?: 'dark' | 'light';
}

export const SeasonPass: React.FC<Props> = ({ xp, level, isPremium, onBuyPremium, lang, theme = 'dark' }) => {
  const t = TRANSLATIONS[lang].SEASON;

  return (
    <div
      onClick={onBuyPremium}
      className="w-full h-32 md:h-40 rounded-[2rem] p-6 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl animate-slide-up mt-8"
      style={{
        animationDelay: '0.3s',
        background: theme === 'light' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        border: theme === 'light' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Pulsing Glass Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 animate-pulse opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-pink-500/10"></div>

      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-[2rem] opacity-50">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 blur-xl animate-pulse"></div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>

      <div className="relative z-10 flex items-center justify-between h-full px-2 md:px-4">
        {/* Left Side: Neon Text */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Glowing Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-400/30 to-purple-600/30 rounded-full flex items-center justify-center border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.6)] backdrop-blur-sm shrink-0 group-hover:shadow-[0_0_50px_rgba(34,211,238,0.8)] transition-all">
            <Sparkles size={32} className="text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,1)] md:w-10 md:h-10 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Crown
                className={`${isPremium ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,1)]' : 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,1)]'}`}
                size={20}
                fill={isPremium ? "currentColor" : "none"}
              />
              <h3
                className="font-black italic text-lg sm:text-2xl md:text-3xl tracking-tighter uppercase whitespace-nowrap"
                style={{
                  color: '#00f2ff',
                  textShadow: '0 0 10px rgba(0,242,255,0.8), 0 0 20px rgba(0,242,255,0.6), 0 0 30px rgba(0,242,255,0.4)',
                  WebkitTextStroke: '1px rgba(0,242,255,0.3)'
                }}
              >
                {t.TITLE}
              </h3>
            </div>
            <p
              className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider"
              style={{
                color: isPremium ? '#fde047' : '#a5f3fc',
                textShadow: isPremium
                  ? '0 0 5px rgba(253,224,71,0.8)'
                  : '0 0 5px rgba(165,243,252,0.8)'
              }}
            >
              {isPremium ? 'Premium Aktiv' : 'Kostenlos'}
            </p>
          </div>
        </div>

        {/* Right Side: Neon Level */}
        <div className="flex flex-col items-end justify-center">
          <div
            className="text-3xl md:text-4xl font-black drop-shadow-lg"
            style={{
              color: '#ff0099',
              textShadow: '0 0 10px rgba(255,0,153,0.8), 0 0 20px rgba(255,0,153,0.6), 0 0 30px rgba(255,0,153,0.4)',
              WebkitTextStroke: '1px rgba(255,0,153,0.3)'
            }}
          >
            <span className="text-sm md:text-lg opacity-80 mr-1">LVL</span>{level}
          </div>
        </div>
      </div>
    </div>
  );
};