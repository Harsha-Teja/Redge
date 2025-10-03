/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        esbBlue: '#005CAB',
        emeraldGreen: '#009B77',
        lightGray: '#f5f5f5',
        darkGray: '#333333',
      },
    },
  },
  plugins: [],
}

