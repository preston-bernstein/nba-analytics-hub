import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: [
    './web/index.html',
    './web/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/.storybook/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      colors: {
        brand: {
          50: '#eff4ff',
          100: '#dbe7ff',
          200: '#bdd0ff',
          300: '#94b0ff',
          400: '#6b8cff',
          500: '#4368f3',
          600: '#2f50d6',
          700: '#273fb0',
          800: '#22348a',
          900: '#1c2a69',
        },
        'brand-accent': {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        neutral: {
          50: '#faf9f7',
          100: '#f4f2ef',
          200: '#e6e2dd',
          300: '#d3cdc6',
          400: '#b3aba2',
          500: '#8d847b',
          600: '#6b6158',
          700: '#4f4740',
          800: '#352f2a',
          900: '#221f1c',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
    },
  },
  plugins: [],
};

export default config;
