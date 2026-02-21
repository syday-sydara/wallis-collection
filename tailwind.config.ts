import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },

    extend: {
      colors: {
        /* Core Theme (CSS Variables Based) */
        primary: "rgb(var(--primary) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        neutral: "rgb(var(--neutral) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",

        /* Ecommerce Tokens */
        price: {
          current: "rgb(var(--primary) / <alpha-value>)",
          old: "rgb(var(--neutral) / <alpha-value>)",
          sale: "#C94F4F",
        },

        badge: {
          new: "rgb(var(--primary) / <alpha-value>)",
          sale: "#C94F4F",
          limited: "rgb(var(--accent) / <alpha-value>)",
        },

        status: {
          success: "#4CAF50",
          warning: "rgb(var(--accent) / <alpha-value>)",
          danger: "#C94F4F",
        },
      },

      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },

      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        full: "9999px",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.04)",
        product: "0 8px 30px rgba(0,0,0,0.05)",
        productHover: "0 20px 60px rgba(0,0,0,0.08)",
        card: "0 12px 40px rgba(0,0,0,0.06)",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: {
        400: "400ms",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.4s ease-in-out",
        slideUp: "slideUp 0.4s ease-out",
      },
    },
  },

  plugins: [],
}

export default config