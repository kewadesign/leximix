/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Keep for compatibility but won't use
    theme: {
        extend: {
            colors: {
                // Brutal Color Palette
                'brutal-pink': '#FF006E',
                'brutal-orange': '#FF7F00',
                'brutal-purple': '#8338EC',
                'brutal-yellow': '#FFBE0B',
                'brutal-blue': '#0096FF',
                'brutal-green': '#06FFA5',
                'brutal-cream': '#FFF8E7',
                'brutal-black': '#000000',

                // Legacy support (map to new colors)
                'lexi-primary': '#FF006E',
                'lexi-primary-hover': '#FF7F00',
                'lexi-secondary': '#8338EC',
                'lexi-accent': '#FFBE0B',
                'lexi-bg': '#FFF8E7',
                'lexi-surface': '#FFFFFF',
                'lexi-text': '#000000',
                'lexi-text-muted': '#4A4A4A',
                'lexi-success': '#06FFA5',
                'lexi-warning': '#FFBE0B',
                'lexi-error': '#FF006E',
            },
            fontFamily: {
                'sans': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
                'display': ['Poppins', 'system-ui', 'sans-serif'],
            },
            fontWeight: {
                'normal': '600',
                'semibold': '700',
                'bold': '800',
                'black': '900',
            },
            borderWidth: {
                'brutal': '4px',
                'brutal-thick': '6px',
            },
            boxShadow: {
                'brutal': '8px 8px 0px #000',
                'brutal-sm': '4px 4px 0px #000',
                'brutal-lg': '12px 12px 0px #000',
                'brutal-pink': '8px 8px 0px #FF006E',
                'brutal-orange': '8px 8px 0px #FF7F00',
                'brutal-purple': '8px 8px 0px #8338EC',
                'brutal-yellow': '8px 8px 0px #FFBE0B',
            },
            skew: {
                'brutal': '-5deg',
                'brutal-reverse': '5deg',
                'brutal-sm': '-2deg',
            },
            animation: {
                'shake': 'shake 0.3s linear infinite',
                'pop': 'pop 0.2s linear',
                'slide-brutal': 'slide-brutal 0.2s linear forwards',
                'bounce-brutal': 'bounce-brutal 1s linear infinite',
                'spin-square': 'spin-square 2s linear infinite',
            },
            keyframes: {
                shake: {
                    '0%, 100%': { transform: 'skew(-5deg) translateX(0)' },
                    '25%': { transform: 'skew(-5deg) translateX(-8px)' },
                    '50%': { transform: 'skew(-5deg) translateX(8px)' },
                    '75%': { transform: 'skew(-5deg) translateX(-4px)' },
                },
                pop: {
                    '0%': { transform: 'scale(1) rotate(0deg)' },
                    '50%': { transform: 'scale(1.2) rotate(5deg)' },
                    '100%': { transform: 'scale(1) rotate(0deg)' },
                },
                'slide-brutal': {
                    'from': { opacity: '0', transform: 'translateX(-100px) skew(-5deg)' },
                    'to': { opacity: '1', transform: 'translateX(0) skew(-5deg)' },
                },
                'bounce-brutal': {
                    '0%, 100%': { transform: 'translateY(0) skew(-2deg)' },
                    '50%': { transform: 'translateY(-20px) skew(-2deg)' },
                },
                'spin-square': {
                    'from': { transform: 'rotate(0deg)' },
                    'to': { transform: 'rotate(360deg)' },
                },
            },
        },
    },
    plugins: [],
}
