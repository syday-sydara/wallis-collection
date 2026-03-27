import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf7f2",
          100: "#f8e7d6",
          200: "#f0cfad",
          300: "#e5ae7a",
          400: "#d98b4a",
          500: "#c96b24",
          600: "#a5521a",
          700: "#7f3c14",
          800: "#5a2910",
          900: "#3c1a0a"
        }
      }
    }
  }
} satisfies Config;
