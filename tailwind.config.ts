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
        sm: "1rem",
        lg: "2rem",
        xl: "3rem",
      },
    },

    extend: {
      colors: {
        /* Surface & text */
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--surface-muted) / <alpha-value>)",

        text: "rgb(var(--text) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-subtle": "rgb(var(--text-subtle) / <alpha-value>)",

        border: "rgb(var(--border) / <alpha-value>)",

        /* Brand scale */
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

        /* Semantic */
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

        /* Commerce */
        commerce: {
          price: "rgb(var(--color-price) / <alpha-value>)",
          discount: "rgb(var(--color-discount) / <alpha-value>)",
          instock: "rgb(var(--color-instock) / <alpha-value>)",
          outofstock: "rgb(var(--color-outofstock) / <alpha-value>)",
        },
      },

      borderRadius: {
        ...defaultTheme.borderRadius,
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },

      boxShadow: {
        ...defaultTheme.boxShadow,
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },

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
      },

      /* Avoid overriding Tailwind spacing scale */
      spacing: {
        "space-xs": "var(--space-xs)",
        "space-sm": "var(--space-sm)",
        "space-md": "var(--space-md)",
        "space-lg": "var(--space-lg)",
        "space-xl": "var(--space-xl)",
      },

      zIndex: {
        header: "100",
        overlay: "1050",
        dropdown: "var(--z-dropdown)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
      },

      ringColor: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
      },
    },
  },

  plugins: [],
};

export default config;