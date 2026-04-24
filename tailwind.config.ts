import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],

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
      colors: {
        bg: {
          DEFAULT: "rgb(var(--bg-default) / <alpha-value>)",
          muted: "rgb(var(--bg-muted) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
        },

        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        },

        border: {
          DEFAULT: "rgb(var(--border-default) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          foreground: "rgb(var(--color-primary-foreground) / <alpha-value>)",
        },

        success: {
          DEFAULT: "rgb(var(--color-success) / <alpha-value>)",
          foreground: "rgb(var(--color-success-foreground) / <alpha-value>)",
        },

        danger: {
          DEFAULT: "rgb(var(--color-danger) / <alpha-value>)",
          foreground: "rgb(var(--color-danger-foreground) / <alpha-value>)",
        },

        warning: {
          DEFAULT: "rgb(var(--color-warning) / <alpha-value>)",
          foreground: "rgb(var(--color-warning-foreground) / <alpha-value>)",
        },

        price: {
          DEFAULT: "rgb(var(--price) / <alpha-value>)",
          discounted: "rgb(var(--price-discounted) / <alpha-value>)",
        },

        whatsapp: "rgb(var(--color-whatsapp) / <alpha-value>)",
        skeleton: "rgb(var(--skeleton) / <alpha-value>)",
      },

      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },

      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "20px",
        6: "var(--space-6)",
        7: "28px",
        8: "var(--space-8)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full, 9999px)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      zIndex: {
        dropdown: "var(--z-dropdown)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },

      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },

      animation: {
        fadeIn: "fadeIn 200ms ease-out",
        shimmer: "shimmer 1.5s infinite linear",
      },
    },
  },

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),

    plugin(function ({ addUtilities, addComponents }) {
      addUtilities({
        ".focus-ring": {
          outline: "2px solid rgb(var(--color-primary))",
          outlineOffset: "2px",
        },
      });

      addComponents({
        ".card": {
          backgroundColor: "rgb(var(--bg-card))",
          border: "1px solid rgb(var(--border-default))",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-sm)",
        },
        ".card-body": {
          padding: "var(--space-4)",
        },
      });
    }),
  ],
};

export default config;
