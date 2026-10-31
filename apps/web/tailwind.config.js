/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7043',
          light: '#FF8A65',
          dark: '#E64A19',
        },
        secondary: {
          DEFAULT: '#4DB6AC',
          light: '#80CBC4',
          dark: '#00897B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#E3F0F8',
        },
        background: {
          DEFAULT: '#FAFAF8',
          desktop: '#EDEDEB',
        },
        charcoal: {
          DEFAULT: '#263238',
          muted: '#78909C',
        },
        apricot: '#FFF3E0',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0px 4px 16px rgba(38, 50, 56, 0.05)',
        floating: '0px 8px 24px rgba(38, 50, 56, 0.08)',
        sheet: '0px -8px 32px rgba(38, 50, 56, 0.12)',
        coral: '0px 8px 20px rgba(255, 112, 67, 0.35)',
      },
    },
  },
  plugins: [],
}

