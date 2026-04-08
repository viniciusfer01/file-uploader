import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mist: '#eef2ff',
        accent: '#0f766e',
        sand: '#f8fafc',
      },
      boxShadow: {
        panel: '0 20px 45px rgba(15, 23, 42, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;

