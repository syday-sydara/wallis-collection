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
      ...tokens, // auto‑maps all tokens into Tailwind theme
    },
  },

  plugins: [tokenPlugin],
};

export default config;
