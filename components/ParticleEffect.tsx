import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

interface Props {
  type: 'claim' | 'confetti' | 'sparkle' | 'burst';
  colors?: string[];
  particleCount?: number;
  duration?: number;
  onComplete?: () => void;
}

const DEFAULT_COLORS = ['#FF006E', '#FF7F00', '#FFBE0B', '#06FFA5', '#8338EC', '#0096FF'];

export const ParticleEffect: React.FC<Props> = ({
  type,
  colors = DEFAULT_COLORS,
  particleCount = 12,
  duration = 1000,
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 8
      });
    }
    setParticles(newParticles);

    // Cleanup after animation
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [particleCount, colors, duration, onComplete]);

  if (!isActive) return null;

  const getAnimationStyle = (particle: Particle): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: particle.size,
      height: particle.size,
      background: particle.color,
      animationDelay: `${particle.delay}s`,
      border: '2px solid #000'
    };

    switch (type) {
      case 'claim':
        return {
          ...baseStyle,
          left: `${particle.x}%`,
          bottom: '0%',
          animation: `particle-rise ${duration / 1000}s ease-out forwards`
        };
      case 'confetti':
        return {
          ...baseStyle,
          left: `${particle.x}%`,
          top: '0%',
          animation: `confetti-fall ${duration / 1000}s ease-out forwards`,
          transform: `rotate(${Math.random() * 360}deg)`
        };
      case 'sparkle':
        return {
          ...baseStyle,
          left: `${40 + Math.random() * 20}%`,
          top: `${40 + Math.random() * 20}%`,
          animation: `fadeInScale 0.3s ease-out forwards, particle-rise ${duration / 1000}s ease-out forwards`,
          borderRadius: '50%'
        };
      case 'burst':
        const angle = (i: number) => (360 / particleCount) * i;
        const rad = (angle(particle.id) * Math.PI) / 180;
        const distance = 50 + Math.random() * 30;
        return {
          ...baseStyle,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%)`,
          animation: `none`,
          '--end-x': `${Math.cos(rad) * distance}px`,
          '--end-y': `${Math.sin(rad) * distance}px`
        } as React.CSSProperties;
      default:
        return baseStyle;
    }
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden z-50"
      style={{ perspective: '500px' }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={getAnimationStyle(particle)}
        />
      ))}
    </div>
  );
};

// Simple burst effect component for inline use
export const ClaimBurst: React.FC<{ color?: string }> = ({ color = '#06FFA5' }) => {
  return (
    <div className="absolute inset-0 pointer-events-none animate-claim-burst">
      <div 
        className="absolute inset-0 opacity-30"
        style={{ 
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)` 
        }}
      />
    </div>
  );
};

// Sparkle overlay for legendary items
export const LegendarySparkle: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white animate-sparkle"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.3}s`,
            borderRadius: '50%',
            boxShadow: '0 0 4px #FFBE0B'
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
