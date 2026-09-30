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
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-once': 'bounce-once 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
