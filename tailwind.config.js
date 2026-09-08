/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        content: 'rgb(var(--c-text) / <alpha-value>)',
        'content-muted': 'rgb(var(--c-text-muted) / <alpha-value>)',
        'content-faint': 'rgb(var(--c-text-faint) / <alpha-value>)',
        accent: '#22c55e',
        warn: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.16em',
      },
      keyframes: {
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94) translateY(10px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'sheet-up': {
          from: { opacity: '0', transform: 'translateY(100%)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-slide': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.14)' },
          '100%': { transform: 'scale(1)' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.28s cubic-bezier(0.34, 1.4, 0.64, 1)',
        'sheet-up': 'sheet-up 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slide-up 0.32s cubic-bezier(0.34, 1.4, 0.64, 1)',
        'fade-in': 'fade-in 0.25s ease-out',
        'fade-slide': 'fade-slide 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        pop: 'pop 0.4s cubic-bezier(0.34, 1.5, 0.64, 1)',
        sheen: 'sheen 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
