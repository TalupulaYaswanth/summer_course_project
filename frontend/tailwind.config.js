/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#F8FAFC",
        panelBg: "#FFFFFF",
        borderDark: "#E2E8F0",
        accentPurple: "#10B981",
        accentPurpleLight: "#34D399",
        accentEmerald: "#059669",
        textGray: "#64748B"
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
    },
  },
  plugins: [],
}
