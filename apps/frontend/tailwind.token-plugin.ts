import plugin from "tailwindcss/plugin";
import { tokens } from "./tailwind.tokens";

export default plugin(function ({ addBase }) {
  const rootVars: Record<string, string> = {};

  // Flatten tokens into CSS variables
  const flatten = (obj: any, prefix = "") => {
    for (const key in obj) {
      const value = obj[key];
      const varName = prefix ? `${prefix}-${key}` : key;

      if (typeof value === "object") {
        flatten(value, varName);
      } else {
        rootVars[`--${varName}`] = value;
      }
    }
  };

  flatten(tokens);

  addBase({
    ":root": rootVars,
  });
});
