import { Square } from 'lucide-react';

interface LoadingScreenProps {
  text?: string;
}

export default function LoadingScreen({ text = 'LOADING...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-brutal-cream relative overflow-hidden">
      {/* Brutal Grid Background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(#000 2px, transparent 2px), linear-gradient(90deg, #000 2px, transparent 2px)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Animated Brutal Shapes */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-brutal-pink border-brutal shadow-brutal animate-spin-square"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-brutal-orange border-brutal shadow-brutal-lg" style={{ animation: 'spin-square 3s linear infinite reverse' }}></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-brutal-purple border-brutal shadow-brutal" style={{ animation: 'bounce-brutal 1.5s linear infinite' }}></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Loading Box */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-brutal-yellow border-brutal-thick shadow-brutal-lg flex items-center justify-center transform skew-brutal animate-pop">
            <Square size={64} className="text-brutal-black" fill="currentColor" />
          </div>
        </div>

        <h2 className="text-5xl font-black uppercase tracking-widest text-brutal-black mb-4 transform skew-brutal-sm">
          {text}
        </h2>

        {/* Loading Bars */}
        <div className="flex gap-3">
          <div className="w-6 h-6 bg-brutal-pink border-brutal animate-bounce-brutal"></div>
          <div className="w-6 h-6 bg-brutal-orange border-brutal animate-bounce-brutal" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-6 h-6 bg-brutal-purple border-brutal animate-bounce-brutal" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-6 h-6 bg-brutal-yellow border-brutal animate-bounce-brutal" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
}
