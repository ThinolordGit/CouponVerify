module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      // Breakpoints standards
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',

      // Intermédiaires entre les principaux
      'sm-md': '700px',   // entre sm et md
      'md-lg': '880px',   // entre md et lg
      'lg-xl': '1152px',  // entre lg et xl
      'xl-2xl': '1408px', // entre xl et 2xl

      // Options personnalisées supplémentaires si tu veux affiner encore
      'sm-mid': '720px',
      'md-mid': '896px',
      'lg-mid': '1120px',
      'xl-mid': '1440px',
    },
    extend: {
      colors: {
        border: 'var(--color-border)', // slate-200
        input: 'var(--color-input)', // slate-200
        ring: 'var(--color-ring)', // blue-800
        background: 'var(--color-background)', // gray-50
        foreground: 'var(--color-foreground)', // gray-900
        primary: {
          DEFAULT: 'var(--color-primary)', // blue-800
          foreground: 'var(--color-primary-foreground)', // white
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // slate-600
          foreground: 'var(--color-secondary-foreground)', // white
        },
        accent: {
          DEFAULT: 'var(--color-accent)', // amber-500
          foreground: 'var(--color-accent-foreground)', // gray-800
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red-600
          foreground: 'var(--color-destructive-foreground)', // white
        },
        success: {
          DEFAULT: 'var(--color-success)', // emerald-600
          foreground: 'var(--color-success-foreground)', // white
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // amber-600
          foreground: 'var(--color-warning-foreground)', // white
        },
        error: {
          DEFAULT: 'var(--color-error)', // red-600
          foreground: 'var(--color-error-foreground)', // white
        },
        muted: {
          DEFAULT: 'var(--color-muted)', // gray-100
          foreground: 'var(--color-muted-foreground)', // gray-500
        },
        card: {
          DEFAULT: 'var(--color-card)', // white
          foreground: 'var(--color-card-foreground)', // gray-700
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // white
          foreground: 'var(--color-popover-foreground)', // gray-700
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Source Sans 3', 'sans-serif'],
        caption: ['Inter', 'sans-serif'],
        data: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.4' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      spacing: {
        'xs': 'var(--spacing-xs)', // 6px
        'sm': 'var(--spacing-sm)', // 12px
        'md': 'var(--spacing-md)', // 18px
        'lg': 'var(--spacing-lg)', // 24px
        'xl': 'var(--spacing-xl)', // 32px
        '2xl': 'var(--spacing-2xl)', // 48px
        '3xl': 'var(--spacing-3xl)', // 64px
        '4xl': 'var(--spacing-4xl)', // 80px
        '5xl': 'var(--spacing-5xl)', // 112px
      },
      borderRadius: {
        'sm': 'var(--radius-sm)', // 6px
        'md': 'var(--radius-md)', // 12px
        'lg': 'var(--radius-lg)', // 18px
        'xl': 'var(--radius-xl)', // 24px
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.26, 0.64, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in': 'fade-in 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fade-out 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-right': 'slide-out-right 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slide-in-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-left': 'slide-out-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scale-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-out': 'scale-out 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};