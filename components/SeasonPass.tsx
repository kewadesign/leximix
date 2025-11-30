import React from 'react';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';
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
    <button
      onClick={onBuyPremium}
      className="w-full p-5 md:p-6 cursor-pointer relative overflow-hidden group transition-all duration-100"
      style={{
        background: isPremium ? '#FFBE0B' : '#8338EC',
        border: '4px solid #000',
        boxShadow: '8px 8px 0px #000',
        transform: 'skew(-2deg)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'skew(-2deg) translateY(-6px)';
        e.currentTarget.style.boxShadow = '12px 12px 0px #000';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'skew(-2deg)';
        e.currentTarget.style.boxShadow = '8px 8px 0px #000';
      }}
    >
      <div className="flex items-center justify-between" style={{ transform: 'skew(2deg)' }}>
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Icon Box */}
          <div
            className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shrink-0"
            style={{
              background: '#000',
              border: '3px solid #000',
              transform: 'skew(-5deg)'
            }}
          >
            <Sparkles size={28} style={{ color: isPremium ? '#FFBE0B' : '#8338EC' }} />
          </div>

          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <Crown
                size={20}
                fill={isPremium ? "currentColor" : "none"}
                style={{ color: isPremium ? '#000' : 'var(--color-text)' }}
              />
              <h3
                className="font-black text-xl md:text-2xl uppercase tracking-wide"
                style={{ color: isPremium ? '#000' : 'var(--color-text)' }}
              >
                {t.TITLE}
              </h3>
            </div>
            <span
              className="text-xs font-black uppercase tracking-wider px-3 py-1 mt-1"
              style={{
                background: isPremium ? '#000' : '#FF006E',
                color: isPremium ? '#FFBE0B' : '#FFF',
                border: '2px solid #000'
              }}
            >
              {isPremium ? t.PREMIUM_ACTIVE : t.FREE_ACTIVE}
            </span>
          </div>
        </div>

        {/* Right Side: Level */}
        <div className="flex items-center gap-3">
          <div
            className="flex flex-col items-center px-4 py-2"
            style={{
              background: 'var(--color-surface)',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            <span className="text-[10px] font-black uppercase" style={{ color: 'var(--color-text-muted)' }}>{t.LEVEL}</span>
            <span className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>{level}</span>
          </div>
          <ArrowRight size={24} style={{ color: isPremium ? '#000' : 'var(--color-text)' }} />
        </div>
      </div>
    </button>
  );
};