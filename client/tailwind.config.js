/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Primary: near-black (buttons, active states)
        'primary':                   '#111111',
        'on-primary':                '#ffffff',
        'primary-container':         '#f0f0f0',
        'on-primary-container':      '#111111',
        'primary-fixed':             '#333333',
        'primary-fixed-dim':         '#555555',
        'primary-dim':               '#333333',

        // Secondary: amber/gold (awards, highlights)
        'secondary':                 '#d97706',
        'on-secondary':              '#ffffff',
        'secondary-container':       '#fef3c7',
        'on-secondary-container':    '#92400e',
        'secondary-fixed':           '#f59e0b',
        'secondary-fixed-dim':       '#d97706',
        'on-secondary-fixed':        '#ffffff',

        // Tertiary: violet accent
        'tertiary':                  '#7c3aed',
        'on-tertiary':               '#ffffff',
        'tertiary-container':        '#ede9fe',
        'on-tertiary-container':     '#4c1d95',
        'tertiary-fixed':            '#8b5cf6',
        'tertiary-fixed-dim':        '#7c3aed',
        'tertiary-dim':              '#6d28d9',

        // Surfaces: light palette
        'background':                '#f5f6fa',
        'on-background':             '#111827',
        'surface':                   '#ffffff',
        'surface-dim':               '#eef0f5',
        'surface-bright':            '#ffffff',
        'surface-container-lowest':  '#ffffff',
        'surface-container-low':     '#f9fafb',
        'surface-container':         '#f3f4f6',
        'surface-container-high':    '#ffffff',
        'surface-container-highest': '#f3f4f6',
        'surface-tint':              '#111111',
        'surface-variant':           '#f1f3f7',

        // Text
        'on-surface':                '#111827',
        'on-surface-variant':        '#6b7280',
        'inverse-surface':           '#111827',
        'inverse-on-surface':        '#ffffff',
        'inverse-primary':           '#ffffff',

        // Borders
        'outline':                   '#d1d5db',
        'outline-variant':           '#e5e7eb',

        // Error
        'error':                     '#ef4444',
        'on-error':                  '#ffffff',
        'error-container':           '#fee2e2',
        'on-error-container':        '#991b1b',
        'error-dim':                 '#dc2626',
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
        'glow-primary':    '0 4px 24px rgba(0, 0, 0, 0.20)',
        'glow-primary-lg': '0 8px 40px rgba(0, 0, 0, 0.25)',
        'glow-secondary':  '0 4px 20px rgba(217, 119, 6, 0.25)',
        'glow-error':      '0 4px 20px rgba(239, 68, 68, 0.25)',
        'card':            '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover':      '0 4px 16px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06)',
        'nav-bottom':      '0 -1px 0 rgba(0, 0, 0, 0.06)',
        'nav-top':         '0 1px 0 rgba(0, 0, 0, 0.06)',
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
