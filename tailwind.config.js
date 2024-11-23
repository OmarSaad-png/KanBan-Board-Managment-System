/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        flash: {
          '0%, 100%': { backgroundColor: 'white' },
          '50%': { backgroundColor: 'rgb(254 226 226)' }, // red-100
        }
      },
      animation: {
        flash: 'flash 3s ease-out',
      }
    },
  },
  plugins: [],
}

