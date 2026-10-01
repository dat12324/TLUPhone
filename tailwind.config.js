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
        'slide-in-right': {
          '0%': { transform: 'translateX(28px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-once': 'bounce-once 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.55s ease-out',
      },
    },
  },
  plugins: [],
}
