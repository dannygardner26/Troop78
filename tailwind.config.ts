import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fdf2f2",
          100: "#fce7e7",
          200: "#f9d2d2",
          300: "#f5b0b0",
          400: "#ee7d7d",
          500: "#e55353",
          600: "#d12d2d",
          700: "#b12424",
          800: "#911e1e",
          900: "#800000", // Deep Maroon
        },
        troop: {
          maroon: "#800000",
          gold: "#FFD700",
          white: "#FFFFFF",
          slate: {
            50: "#f8fafc",
            100: "#f1f5f9",
            200: "#e2e8f0",
            300: "#cbd5e1",
            400: "#94a3b8",
            500: "#64748b",
            600: "#475569",
            700: "#334155",
            800: "#1e293b",
            900: "#0f172a",
          }
        }
      },
      animation: {
        "in": "in 0.2s ease-in-out",
        "out": "out 0.2s ease-in-out",
        "terminal": "terminal 2s ease-in-out infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "in": {
          "0%": { transform: "translateY(18px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-18px)", opacity: "0" },
        },
        "terminal": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: ["class"],
}
export default config