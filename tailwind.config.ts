import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
      },
    },

    extend: {
      /* =========================
         COLOR SYSTEM (SIMPLIFIED + SAFE)
      ========================= */
      colors: {
        /* Surfaces */
        surface: "rgb(var(--surface, 255 255 255) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted, 249 250 251) / <alpha-value>)",
        card: "rgb(var(--surface-card, 255 255 255) / <alpha-value>)",

        /* Text */
        text: {
          DEFAULT: "rgb(var(--text, 17 24 39) / <alpha-value>)",
          muted: "rgb(var(--text-muted, 107 114 128) / <alpha-value>)",
        },

        /* Borders */
        border: "rgb(var(--border, 229 231 235) / <alpha-value>)",

        /* Brand */
        brand: {
          50: "rgb(var(--brand-50, 240 253 244) / <alpha-value>)",
          100: "rgb(var(--brand-100, 220 252 231) / <alpha-value>)",
          200: "rgb(var(--brand-200, 187 247 208) / <alpha-value>)",
          300: "rgb(var(--brand-300, 134 239 172) / <alpha-value>)",
          400: "rgb(var(--brand-400, 74 222 128) / <alpha-value>)",
          500: "rgb(var(--brand-500, 34 197 94) / <alpha-value>)",
          600: "rgb(var(--brand-600, 22 163 74) / <alpha-value>)",
          700: "rgb(var(--brand-700, 21 128 61) / <alpha-value>)",
          800: "rgb(var(--brand-800, 22 101 52) / <alpha-value>)",
          900: "rgb(var(--brand-900, 20 83 45) / <alpha-value>)",
        },

        /* Semantic (UI-driven, not business logic) */
        primary: {
          DEFAULT: "rgb(var(--color-primary, 34 197 94) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover, 22 163 74) / <alpha-value>)",
          active: "rgb(var(--color-primary-active, 21 128 61) / <alpha-value>)",
          foreground: "#ffffff",
        },

        success: {
          DEFAULT: "rgb(var(--color-success, 34 197 94) / <alpha-value>)",
          foreground: "#ffffff",
        },

        danger: {
          DEFAULT: "rgb(var(--color-danger, 239 68 68) / <alpha-value>)",
          foreground: "#ffffff",
        },

        warning: {
          DEFAULT: "rgb(var(--color-warning, 234 179 8) / <alpha-value>)",
          foreground: "#111111",
        },

        /* Utility states (important for real UX) */
        skeleton: "rgb(229 231 235 / <alpha-value>)",
        disabled: "rgb(156 163 175 / <alpha-value>)",
      },

      /* =========================
         TYPOGRAPHY (EXPANDED)
      ========================= */
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
      },

      /* =========================
         RADII & SHADOWS
      ========================= */
      borderRadius: {
        sm: "var(--radius-sm, 0.25rem)",
        md: "var(--radius-md, 0.5rem)",
        lg: "var(--radius-lg, 0.75rem)",
      },

      boxShadow: {
        sm: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
        md: "var(--shadow-md, 0 4px 6px rgba(0,0,0,0.1))",
        lg: "var(--shadow-lg, 0 10px 15px rgba(0,0,0,0.15))",
      },

      /* =========================
         Z-INDEX (CONSISTENT)
      ========================= */
      zIndex: {
        header: "10",
        dropdown: "20",
        overlay: "30",
        modal: "40",
        toast: "50",
      },

      /* =========================
         INTERACTION
      ========================= */
      ringColor: {
        primary: "rgb(var(--color-primary, 34 197 94) / <alpha-value>)",
      },

      transitionTimingFunction: {
        standard: "var(--ease-standard, cubic-bezier(0.4, 0, 0.2, 1))",
        emphasized: "var(--ease-emphasized, cubic-bezier(0.2, 0, 0, 1))",
      },
    },
  },

  plugins: [],
};

export default config;