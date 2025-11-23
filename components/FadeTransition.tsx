import React, { useEffect, useState } from 'react';

interface TransitionProps {
  isTransitioning: boolean;
  onTransitionEnd: () => void;
}

export const FadeTransition: React.FC<TransitionProps> = ({ isTransitioning, onTransitionEnd }) => {
  const [phase, setPhase] = useState<'idle' | 'in' | 'out'>('idle');

  useEffect(() => {
    if (isTransitioning) {
      setPhase('in');
      // Wait for fade in (black screen)
      const t1 = setTimeout(() => {
        onTransitionEnd(); // Switch content here
        setPhase('out'); // Start fading out
        
        // Wait for fade out
        const t2 = setTimeout(() => {
          setPhase('idle');
        }, 400);
        
        return () => clearTimeout(t2);
      }, 400);

      return () => clearTimeout(t1);
    }
  }, [isTransitioning]); // Removed onTransitionEnd to prevent loop

  if (phase === 'idle') return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black pointer-events-none transition-opacity duration-400 ease-in-out ${phase === 'in' ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
