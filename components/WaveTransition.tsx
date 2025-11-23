import React, { useEffect, useState } from 'react';

interface TransitionProps {
  isTransitioning: boolean;
  onTransitionEnd: () => void;
}

export const WaveTransition: React.FC<TransitionProps> = ({ isTransitioning, onTransitionEnd }) => {
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

  useEffect(() => {
    if (isTransitioning) {
      setPhase('in');
      // Wait for cover animation
      setTimeout(() => {
        onTransitionEnd(); // Switch content here
        setPhase('out');
        // Wait for reveal animation
        setTimeout(() => {
          setPhase('idle');
        }, 600);
      }, 600);
    }
  }, [isTransitioning, onTransitionEnd]);

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <div 
        className={`absolute inset-0 bg-lexi-fuchsia transition-transform duration-500 ease-in-out transform ${phase === 'in' ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Wave SVG at top */}
        <svg className="absolute -top-24 left-0 w-full h-24 text-lexi-fuchsia" preserveAspectRatio="none" viewBox="0 0 1440 320">
           <path fill="currentColor" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Secondary delay wave for depth */}
      <div 
        className={`absolute inset-0 bg-lexi-cyan transition-transform duration-500 delay-75 ease-in-out transform ${phase === 'in' ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
      </div>
    </div>
  );
};
