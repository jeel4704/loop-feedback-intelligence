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
        },
        dark: {
          bg: '#000000',
          secondary: '#0A0A0A',
          card: '#111111',
          elevated: '#161616',
          sidebar: '#0B0B0B',
          navbar: '#0D0D0D',
          popup: '#151515',
          input: '#121212',
          hover: '#1A1A1A',
          border: '#262626',
          text: '#FFFFFF',
          secondaryText: '#CFCFCF',
          muted: '#A1A1A1',
          placeholder: '#777777',
          disabled: '#5A5A5A',
        },
        accent: {
          DEFAULT: '#5B5CFF',
          hover: '#6D6EFF',
          glow: 'rgba(91,92,255,0.25)',
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};

export default config;

