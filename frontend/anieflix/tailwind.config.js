/* eslint-env node */
/* eslint-disable */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}
