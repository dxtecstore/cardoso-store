/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        dm: {
          black:  '#080808',
          dark:   '#0f0f0f',
          card:   '#141414',
          border: '#1e1e1e',
          gold:   '#c9a84c',
          'gold-light': '#e8c97a',
          'gold-dim':   '#9a7a32',
          muted:  '#666666',
          white:  '#f0ece4',
        },
      },
      animation: {
        'fade-in':  'fadeIn 0.7s ease forwards',
        'slide-up': 'slideUp 0.7s ease forwards',
        'glow':     'glow 2.5s ease-in-out infinite alternate',
        'marquee':  'marquee 28s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(32px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        glow:    { from: { textShadow: '0 0 8px rgba(201,168,76,0.3)' }, to: { textShadow: '0 0 20px rgba(201,168,76,0.7), 0 0 40px rgba(201,168,76,0.3)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
    },
  },
  plugins: [],
}
