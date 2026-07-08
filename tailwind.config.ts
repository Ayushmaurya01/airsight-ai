import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          dark: "#030712",
          light: "#f9fafb",
          blue: "#3b82f6",
          emerald: "#10b981",
          cyan: "#06b6d4",
          slate: "#1f2937",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scroll": "scroll 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.2), 0 0 10px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 15px rgba(6, 182, 212, 0.6), 0 0 25px rgba(16, 185, 129, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
