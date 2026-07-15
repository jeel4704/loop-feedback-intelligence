import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0f766e",
          foreground: "#f0fdfa"
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};

export default config;

