import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        merka: {
          black: "#000000",
          surface: "#111111",
          border: "#1e1e1e",
          red: "#E31B23",
          yellow: "#FFD700",
          green: "#008F39"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px #FFD700, 0 12px 30px rgba(255, 215, 0, 0.18)",
        card: "0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 215, 0, 0.06)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" }
        }
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
