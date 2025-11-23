import React from 'react';
// KW1998 - UI Components
import { X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = React.memo(({ children, variant = 'primary', fullWidth, size = 'md', className = '', ...props }) => {
  const base = "relative overflow-hidden font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center";

  const sizes = {
    sm: "py-1 px-3 text-xs",
    md: "py-3 px-6 text-sm",
    lg: "py-4 px-8 text-base"
  };

  const variants = {
    primary: "bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white shadow-lg shadow-fuchsia-900/20 hover:brightness-110",
    secondary: "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm",
    ghost: "text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500 text-white shadow-lg hover:bg-red-600"
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className={`relative w-full max-w-md glass-panel rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 my-auto max-h-[95vh] overflow-y-auto ${className}`}>
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-lexi-text-muted hover:text-lexi-text transition-colors z-10">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        )}
        {title && <h2 className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lexi-cyan to-lexi-fuchsia mb-4 sm:mb-6 uppercase tracking-widest text-center pr-8">{title}</h2>}
        <div className="text-lexi-text">
          {children}
        </div>
      </div>
    </div>
  );
});

export const TierBadge: React.FC<{ tier: any; color: string }> = React.memo(({ tier, color }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
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
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder={placeholder}
        className="flex-grow glass-button text-lexi-text border-lexi-border rounded-lg px-4 py-2 placeholder:text-lexi-text-muted"
      />
      <Button onClick={handleRedeem} size="md">
        {buttonText}
      </Button>
    </div>
  );
};