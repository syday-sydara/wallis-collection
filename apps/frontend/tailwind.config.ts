import type { Config } from "tailwindcss";
import tokenPlugin from "../../src/tokens/token-plugin";
import { tokens } from "./tailwind.tokens";

const config: Config = {
  content: [
    "./apps/frontend/**/*.{js,ts,jsx,tsx}",
    "./packages/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: "var(--color-brand)",
        brandLight: "var(--color-brand-light)",
        brandDark: "var(--color-brand-dark)",

        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          inverse: "var(--color-text-inverse)",
        },

        surface: {
          base: "var(--color-bg)",
          muted: "var(--color-bg-muted)",
          subtle: "var(--color-bg-subtle)",
        },

        border: {
          base: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },

        status: {
          paid: "var(--status-paid)",
          pending: "var(--status-pending)",
          failed: "var(--status-failed)",
          processing: "var(--status-processing)",
        },

        inventory: {
          instock: "var(--inventory-instock)",
          low: "var(--inventory-low)",
          out: "var(--inventory-out)",
        },

        queue: {
          active: "var(--queue-active)",
          waiting: "var(--queue-waiting)",
          failed: "var(--queue-failed)",
          delayed: "var(--queue-delayed)",
        },
      },

      spacing: tokens.spacing,

      fontSize: {
        ...tokens.typography.body,
        ...tokens.typography.heading,
        ...tokens.typography.label,
      },

      borderRadius: tokens.radius,
      boxShadow: tokens.shadow,
      zIndex: tokens.z,
      screens: tokens.screens,
      containers: tokens.containers,
    },
  },

  plugins: [tokenPlugin],
};

export default config;
