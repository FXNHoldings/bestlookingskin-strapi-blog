import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // BestLooking.Skin palette — primary red sourced from bestlooking.skin
        primary: {
          DEFAULT: '#e33333',
          emphasis: '#c32525',
          hover: '#fde2e2',
          pressed: '#9a1a1a',
        },
        accent: {
          DEFAULT: '#ff4136',
          emphasis: '#d12c22',
        },
        ink: '#111111',
        paper: '#ffffff',
        muted: '#f0f2f4',
      },
      fontFamily: {
        // Single font for the whole site — Inter, self-hosted.
        // CSS variable defined in globals.css via @font-face.
        sans: ['var(--font-urbanist)'],
        display: ['var(--font-urbanist)'],
        // Aliases kept so existing `font-urbanist` / `font-outfit` utilities
        // still resolve. Both point at Inter.
        urbanist: ['var(--font-urbanist)'],
        outfit: ['var(--font-urbanist)'],
      },
      maxWidth: { prose: '70ch' },
      borderRadius: {
        '3xl': '0.75rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
