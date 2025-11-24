import React from 'react';
import { Crown, Cat } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  xp: number;
  level: number;
  isPremium: boolean;
  onBuyPremium: () => void;
  lang: Language;
}

export const SeasonPass: React.FC<Props> = ({ xp, level, isPremium, onBuyPremium, lang }) => {
  const t = TRANSLATIONS[lang].SEASON;

  return (
    <div
      onClick={onBuyPremium}
      className="w-full h-32 md:h-40 rounded-[2rem] p-6 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl animate-slide-up mt-8"
      style={{
        background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
        animationDelay: '0.3s'
      }}
    >
      {/* Background Pattern & Glow */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between h-full px-2 md:px-4">
        {/* Left Side: Icon & Text */}
        <div className="flex items-center gap-4 md:gap-6">
          {/* Icon */}
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_30px_rgba(251,191,36,0.4)] rotate-[-10deg] group-hover:rotate-0 transition-all shrink-0">
            <Cat size={32} className="text-white drop-shadow-md md:w-10 md:h-10" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Crown className={`${isPremium ? 'text-yellow-300' : 'text-gray-400'} drop-shadow-md`} size={20} fill={isPremium ? "currentColor" : "none"} />
              <h3 className="text-white font-black italic text-lg sm:text-2xl md:text-3xl tracking-tighter drop-shadow-xl uppercase whitespace-nowrap">
                {t.TITLE}
              </h3>
            </div>
            <p className="text-white/80 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider">
              {isPremium ? 'Premium Aktiv' : 'Kostenlos'}
            </p>
          </div>
        </div>

        {/* Right Side: Level Only */}
        <div className="flex flex-col items-end justify-center w-1/3">
          <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-1">
            <span className="text-sm md:text-lg opacity-60 mr-1">LVL</span>{level}
          </div>
        </div>
      </div>
    </div>
  );
};