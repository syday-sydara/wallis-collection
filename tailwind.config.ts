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
      /* ---------------------------------- */
      /* COLORS (WITH FALLBACKS)            */
      /* ---------------------------------- */
      colors: {
        bg: {
          DEFAULT: "rgb(var(--bg-default, 255 255 255) / <alpha-value>)",
          muted: "rgb(var(--bg-muted, 245 245 245) / <alpha-value>)",
          card: "rgb(var(--bg-card, 255 255 255) / <alpha-value>)",
        },

        text: {
          primary: "rgb(var(--text-primary, 17 24 39) / <alpha-value>)",
          secondary:
            "rgb(var(--text-secondary, 107 114 128) / <alpha-value>)",
        },

        border: {
          DEFAULT:
            "rgb(var(--border-default, 229 231 235) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "rgb(var(--color-primary, 59 130 246) / <alpha-value>)",
          foreground:
            "rgb(var(--color-primary-foreground, 255 255 255) / <alpha-value>)",
        },

        success: {
          DEFAULT: "rgb(var(--color-success, 34 197 94) / <alpha-value>)",
          foreground:
            "rgb(var(--color-success-foreground, 255 255 255) / <alpha-value>)",
        },

        danger: {
          DEFAULT: "rgb(var(--color-danger, 239 68 68) / <alpha-value>)",
          foreground:
            "rgb(var(--color-danger-foreground, 255 255 255) / <alpha-value>)",
        },

        warning: {
          DEFAULT: "rgb(var(--color-warning, 245 158 11) / <alpha-value>)",
          foreground:
            "rgb(var(--color-warning-foreground, 0 0 0) / <alpha-value>)",
        },

        /* E-commerce */
        price: {
          DEFAULT: "rgb(var(--price, 17 24 39) / <alpha-value>)",
          discounted:
            "rgb(var(--price-discounted, 220 38 38) / <alpha-value>)",
        },

        skeleton: "rgb(var(--skeleton, 229 231 235) / <alpha-value>)",
      },

      /* ---------------------------------- */
      /* TYPOGRAPHY                         */
      /* ---------------------------------- */
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },

      fontSize: {
        "2xs": ["0.75rem", { lineHeight: "1rem" }],
        body: ["1.05rem", { lineHeight: "1.65rem" }],
        "display-lg": ["2.5rem", { lineHeight: "3rem", fontWeight: "600" }],
        "display-md": ["2rem", { lineHeight: "2.5rem", fontWeight: "600" }],
        "display-sm": ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }],
      },

      /* ---------------------------------- */
      /* SPACING (TOKEN ALIGNED)            */
      /* ---------------------------------- */
      spacing: {
        1: "var(--space-1, 4px)",
        2: "var(--space-2, 8px)",
        3: "var(--space-3, 12px)",
        4: "var(--space-4, 16px)",
        6: "var(--space-6, 24px)",
        8: "var(--space-8, 32px)",
      },

      borderRadius: {
        sm: "var(--radius-sm, 6px)",
        md: "var(--radius-md, 10px)",
        lg: "var(--radius-lg, 14px)",
      },

      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

      zIndex: {
        10: "10",
        50: "50",
        dropdown: "var(--z-dropdown, 1000)",
        modal: "var(--z-modal, 1100)",
        toast: "var(--z-toast, 1200)",
      },

      /* ---------------------------------- */
      /* ANIMATION (UNIFIED)                */
      /* ---------------------------------- */
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
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
      /* Focus */
      addUtilities({
        ".focus-ring": {
          outline: "2px solid rgb(var(--color-primary, 59 130 246))",
          outlineOffset: "2px",
        },
      });

      /* Components (SINGLE SOURCE OF TRUTH) */
      addComponents({
        ".card": {
          backgroundColor: "rgb(var(--bg-card, 255 255 255))",
          border: "1px solid rgb(var(--border-default, 229 231 235))",
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