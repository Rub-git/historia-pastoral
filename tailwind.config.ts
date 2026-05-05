import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e7e3',
          200: '#c7d1c7',
          300: '#a3b3a3',
          400: '#7d917d',
          500: '#617461',
          600: '#4d5d4d',
          700: '#404c40',
          800: '#363f36',
          900: '#2e352e',
        },
        warm: {
          50: '#fdfcfb',
          100: '#f9f5f2',
          200: '#f3ebe4',
          300: '#e8d9cc',
          400: '#d4bba3',
          500: '#c19d7b',
          600: '#a98260',
          700: '#8a6a4e',
          800: '#715844',
          900: '#5d4a3a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-libre-baskerville)', 'Libre Baskerville', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config