/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stage: '#090a0f',
        panel: '#111318',
        card: '#161920',
        cardHover: '#1c202a',
        borderDim: '#232733',
        borderBright: '#373e51',
      },
    },
  },
  plugins: [],
}

