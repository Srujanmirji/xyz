/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        'on-background': 'hsl(var(--on-background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'on-surface': 'hsl(var(--on-surface) / <alpha-value>)',
        'on-surface-variant': 'hsl(var(--on-surface-variant) / <alpha-value>)',
        
        'surface-container-lowest': 'hsl(var(--surface-container-lowest) / <alpha-value>)',
        'surface-container-low': 'hsl(var(--surface-container-low) / <alpha-value>)',
        'surface-container': 'hsl(var(--surface-container) / <alpha-value>)',
        'surface-container-high': 'hsl(var(--surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'hsl(var(--surface-container-highest) / <alpha-value>)',
        
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'on-primary': 'hsl(var(--on-primary) / <alpha-value>)',
        'primary-container': 'hsl(var(--primary-container) / <alpha-value>)',
        'on-primary-container': 'hsl(var(--on-primary-container) / <alpha-value>)',
        
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        'on-secondary': 'hsl(var(--on-secondary) / <alpha-value>)',
        'secondary-container': 'hsl(var(--secondary-container) / <alpha-value>)',
        'on-secondary-container': 'hsl(var(--on-secondary-container) / <alpha-value>)',
        
        tertiary: 'hsl(var(--tertiary) / <alpha-value>)',
        'on-tertiary': 'hsl(var(--on-tertiary) / <alpha-value>)',
        'tertiary-container': 'hsl(var(--tertiary-container) / <alpha-value>)',
        'on-tertiary-container': 'hsl(var(--on-tertiary-container) / <alpha-value>)',
        
        error: 'hsl(var(--error) / <alpha-value>)',
        'on-error': 'hsl(var(--on-error) / <alpha-value>)',
        'error-container': 'hsl(var(--error-container) / <alpha-value>)',
        'on-error-container': 'hsl(var(--on-error-container) / <alpha-value>)',
        
        outline: 'hsl(var(--outline) / <alpha-value>)',
        'outline-variant': 'hsl(var(--outline-variant) / <alpha-value>)',
      },
      borderRadius: {
        DEFAULT: '0.25rem', // 4px
        lg: '0.5rem',       // 8px
        xl: '0.75rem',      // 12px
        '2xl': '1rem',      // 16px
        '3xl': '1.5rem',    // 24px
      },
      spacing: {
        gutter: '24px',
        'container-max': '1280px',
        'margin-mobile': '16px',
        'margin-desktop': '40px',
        unit: '4px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
      },
      fontFamily: {
        geist: ['Geist', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
}
