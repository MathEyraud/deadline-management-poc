// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Palette de couleurs adaptée au secteur défense (teintes plus sobres)
        primary: {
          50: '#f0f5ff',
          100: '#e0eafc',
          200: '#bfd4f7',
          300: '#9abbf1',
          400: '#749fe9',
          500: '#5182e0',
          600: '#3e65cf',
          700: '#3453b4',
          800: '#2f448e',
          900: '#293c75',
          950: '#1c2645',
        },
        secondary: {
          50: '#f5f7fa',
          100: '#ebeef5',
          200: '#d2d9e7',
          300: '#adb9ce',
          400: '#8395b1',
          500: '#637796',
          600: '#4e5f7d',
          700: '#414f68',
          800: '#374057',
          900: '#2f374a',
          950: '#1e2330',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'bounce-delayed': 'bounce 1s infinite 0.5s',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      transitionProperty: {
        'height': 'height',
        'max-height': 'max-height',
        'spacing': 'margin, padding',
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
      backgroundColor: ['disabled'],
      cursor: ['disabled'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};