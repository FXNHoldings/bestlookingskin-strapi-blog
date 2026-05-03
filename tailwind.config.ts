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
        // Inter is the body workhorse; Urbanist is the heading family
        // (used by the global h1-h6 rule and post-content h2/h3/h4).
        // Outfit and Fraunces are still loaded for elements that want them.
        sans: ['var(--font-outfit)'],
        display: ['var(--font-urbanist)'],
        inter: ['var(--font-inter)'],
        outfit: ['var(--font-outfit)'],
        fraunces: ['var(--font-fraunces)'],
        urbanist: ['var(--font-urbanist)'],
      },
      maxWidth: {
        prose: '70ch',
        // Site-wide content width override. Default Tailwind max-w-7xl is
        // 80rem (1280px); we override it to 1366px so every layout that
        // already uses `max-w-7xl mx-auto` widens without per-file edits.
        '7xl': '1366px',
      },
      borderRadius: {
        '3xl': '0.75rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
