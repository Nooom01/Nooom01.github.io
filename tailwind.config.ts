import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Green kawaii color palette
        pixel: {
          cream: '#F0FDF4', // Light green background
          yellow: '#84CC16', // Lime green
          lightyellow: '#ECFCCB', // Very light green
          orange: '#65A30D', // Darker green
          brown: '#166534', // Dark green
          lightbrown: '#BBF7D0', // Light green/mint
          beige: '#F7FEE7', // Very light green beige
          white: '#FFFFFF', // Pure white
          gray: '#6B7280', // Medium gray
          darkgray: '#374151', // Dark gray for text
          black: '#000000', // Pure black
          lightgray: '#E5F3E7', // Light green for post bg
        },
        kawaii: {
          primary: '#84CC16', // Lime green primary
          secondary: '#65A30D', // Green secondary  
          background: '#F0FDF4', // Light green background
          surface: '#FFFFFF', // White surface
          windowbg: '#ECFCCB', // Light lime for window backgrounds
          text: '#374151', // Dark gray text
          textlight: '#6B7280', // Medium gray for secondary text
          accent: '#22C55E', // Bright green accent
          highlight: '#84CC16', // Lime highlight
          shadow: '#BBF7D0', // Light green shadow
          border: '#166534', // Dark green borders
          titlebg: '#84CC16', // Lime title bar background
        },
        cream: {
          100: '#FFF9F0',
          200: '#FFF5E6'
        }
      },
      animation: {
        'bounce-gentle': 'bounce 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pixel-pulse': 'pixel-pulse 2s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pixel-pulse': {
          '0%, 100%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.05)', filter: 'brightness(1.1)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        }
      },
      fontFamily: {
        'sans': [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        'mono': [
          'SF Mono',
          'Monaco',
          'Cascadia Code',
          'Roboto Mono',
          'Courier New',
          'monospace'
        ]
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px #D3D3D3',
        'pixel-lg': '6px 6px 0px 0px #D3D3D3',
        'pixel-inset': 'inset 2px 2px 0px 0px #FFFFFF, inset -2px -2px 0px 0px #999999',
      },
      fontSize: {
        'pixel-xs': ['10px', '12px'],
        'pixel-sm': ['12px', '16px'],
        'pixel-base': ['14px', '18px'],
        'pixel-lg': ['16px', '20px'],
        'pixel-xl': ['20px', '24px'],
        'pixel-2xl': ['24px', '28px'],
      },
    },
  },
  plugins: [],
}
export default config