/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: light cyan-blue (readable on dark)
        'primary':                   '#69daff',
        'on-primary':                '#003547',
        'primary-container':         '#004e6a',
        'on-primary-container':      '#b8f0ff',
        'primary-fixed':             '#4ab8e0',
        'primary-fixed-dim':         '#3aa0c8',
        'primary-dim':               '#4ab8e0',

        // Secondary: warm yellow
        'secondary':                 '#ffd709',
        'on-secondary':              '#3a2e00',
        'secondary-container':       '#4a3a00',
        'on-secondary-container':    '#ffe566',
        'secondary-fixed':           '#ffc400',
        'secondary-fixed-dim':       '#e8b000',
        'on-secondary-fixed':        '#2a2000',

        // Tertiary: soft purple
        'tertiary':                  '#b8a0ff',
        'on-tertiary':               '#2a1a5e',
        'tertiary-container':        '#3d2b80',
        'on-tertiary-container':     '#ddd0ff',
        'tertiary-fixed':            '#c8b0ff',
        'tertiary-fixed-dim':        '#b090f0',
        'tertiary-dim':              '#9a7aee',

        // Surfaces: dark palette
        'background':                '#0c0e12',
        'on-background':             '#e2e6f0',
        'surface':                   '#0f1117',
        'surface-dim':               '#0a0b0f',
        'surface-bright':            '#1e2232',
        'surface-container-lowest':  '#0a0b0e',
        'surface-container-low':     '#131520',
        'surface-container':         '#171a28',
        'surface-container-high':    '#1e2132',
        'surface-container-highest': '#252a3e',
        'surface-tint':              '#69daff',
        'surface-variant':           '#1a1e2e',

        // Text
        'on-surface':                '#e2e6f0',
        'on-surface-variant':        '#8892a8',
        'inverse-surface':           '#e2e6f0',
        'inverse-on-surface':        '#0f1117',
        'inverse-primary':           '#003547',

        // Borders
        'outline':                   '#2e3449',
        'outline-variant':           '#1e2438',

        // Error
        'error':                     '#ff6b6b',
        'on-error':                  '#4a0000',
        'error-container':           '#5a1010',
        'on-error-container':        '#ffa8a8',
        'error-dim':                 '#e05a5a',
      },
      fontFamily: {
        'headline': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body':     ['Inter', 'sans-serif'],
        'label':    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        'sm':    '0.25rem',
        'md':    '0.5rem',
        'lg':    '0.75rem',
        'xl':    '0.75rem',
        '2xl':   '1rem',
        '3xl':   '1.25rem',
        'full':  '9999px',
      },
      boxShadow: {
        'glow-primary':    '0 4px 24px rgba(105, 218, 255, 0.30)',
        'glow-primary-lg': '0 8px 40px rgba(105, 218, 255, 0.40)',
        'glow-secondary':  '0 4px 20px rgba(255, 215, 9, 0.35)',
        'glow-error':      '0 4px 20px rgba(255, 107, 107, 0.30)',
        'card':            '0 2px 16px rgba(0, 0, 0, 0.40)',
        'card-hover':      '0 8px 32px rgba(0, 0, 0, 0.60)',
        'nav-bottom':      '0 -2px 16px rgba(0, 0, 0, 0.40)',
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in':   'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
