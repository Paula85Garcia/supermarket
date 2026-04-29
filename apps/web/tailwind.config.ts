import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        merka: {
          black: "#050505",
          surface: "#111111",
          border: "#1e1e1e",
          red: "#E61E2A",
          yellow: "#FFD700",
          green: "#008F4C"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px #FFD700, 0 12px 30px rgba(255, 215, 0, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
