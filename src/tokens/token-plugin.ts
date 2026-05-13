import plugin from "tailwindcss/plugin";

export default plugin(function ({ addBase }) {
  const flatten = (obj: any, prefix = "") =>
    Object.entries(obj).reduce((acc, [key, value]) => {
      const newKey = prefix ? `${prefix}-${key}` : key;

      if (typeof value === "string") {
        acc[`--${newKey}`] = value;
      } else {
        Object.assign(acc, flatten(value, newKey));
      }

      return acc;
    }, {} as Record<string, string>);

  addBase({
    ":root": flatten({
      color: tokens.colors,
      space: tokens.spacing,
      radius: tokens.radius,
      shadow: tokens.shadow,
      z: tokens.z,
      bp: tokens.screens,
      container: tokens.containers,
      text: tokens.typography,
    }),
  });
});
