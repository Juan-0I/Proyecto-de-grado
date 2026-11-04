/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/assets/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f4fafd',
        'surface-dim': '#d4dbdd',
        'surface-bright': '#f4fafd',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eef5f7',
        'surface-container': '#e8eff1',
        'surface-container-high': '#e2e9ec',
        'surface-container-highest': '#dde4e6',
        'on-surface': '#161d1f',
        'on-surface-variant': '#3d4a3e',
        'inverse-surface': '#2b3234',
        'inverse-on-surface': '#ebf2f4',
        outline: '#6c7b6d',
        'outline-variant': '#bbcbbb',
        'surface-tint': '#006d37',
        primary: '#006d37',
        'on-primary': '#ffffff',
        'primary-container': '#2ecc71',
        'on-primary-container': '#005027',
        'inverse-primary': '#4ae183',
        secondary: '#5c5f60',
        'on-secondary': '#ffffff',
        'secondary-container': '#e1e3e4',
        'on-secondary-container': '#626566',
        tertiary: '#5b5f62',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#b0b3b6',
        'on-tertiary-container': '#414548',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'primary-fixed': '#6bfe9c',
        'primary-fixed-dim': '#4ae183',
        'on-primary-fixed': '#00210c',
        'on-primary-fixed-variant': '#005228',
        'secondary-fixed': '#e1e3e4',
        'secondary-fixed-dim': '#c5c7c8',
        'on-secondary-fixed': '#191c1d',
        'on-secondary-fixed-variant': '#454748',
        'tertiary-fixed': '#e0e3e6',
        'tertiary-fixed-dim': '#c4c7ca',
        'on-tertiary-fixed': '#181c1e',
        'on-tertiary-fixed-variant': '#43474a',
        background: '#f4fafd',
        'on-background': '#161d1f',
        'surface-variant': '#dde4e6',
        warning: '#b45309',
        'warning-container': '#fef3c7',
        success: '#166534',
        'success-container': '#dcfce7'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        'headline-lg': ['Inter'],
        'headline-md': ['Inter'],
        'headline-sm': ['Inter'],
        'body-lg': ['Inter'],
        'body-md': ['Inter'],
        'body-sm': ['Inter'],
        'label-bold': ['Inter'],
        'label-mono': ['Inter']
      },
      fontSize: {
        'headline-lg': ['40px', { lineHeight: '48px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-lg-mobile': ['32px', { lineHeight: '40px', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-md': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-bold': ['14px', { lineHeight: '16px', fontWeight: '600', letterSpacing: '0.05em' }],
        'label-mono': ['12px', { lineHeight: '16px', fontWeight: '500' }]
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      spacing: {
        base: '8px',
        'container-max': '1280px',
        gutter: '24px',
        'margin-desktop': '48px',
        'margin-mobile': '20px'
      },
      maxWidth: {
        'container-max': '1280px'
      },
      boxShadow: {
        clinic: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        'clinic-lg': '0px 8px 30px rgba(0, 0, 0, 0.08)',
        'clinic-xl': '0px 20px 60px rgba(0, 0, 0, 0.12)'
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out both',
        'slide-up': 'slide-up 260ms ease-out both'
      }
    }
  },
  plugins: []
};
