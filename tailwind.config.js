/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060612",
        card: "rgba(255,255,255,0.03)",
        accent: "#00D4FF",
        secondary: "#7B2FBE",
        success: "#00C896",
        warning: "#FFB800",
        error: "#FF4757",
        textPrimary: "#FFFFFF",
        textSecondary: "rgba(255,255,255,0.55)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        'card': '16px',
        'input': '12px',
        'pill': '50px'
      },
      backgroundImage: {
        'glass': 'linear-gradient(to right bottom, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
        'gradient-accent': 'linear-gradient(135deg, #00D4FF 0%, #7B2FBE 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glow-success': '0 0 12px rgba(0,200,150,0.6)',
        'glow-accent': '0 0 20px rgba(0,212,255,0.3)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,200,150,0.6)' },
          '50%': { boxShadow: '0 0 24px rgba(0,200,150,0.8)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-right': 'slide-right 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
      }
    },
  },
  plugins: [],
}
