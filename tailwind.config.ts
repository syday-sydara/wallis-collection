// File: tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#272B36",      // Dark Gray / Anthracite
        accent: "#a08a81",       // Warm Beige
        background: "#ffffff",   // White background
        neutral: "#b7b8bb",      // Light Gray
        secondary: "#595d66",    // Medium Gray

        status: {
          success: "#4CAF50",
          warning: "#A08A81",
          danger: "#C94F4F",
        },
      },

      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },

      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.04)",
        card: "0 8px 30px rgba(0, 0, 0, 0.06)",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: {
        400: "400ms",
      },
    },
  },
  plugins: [],
};

export default config;