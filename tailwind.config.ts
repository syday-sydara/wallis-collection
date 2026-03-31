import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "0.75rem", // tighter for mobile
        sm: "1rem",
        lg: "2rem",
      },
    },

    extend: {
      /* =========================
         COLOR SYSTEM
      ========================= */
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        card: "rgb(var(--surface-card) / <alpha-value>)",

        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },

        border: "rgb(var(--border) / <alpha-value>)",

        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          active: "rgb(var(--color-primary-active) / <alpha-value>)",
          foreground: "#ffffff",
        },

        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "#ffffff",
        },

        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "#ffffff",
        },

        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "#111111",
        },

        /* UX-driven tokens */
        skeleton: "rgb(229 231 235 / <alpha-value>)",
        disabled: "rgb(156 163 175 / <alpha-value>)",

        /* Commerce-specific */
        cta: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          text: "#ffffff",
        },
      },

      /* =========================
         TYPOGRAPHY
      ========================= */
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }], // improved readability
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.25rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.2rem" }],
      },

      /* =========================
         RADII & SHADOWS
      ========================= */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      /* =========================
         Z-INDEX
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
        primary: "rgb(var(--color-primary) / <alpha-value>)",
      },

      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
      },
    },
  },

  plugins: [],
};

export default config;