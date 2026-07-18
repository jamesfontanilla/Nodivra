import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./tests/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f4ef",
          100: "#ebe8df",
          200: "#d8d3c2",
          300: "#b9b09c",
          400: "#8c8777",
          500: "#5f5b50",
          600: "#444137",
          700: "#2f2d26",
          800: "#1a1b20",
          900: "#0d0f13",
          950: "#07080b",
        },
        sand: {
          50: "#fffdfa",
          100: "#f8f3ea",
          200: "#efe2cc",
          300: "#e0c69e",
          400: "#c9a06d",
          500: "#ad7c45",
        },
        moss: {
          50: "#eef6f0",
          100: "#d9eadf",
          200: "#b8d3bd",
          300: "#87b08f",
          400: "#5f8b68",
          500: "#43634a",
        },
      },
      boxShadow: {
        halo: "0 0 0 1px rgba(255,255,255,0.08), 0 28px 80px rgba(0,0,0,0.28)",
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
