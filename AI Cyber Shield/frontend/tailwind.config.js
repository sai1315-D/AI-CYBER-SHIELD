/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 45px rgba(20, 184, 166, 0.24)",
        card: "0 24px 80px rgba(0, 0, 0, 0.38)"
      },
      backgroundImage: {
        "cyber-grid":
          "linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)"
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(18px, -24px, 0) scale(1.04)" }
        },
        pulseLine: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "30%, 70%": { opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" }
        }
      },
      animation: {
        drift: "drift 10s ease-in-out infinite",
        "pulse-line": "pulseLine 4.8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};
