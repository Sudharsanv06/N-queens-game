/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ─── Color Palette ─────────────────────────────────────────────────────
      colors: {
        // Primary — Crimson Red (royal, deep)
        crimson: {
          50:  '#FFF0F0',
          100: '#FFD6D6',
          200: '#FFA8A8',
          300: '#FF6B6B',
          400: '#E63939',
          500: '#C41E1E',  // primary brand
          600: '#A01515',
          700: '#7D0D0D',
          800: '#5A0808',
          900: '#380404',
          950: '#1A0202',
        },
        // Gold — Royal accent
        gold: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#F5B800',  // primary accent
          500: '#D4A017',
          600: '#B8860B',
          700: '#8B6508',
          800: '#5E4406',
          900: '#3B2B04',
          950: '#1A1200',
        },
        // Dark — Page backgrounds
        dark: {
          50:  '#2A2020',  // lightest surface
          100: '#221818',  // card surface
          150: '#1E1515',  // card hover
          200: '#1A1010',  // elevated surface
          300: '#140C0C',  // base surface
          400: '#100808',  // deep surface
          500: '#0C0505',  // deepest bg
          600: '#080303',  // true black
        },
        // Ivory — Text colors
        ivory: {
          50:  '#FAF7F0',  // pure white-ish text
          100: '#F5EDD8',  // headings
          200: '#E8D5B0',  // subheadings
          300: '#D4B896',  // body text
          400: '#B8967A',  // muted text
          500: '#9A7560',  // placeholder
          600: '#7A5848',  // disabled
        },
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        info:    '#3B82F6',
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],          // headings — royal feel
        body:    ['"Crimson Text"', 'Georgia', 'serif'],    // body text — literary
        ui:      ['"DM Sans"', 'system-ui', 'sans-serif'],  // UI elements — clean
        mono:    ['"JetBrains Mono"', 'monospace'],         // code / timers
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.7rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.25rem',  { lineHeight: '2.75rem' }],
        '5xl': ['3rem',     { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem',  { lineHeight: '4.25rem' }],
        '7xl': ['4.5rem',   { lineHeight: '5rem' }],
      },

      // ─── Spacing ───────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
        '26':  '6.5rem',
        '30':  '7.5rem',
      },

      // ─── Border Radius ─────────────────────────────────────────────────────
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '28px',
      },

      // ─── Shadows ───────────────────────────────────────────────────────────
      boxShadow: {
        'glow-red':    '0 0 20px rgba(196, 30, 30, 0.4), 0 0 60px rgba(196, 30, 30, 0.15)',
        'glow-gold':   '0 0 20px rgba(245, 184, 0, 0.4), 0 0 60px rgba(245, 184, 0, 0.15)',
        'glow-sm-red': '0 0 10px rgba(196, 30, 30, 0.5)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0, 0, 0, 0.3)',
        'card-hover':  '0 8px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(196, 30, 30, 0.2)',
        'inner-glow':  'inset 0 1px 0 rgba(245, 184, 0, 0.1)',
        'board-cell':  'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
      },

      // ─── Background gradients ──────────────────────────────────────────────
      backgroundImage: {
        'royal-radial':   'radial-gradient(ellipse at top, #2A1010 0%, #0C0505 60%)',
        'gold-shimmer':   'linear-gradient(135deg, #F5B800 0%, #D4A017 50%, #F5B800 100%)',
        'crimson-fade':   'linear-gradient(180deg, #C41E1E 0%, #7D0D0D 100%)',
        'card-surface':   'linear-gradient(135deg, #221818 0%, #1A1010 100%)',
        'board-light':    'linear-gradient(135deg, #3D2B2B 0%, #2D1E1E 100%)',
        'board-dark':     'linear-gradient(135deg, #1E1212 0%, #140C0C 100%)',
        'chess-pattern':  'repeating-conic-gradient(#2D1E1E 0% 25%, #1E1212 0% 50%)',
      },

      // ─── Animations ────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'queen-drop': {
          '0%':   { transform: 'translateY(-40px) scale(1.2)', opacity: '0' },
          '60%':  { transform: 'translateY(4px) scale(0.95)' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'queen-wrong': {
          '0%':   { transform: 'translateX(0)' },
          '20%':  { transform: 'translateX(-6px)' },
          '40%':  { transform: 'translateX(6px)' },
          '60%':  { transform: 'translateX(-4px)' },
          '80%':  { transform: 'translateX(4px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'win-pulse': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(245, 184, 0, 0)' },
          '50%':      { boxShadow: '0 0 40px rgba(245, 184, 0, 0.6)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'crown-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
          '50%':      { transform: 'translateY(-12px) rotate(5deg)' },
        },
        'xp-float': {
          '0%':   { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-60px)' },
        },
        'conflict-flash': {
          '0%, 100%': { backgroundColor: 'rgba(196, 30, 30, 0)' },
          '50%':      { backgroundColor: 'rgba(196, 30, 30, 0.6)' },
        },
        'spinner': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.3s ease-out both',
        'fade-in-up':    'fade-in-up 0.5s ease-out both',
        'slide-in-left': 'slide-in-left 0.4s ease-out both',
        'scale-in':      'scale-in 0.2s ease-out both',
        'queen-drop':    'queen-drop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'queen-wrong':   'queen-wrong 0.4s ease-in-out',
        'win-pulse':     'win-pulse 1.5s ease-in-out infinite',
        'shimmer':       'shimmer 2s linear infinite',
        'crown-bounce':  'crown-bounce 2s ease-in-out infinite',
        'xp-float':      'xp-float 1.5s ease-out forwards',
        'conflict-flash':'conflict-flash 0.6s ease-in-out',
        'spinner':       'spinner 0.8s linear infinite',
      },

      // ─── Animation delays ─────────────────────────────────────────────────
      transitionDelay: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },

      // ─── Z-index ──────────────────────────────────────────────────────────
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}