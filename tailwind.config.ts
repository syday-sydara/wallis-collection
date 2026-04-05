import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
    "./ui/**/*.{ts,tsx,mdx}",
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        lg: "2rem",
      },
    },

    screens: {
      xs: "360px",
      ...defaultTheme.screens,
    },

    extend: {
      /* -------------------------------------------------- */
      /* Colors mapped to your CSS variables */
      /* -------------------------------------------------- */
      colors: {
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          muted: "rgb(var(--surface-muted) / <alpha-value>)",
          card: "rgb(var(--surface-card) / <alpha-value>)",
        },

        text: {
          DEFAULT: "rgb(var(--text) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },

        border: "rgb(var(--border) / <alpha-value>)",

        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          hover: "rgb(var(--color-primary-hover) / <alpha-value>)",
          active: "rgb(var(--color-primary-active) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },

        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          hover: "rgb(var(--color-success-hover) / <alpha-value>)",
          active: "rgb(var(--color-success-active) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
        },

        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          hover: "rgb(var(--color-danger-hover) / <alpha-value>)",
          active: "rgb(var(--color-danger-active) / <alpha-value>)",
          foreground: "rgb(var(--color-danger-foreground) / <alpha-value>)",
        },

        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          hover: "rgb(var(--color-warning-hover) / <alpha-value>)",
          active: "rgb(var(--color-warning-active) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
        },

        disabled: {
          DEFAULT: "rgb(var(--color-disabled) / <alpha-value>)",
          foreground: "rgb(var(--color-disabled-foreground) / <alpha-value>)",
        },

        skeleton: "rgb(var(--skeleton) / <alpha-value>)",
      },

      /* -------------------------------------------------- */
      /* Typography */
      /* -------------------------------------------------- */
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },

      fontSize: {
        sm: ["0.875rem", { lineHeight: "1.3rem" }],
        base: ["1.05rem", { lineHeight: "1.65rem" }],
        lg: ["1.2rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "2xs": ["0.7rem", { lineHeight: "1rem" }],
      },

      /* -------------------------------------------------- */
      /* Radii, Shadows, Motion */
      /* -------------------------------------------------- */
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        card: "0 1px 2px rgba(0,0,0,0.06)",
      },

      zIndex: {
        header: "10",
        modal: "40",
        overlay: "50",
      },

      padding: {
        safe: "env(safe-area-inset-bottom)",
      },

      minHeight: {
        touch: "44px",
      },

      scale: {
        press: "0.97",
      },

      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
      },

      keyframes: {
        shimmer: {
          from: { backgroundPosition: "-100% 0" },
          to: { backgroundPosition: "100% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },

      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        fadeIn: "fadeIn 0.3s ease-out",
        "fadeIn-fast": "fadeIn 0.15s ease-out",
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;