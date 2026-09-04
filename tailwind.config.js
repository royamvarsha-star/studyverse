/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        pixelSub: ['"Silkscreen"', 'monospace'],
        body: ['"Quicksand"', '"Nunito"', 'sans-serif'],
        mono: ['"VT323"', 'monospace'],
      },
      colors: {
        kawaii: {
          pink: '#ffb7c5',
          hotpink: '#ff6584',
          rose: '#f43f5e',
          lavender: '#e8dff5',
          purple: '#b8a3e8',
          mint: '#cbf3f0',
          peach: '#fce1e4',
          cream: '#fffdf9',
          yellow: '#fcf6bd',
          card: 'rgba(255, 255, 255, 0.85)',
          border: '#ffd1dc',
        },
        cyber: {
          bg: '#090d16',
          dark: '#0f172a',
          card: 'rgba(15, 23, 42, 0.85)',
          surface: '#1e293b',
          border: '#334155',
          neonCyan: '#00f0ff',
          neonPink: '#ff007f',
          neonPurple: '#b026ff',
          neonGreen: '#39ff14',
          neonYellow: '#ffe600',
        },
      },
      boxShadow: {
        'pixel-kawaii': '4px 4px 0px #ff6584',
        'pixel-kawaii-sm': '2px 2px 0px #ff6584',
        'pixel-cyber': '4px 4px 0px #00f0ff',
        'pixel-cyber-pink': '4px 4px 0px #ff007f',
        'pixel-dark': '4px 4px 0px #000000',
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5), 0 0 30px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.5), 0 0 30px rgba(255, 0, 127, 0.2)',
        'neon-purple': '0 0 15px rgba(176, 38, 255, 0.5), 0 0 30px rgba(176, 38, 255, 0.2)',
        'kawaii-glow': '0 0 20px rgba(255, 183, 197, 0.6), 0 0 40px rgba(232, 223, 245, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pixel-wiggle': 'pixelWiggle 0.8s steps(2, end) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(0,240,255,0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(0,240,255,0.2))' },
        },
        pixelWiggle: {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
      },
    },
  },
  plugins: [],
};
