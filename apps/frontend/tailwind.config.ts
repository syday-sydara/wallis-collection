import type { Config } from "tailwindcss";
import tokenPlugin from "./tailwind.token-plugin";
import { tokens } from "./tailwind.tokens";

const config: Config = {
  content: [
    "./apps/frontend/**/*.{js,ts,jsx,tsx}",
    "./packages/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        brand: "var(--colors-brand)",
        brandLight: "var(--colors-brandLight)",
        brandDark: "var(--colors-brandDark)",

        text: {
          primary: "var(--colors-text-primary)",
          secondary: "var(--colors-text-secondary)",
          muted: "var(--colors-text-muted)",
          inverse: "var(--colors-text-inverse)",
        },

        surface: {
          base: "var(--colors-surface-base)",
          muted: "var(--colors-surface-muted)",
          subtle: "var(--colors-surface-subtle)",
        },

        border: {
          base: "var(--colors-border-base)",
          strong: "var(--colors-border-strong)",
        },

        status: {
          paid: "var(--colors-status-paid)",
          pending: "var(--colors-status-pending)",
          failed: "var(--colors-status-failed)",
          processing: "var(--colors-status-processing)",
        },

        inventory: {
          instock: "var(--colors-inventory-instock)",
          low: "var(--colors-inventory-low)",
          out: "var(--colors-inventory-out)",
        },

        queue: {
          active: "var(--colors-queue-active)",
          waiting: "var(--colors-queue-waiting)",
          failed: "var(--colors-queue-failed)",
          delayed: "var(--colors-queue-delayed)",
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
