/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e11d48',    // Đỏ chủ đạo
        secondary: '#1e293b',  // Xám đậm
        accent: '#f97316',     // Cam nhấn
      },
    },
  },
  plugins: [],
}
