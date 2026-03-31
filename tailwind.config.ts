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
        DEFAULT: "0.75rem",
        sm: "1rem",
        lg: "2rem",
      },
    },

    extend: {
      colors: {
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",
        card: "rgb(var(--surface-card) / <alpha-value>)",

        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },

        border: "rgb(var(--border) / <alpha-value>)",

        /* Simplified brand scale */
        brand: {
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
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

        skeleton: "rgb(var(--skeleton) / <alpha-value>)",
        disabled: "rgb(156 163 175 / <alpha-value>)",
      },

      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["1rem", { lineHeight: "1.6rem" }],
        lg: ["1.125rem", { lineHeight: "1.7rem" }],
        xl: ["1.25rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.2rem" }],
      },

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

      zIndex: {
        header: "10",
        dropdown: "20",
        overlay: "30",
        modal: "40",
        toast: "50",
      },

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