/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F94F06',
          'orange-hover': '#e04605',
          blue: '#0066FF',
          dark: '#0B0F19',
          'dark-card': '#111827',
          'dark-border': '#1F2937',
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        },
        wave: {
          DEFAULT: '#1E90FF',
          hover: '#1873cc',
          light: 'rgba(30, 144, 255, 0.15)',
        },
        om: {
          DEFAULT: '#FF7900',
          hover: '#e56c00',
          light: 'rgba(255, 121, 0, 0.15)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(249, 79, 6, 0.3)',
        'glow-blue': '0 0 25px -5px rgba(0, 102, 255, 0.3)',
        'glow-green': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
      },
    },
  },
  plugins: [],
};
