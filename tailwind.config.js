/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'lexi-bg': 'var(--color-bg)',
                'lexi-surface': 'var(--color-surface)',
                'lexi-surface-highlight': 'var(--color-surface-highlight)',
                'lexi-text': 'var(--color-text)',
                'lexi-text-muted': 'var(--color-text-muted)',
                'lexi-border': 'var(--color-border)',
                'lexi-accent': 'var(--color-accent)',
                'lexi-dark': '#0f0718',
                'lexi-purple': '#2d1b4e',
                'lexi-deep-purple': '#1e102e',
                'lexi-fuchsia': '#d946ef',
                'lexi-cyan': '#06b6d4',
                'lexi-gold': '#fbbf24',
                'lexi-gray': '#1f2937',
                'lexi-card-green': '#15803d',
                'lexi-card-orange': '#c2410c',
                'lexi-card-blue': '#1e40af',
                'lexi-card-red': '#be123c',
                'lexi-card-purple': '#6b21a8',
                'lexi-card-dark': '#111827',
            },
        },
        darkMode: 'class',
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
        },
        animation: {
            'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
            'fade-in': 'fadeIn 0.8s ease-out forwards',
            'slide-up': 'slideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'scale-in': 'scaleIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            'shimmer': 'shimmer 2s linear infinite',
            'nebula': 'nebula 20s ease infinite alternate',
        },
        keyframes: {
            shake: {
                '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
            },
            fadeIn: {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' }
            },
            slideUp: {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' }
            },
            scaleIn: {
                '0%': { opacity: '0', transform: 'scale(0.9)' },
                '100%': { opacity: '1', transform: 'scale(1)' }
            },
            shimmer: {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' }
            },
            nebula: {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
            }
        }
    },
    plugins: [],
}
