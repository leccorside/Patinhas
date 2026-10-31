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
          container: '#FF7043',
        },
        secondary: {
          DEFAULT: '#4DB6AC',
          light: '#80CBC4',
          dark: '#006A63',
          container: '#8BF1E6',
        },
        tertiary: {
          DEFAULT: '#FFF3E0',
          dark: '#A59B8A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          variant: '#E3F0F8',
          dim: '#CFDCE4',
        },
        background: {
          DEFAULT: '#FAFAF8',
          desktop: '#EDEDEB',
        },
        charcoal: {
          DEFAULT: '#263238',
          muted: '#78909C',
        },
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
        },
        success: {
          DEFAULT: '#2E7D32',
          container: '#E8F5E9',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '430px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        'sheet': '2rem',
      },
      boxShadow: {
        card: '0px 4px 16px rgba(38, 50, 56, 0.05)',
        floating: '0px 8px 24px rgba(38, 50, 56, 0.08)',
        sheet: '0px -8px 32px rgba(38, 50, 56, 0.12)',
        coral: '0px 8px 20px rgba(255, 112, 67, 0.35)',
        teal: '0px 8px 20px rgba(77, 182, 172, 0.30)',
      },
    },
  },
  plugins: [],
}
