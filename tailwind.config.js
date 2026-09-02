/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12201E',
        bay: '#0B3B4D',
        bayLight: '#1D5F73',
        tide: '#D9A441',
        fog: '#EEF2F1',
        coral: '#B8562E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
