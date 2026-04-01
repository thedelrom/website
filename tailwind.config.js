/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        warmWhite: '#FAF8F4',
        sand:      '#E8DDD0',
        taupe:     '#C4B5A0',
        terracotta:'#C17A5A',
        espresso:  '#2C2520',
        mid:       '#6B5B52',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Jost', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
      },
    },
  },
  plugins: [],
}
