@tailwind base;
@tailwind components;
@tailwind utilities;

/* ─────────────────────────────────────────────
   DESIGN TOKENS — Wallis Collection
   These power your entire design system.
────────────────────────────────────────────── */
:root {
  --font-inter: "Inter", sans-serif;

  /* Surfaces */
  --surface: #ffffff;
  --surface-muted: #fafafa;

  /* Text */
  --text: #111111;
  --text-muted: #666666;

  /* Borders */
  --border-subtle: #e5e5e5;

  /* Brand Palette */
  --brand-50: #fdf7f2;
  --brand-100: #f8e7d6;
  --brand-200: #f0cfad;
  --brand-300: #e5ae7a;
  --brand-400: #d98b4a;
  --brand-500: #c96b24;
  --brand-600: #a5521a;
  --brand-700: #7f3c14;
  --brand-800: #5a2910;
  --brand-900: #3c1a0a;

  /* Editorial Rhythm */
  --rhythm-xs: 0.25rem;
  --rhythm-sm: 0.5rem;
  --rhythm-md: 1rem;
  --rhythm-lg: 1.5rem;
  --rhythm-xl: 2rem;
}

body {
  font-family: var(--font-inter);
  background: var(--surface);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* Utility tokens */
.bg-surface {
  background-color: var(--surface);
}

.text-text {
  color: var(--text);
}
