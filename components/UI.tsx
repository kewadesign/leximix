import React from 'react';
import { X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = React.memo(({ children, variant = 'primary', fullWidth, size = 'md', className = '', ...props }) => {
  const base = "uppercase font-black transition-all border-brutal cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "py-2 px-4 text-xs tracking-wide",
    md: "py-4 px-8 text-sm tracking-wider",
    lg: "py-5 px-10 text-base tracking-widest"
  };

  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
    danger: "bg-brutal-pink text-white shadow-brutal hover:shadow-brutal-lg active:shadow-brutal-sm skew-brutal hover:bg-brutal-orange"
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
});

export const Modal: React.FC<{ isOpen: boolean; onClose?: () => void; title?: string; children: React.ReactNode; className?: string }> = React.memo(({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 geo-pattern" style={{ background: 'var(--color-bg)' }}>
      {/* Rainbow Top Bar */}
      <div className="fixed top-0 left-0 right-0 flex h-4 w-full z-50">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      <div
        className={`relative max-w-md w-full max-h-[85vh] overflow-y-auto p-6 geo-dots ${className}`}
        style={{
          background: 'var(--color-surface)',
          border: '6px solid var(--color-border)',
          boxShadow: '12px 12px 0px #8338EC'
        }}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center transition-all"
            style={{
              background: '#FF006E',
              border: '3px solid var(--color-border)',
              boxShadow: '4px 4px 0px var(--color-border)'
            }}
          >
            <X size={24} style={{ color: '#FFF' }} />
          </button>
        )}
        {title && (
          <h2
            className="text-2xl font-black uppercase mb-6 pr-14 tracking-wide"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h2>
        )}
        <div style={{ color: 'var(--color-text)' }}>
          {children}
        </div>
      </div>
    </div>
  );
});

export const TierBadge: React.FC<{ tier: any; color: string }> = React.memo(({ tier, color }) => (
  <span className={`px-3 py-1 border-brutal font-black text-sm uppercase skew-brutal ${color}`}>
    TIER {tier}
  </span>
));

export const RedeemCodeInput: React.FC<{ onRedeem: (code: string) => void; placeholder: string; buttonText: string; }> = ({ onRedeem, placeholder, buttonText }) => {
  const [code, setCode] = React.useState('');

  const handleRedeem = () => {
    if (code.trim()) {
      onRedeem(code.trim());
      setCode('');
    }
  };

  return (
    <div className="flex gap-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder={placeholder}
        className="flex-grow input-modern"
      />
      <Button onClick={handleRedeem} size="md">
        {buttonText}
      </Button>
    </div>
  );
};