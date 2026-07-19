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
          DEFAULT: "#5B5CFF",
          hover: "#6D6EFF",
          glow: "rgba(91,92,255,0.25)",
          foreground: "#ffffff"
        },
        dark: {
          bg: "#000000",
          secondary: "#0A0A0A",
          sidebar: "#0B0B0B",
          navbar: "#0D0D0D",
          card: "#111111",
          input: "#121212",
          popup: "#151515",
          elevated: "#161616",
          hover: "#1A1A1A",
          border: "#262626",
          primary: "#FFFFFF",
          secondaryText: "#CFCFCF",
          muted: "#A1A1A1",
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};

export default config;

