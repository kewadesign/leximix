import React from 'react';
import { X } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', fullWidth, size = 'md', className = '', ...props }) => {
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
};

export const Modal: React.FC<{ isOpen: boolean; onClose?: () => void; title?: string; children: React.ReactNode; className?: string }> = ({ isOpen, onClose, title, children, className="" }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-md bg-[#1e102e] border border-white/10 rounded-3xl shadow-2xl p-8 ${className}`}>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        )}
        {title && <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lexi-cyan to-lexi-fuchsia mb-6 uppercase tracking-widest text-center">{title}</h2>}
        <div className="text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export const TierBadge: React.FC<{ tier: any; color: string }> = ({ tier, color }) => (
  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
    TIER {tier}
  </span>
);