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
      // Wait for fade out
      setTimeout(() => {
        onTransitionEnd(); // Switch content here
        setPhase('out');
        // Wait for fade in
        setTimeout(() => {
          setPhase('idle');
        }, 400);
      }, 400);
    }
  }, [isTransitioning, onTransitionEnd]);

  if (phase === 'idle') return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-black pointer-events-none transition-opacity duration-400 ease-in-out ${phase === 'in' ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
