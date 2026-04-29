import { designSystemPlugin } from "./lib/design-system/designSystemPlugin";

export default {
  // ...
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    designSystemPlugin,
  ],
};
