import type { Config } from "tailwindcss";
import tokenPlugin from "./token-plugin";
import { tokens } from "../tokens";

export default {
  theme: {
    extend: {
      spacing: tokens.spacing,
      borderRadius: tokens.radius,
      boxShadow: tokens.shadow,
      zIndex: tokens.z,
      screens: tokens.screens,
      containers: tokens.containers,
    },
  },
  plugins: [tokenPlugin],
} satisfies Config;
