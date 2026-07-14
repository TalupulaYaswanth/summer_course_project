/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0B14",
        panelBg: "#121224",
        borderDark: "#23233F",
        accentPurple: "#6C5CE7",
        accentPurpleLight: "#A29BFE",
        accentEmerald: "#00B894",
        textGray: "#A0AEC0"
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
    },
  },
  plugins: [],
}
