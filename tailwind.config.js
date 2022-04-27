/* eslint-disable @typescript-eslint/no-var-requires */
const { fontFamily } = require('tailwindcss/defaultTheme');

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

/** @type {import("@types/tailwindcss/tailwind-config").TailwindConfig } */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // added to prevent tweaking useTailwindViewport in the future (if we
      // decided to change these values).
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      fontFamily: {
        sans: [
          'General Sans',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      boxShadow: {
        none: 'none',
        1: '0px 1px 1px rgba(0, 0, 0, 0.1)',
        1.5: '0px 1px 1px rgba(0, 0, 0, 0.08)',
        2: '0px 2px 3px rgba(0, 0, 0, 0.1)',
        2.5: '0px 2px 3px rgba(0, 0, 0, 0.08)',
        3: '0px 4px 5px -1px rgba(0, 0, 0, 0.1)',
        4: '0px 6px 7px -1px rgba(0, 0, 0, 0.08)',
        5: '0px 8px 11px -1px rgba(0, 0, 0, 0.08)',
        6: '0px 12px 19px -3px rgba(0, 0, 0, 0.08)',
        7: '0px 16px 25px -3px rgba(0, 0, 0, 0.08)',
        7.5: '0px 16px 25px -7px rgba(0, 0, 0, 0.1)',
        8: '0px 24px 31px -4px rgba(0, 0, 0, 0.08)',
        9: '0px 40px 55px -4px rgba(0, 0, 0, 0.14)',
        focus:
          '0px 0px 0px 3px rgba(220, 212, 255, 1), 0px 0px 2px -1px rgba(0, 0, 0, 0.12)',
        'focus-primary':
          '0px 0px 0px 3px rgba(194, 200, 255, 1), 0px 2px 2px -1px rgba(0, 0, 0, 0.12)',
        'focus-gray':
          '0px 0px 0px 3px rgba(238, 239, 242, 1), 0px 2px 2px -1px rgba(0, 0, 0, 0.12)',
        'focus-danger':
          '0px 0px 0px 3px rgba(255, 223, 223, 1), 0px 2px 2px -1px rgba(0, 0, 0, 0.12)',
        'focus-success':
          '0px 0px 0px 3px rgba(189, 240, 224, 1), 0px 2px 2px -1px rgba(0, 0, 0, 0.12)',
        'focus-info':
          '0px 0px 0px 3px rgba(120, 190, 255, 1), 0px 0px 2px -1px rgba(0, 0, 0, 0.12)',
      },
      fontSize: {
        overline: [
          '10px',
          {
            lineHeight: '16px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          },
        ],
        caption2: ['10px', '16px'],
        caption1: ['12px', '20px'],
        body: ['14px', '24px'],
        paragraph: ['14px', '26px'],
        subheader: ['16px', '28px'],
        title: ['20px', '32px'],
        heading2: ['24px', '36px'],
        heading1: ['28px', '40px'],
        display5: ['38px', '48px'],
        display4: ['48px', '56px'],
        display3: ['56px', '64px'],
        display2: [
          '64px',
          {
            lineHeight: '72px',
            letterSpacing: '-0.01em',
          },
        ],
        display1: [
          '80px',
          {
            lineHeight: '88px',
            letterSpacing: '-0.01em',
          },
        ],
      },
      spacing: {
        1: '1px',
        2: '0.125rem',
        4: '0.25rem',
        6: '0.375rem',
        8: '0.5rem',
        12: '0.75rem',
        16: '1rem',
        20: '1.25rem',
        24: '1.5rem',
        28: '1.75rem',
        32: '2rem',
        40: '2.5rem',
        48: '3rem',
        56: '3.5rem',
        64: '4rem',
        72: '4.5rem',
        80: '5rem',
        88: '5.5rem',
        96: '6rem',
        112: '7rem',
        128: '8rem',
        136: '8.5rem',
        152: '9.5rem',
        176: '11rem',
        352: '22rem',
        400: '25rem',
        432: '27rem',
        512: '32rem',
        640: '40rem',
      },
      borderRadius: {
        2: '2px',
        4: '4px',
        6: '6px',
        8: '8px',
        12: '12px',
        16: '16px',
        20: '20px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
        56: '56px',
        64: '64px',
        72: '72px',
      },
      colors: {
        DEFAULT: '#0F1D40',
        dark: '#0F1D40',
        medium: '#525C76',
        light: '#8C93A3',
        disabled: '#B2B7C2',
        outline: {
          DEFAULT: '#EEEFF2',
          dark: '#B2B7C2',
          medium: '#CACDD5',
          light: '#E2E4E8',
          xlight: '#EEEFF2',
        },
        transparent: 'rgba(0,0,0,0)',
        black: {
          DEFAULT: '#000000',
          90: 'rgba(0, 0, 0, 0.9)',
          80: 'rgba(0, 0, 0, 0.8)',
          70: 'rgba(0, 0, 0, 0.7)',
          60: 'rgba(0, 0, 0, 0.6)',
          50: 'rgba(0, 0, 0, 0.5)',
          40: 'rgba(0, 0, 0, 0.4)',
          30: 'rgba(0, 0, 0, 0.3)',
          20: 'rgba(0, 0, 0, 0.2)',
          10: 'rgba(0, 0, 0, 0.1)',
          5: 'rgba(0, 0, 0, 0.05)',
        },
        white: {
          DEFAULT: '#ffffff',
          90: 'rgba(255, 255, 255, 0.9)',
          80: 'rgba(255, 255, 255, 0.8)',
          70: 'rgba(255, 255, 255, 0.7)',
          60: 'rgba(255, 255, 255, 0.6)',
          50: 'rgba(255, 255, 255, 0.5)',
          40: 'rgba(255, 255, 255, 0.4)',
          30: 'rgba(255, 255, 255, 0.3)',
          20: 'rgba(255, 255, 255, 0.2)',
          10: 'rgba(255, 255, 255, 0.1)',
          5: 'rgba(255, 255, 255, 0.05)',
        },
        primary: {
          DEFAULT: '#6b53ff',
          100: '#f3f5ff',
          150: '#eceeff',
          200: '#e3e6ff',
          300: '#c2c8ff',
          400: '#a7aaff',
          500: '#928fff',
          600: '#7e73ff',
          700: '#6b53ff',
          800: '#6732ff',
          900: '#6105f6',
        },
        secondary: {
          DEFAULT: '#4D7797',
          100: '#fffef9',
          200: '#fff9dd',
          300: '#ffefb9',
          400: '#ffe794',
          500: '#ffdc65',
          600: '#ffd440',
          700: '#fdc814',
          800: '#eeb903',
          900: '#dcaa00',
        },
        'dark-gray': {
          DEFAULT: '#3a4662',
          100: '#747C90',
          200: '#656E85',
          300: '#5C657D',
          400: '#525C76',
          500: '#49536E',
          600: '#3A4662',
          700: '#2C3857',
          800: '#192648',
          900: '#0f1d40',
        },
        gray: {
          DEFAULT: '#A4A9B6',
          100: '#FAFAFB',
          200: '#F5F6F7',
          300: '#EEEFF2',
          400: '#E2E4E8',
          500: '#CACDD5',
          600: '#B2B7C2',
          700: '#A4A9B6',
          800: '#959CAB',
          900: '#8C93A3',
        },
        info: {
          DEFAULT: '#0284FE',
          100: '#F8FBFF',
          300: '#DCEEFF',
          500: '#78BEFF',
          700: '#0284FE',
          900: '#01408F',
        },
        success: {
          DEFAULT: '#0BB07B',
          100: '#f1fffb',
          300: '#BDF0E0',
          500: '#3ED3A3',
          700: '#0BB07B',
          900: '#00724d',
        },
        warning: {
          DEFAULT: '#FFAD0D',
          100: '#FFFCF5',
          300: '#FFECC7',
          500: '#FFCA65',
          700: '#FFAD0D',
          900: '#F07300',
        },
        danger: {
          DEFAULT: '#F03D3D',
          100: '#FFF8F8',
          300: '#FFDFDF',
          500: '#FF6666',
          700: '#F03D3D',
          900: '#A50000',
        },
      },
      animation: {
        'fade-in': 'fade-in 500ms forwards linear 1',
        'fade-out': 'fade-out 500ms forwards linear 1',
        marquee1: 'marquee1 120s linear infinite',
        marquee2: 'marquee2 120s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: 0,
            display: 'none',
          },
          '100%': {
            opacity: 1,
            display: 'block',
          },
        },
        'fade-out': {
          '0%': {
            opacity: 1,
            display: 'block',
          },
          '100%': {
            opacity: 0,
            display: 'none',
          },
        },
        marquee1: {
          '0%': {
            transform: 'translateX(0%)',
          },
          '100%': {
            transform: 'translateX(-100%)',
          },
        },
        marquee2: {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
