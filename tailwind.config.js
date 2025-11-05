/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light teal for subtle accents/secondary backgrounds
        accent: {
          50: '#BEE9E8',
          100: '#BEE9E8',
          200: '#BEE9E8',
          300: '#BEE9E8',
          400: '#BEE9E8',
          500: '#BEE9E8',
          600: '#BEE9E8',
          700: '#BEE9E8',
          800: '#BEE9E8',
          900: '#BEE9E8',
        },
        // Medium blue for primary buttons/links
        primary: {
          50: '#62B6CB',
          100: '#62B6CB',
          200: '#62B6CB',
          300: '#62B6CB',
          400: '#62B6CB',
          500: '#62B6CB',
          600: '#62B6CB',
          700: '#62B6CB',
          800: '#62B6CB',
          900: '#62B6CB',
        },
        // Dark blue for headings/text
        secondary: {
          50: '#1B4965',
          100: '#1B4965',
          200: '#1B4965',
          300: '#1B4965',
          400: '#1B4965',
          500: '#1B4965',
          600: '#1B4965',
          700: '#1B4965',
          800: '#1B4965',
          900: '#1B4965',
        },
        // Pale blue for highlights/cards
        highlight: {
          50: '#CAE9FF',
          100: '#CAE9FF',
          200: '#CAE9FF',
          300: '#CAE9FF',
          400: '#CAE9FF',
          500: '#CAE9FF',
          600: '#CAE9FF',
          700: '#CAE9FF',
          800: '#CAE9FF',
          900: '#CAE9FF',
        },
        // Soft blue for navigation
        nav: {
          50: '#5FA8D3',
          100: '#5FA8D3',
          200: '#5FA8D3',
          300: '#5FA8D3',
          400: '#5FA8D3',
          500: '#5FA8D3',
          600: '#5FA8D3',
          700: '#5FA8D3',
          800: '#5FA8D3',
          900: '#5FA8D3',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [],
};