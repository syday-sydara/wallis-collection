export const themes = {
  default: "default",
  nigeriaFirst: "nigeriaFirst",
} as const;

export type ThemeName = keyof typeof themes;

export function setTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
}
