/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens from Design.md §3 & cpms-design-taste
      },
    },
  },
  plugins: [],
}
