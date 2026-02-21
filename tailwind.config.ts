import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
    },
    extend: {
      colors: {
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        bg: "var(--color-bg)",
        neutral: "var(--color-neutral)",
        secondary: "var(--color-secondary)",
      },
    },
  },
};

export default config;