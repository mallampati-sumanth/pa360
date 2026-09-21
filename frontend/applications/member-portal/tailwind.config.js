const path = require('path')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'application-routes/**/*.{js,ts,jsx,tsx,mdx}'),
    path.join(__dirname, 'source/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A5F',
        secondary: '#2E86AB',
        accent: '#A23B72',
        success: '#27AE60',
        warning: '#F39C12',
        danger: '#E74C3C',
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
    },
  },
  plugins: [],
}
