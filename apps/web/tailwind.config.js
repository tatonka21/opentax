/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#0b0e14",
          900: "#10141d",
          850: "#151a26",
          800: "#1b2230",
          700: "#263042",
          600: "#36425a",
        },
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          400: "#4d9fff",
          500: "#1f80f0",
          600: "#1768cc",
        },
        accent: {
          green: "#0ecb81",
          red: "#f6465d",
          yellow: "#f0b90b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
