/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html', '_layouts/*.html', '_posts/*.md'],
  theme: {
    fontFamily: {
      body: ['Merriweather', 'Georgia', 'serif'],
      mono: ['monospace']
    },
    extend: {},
  },
  plugins: [],
}

