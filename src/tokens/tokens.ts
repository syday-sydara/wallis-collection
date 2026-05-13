export const tokens = {
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

  spacing: {
    0: "var(--space-0)",
    1: "var(--space-1)",
    2: "var(--space-2)",
    3: "var(--space-3)",
    4: "var(--space-4)",
    5: "var(--space-5)",
    6: "var(--space-6)",
    8: "var(--space-8)",
    10: "var(--space-10)",
    12: "var(--space-12)",
    16: "var(--space-16)",
    20: "var(--space-20)",
    24: "var(--space-24)",
    32: "var(--space-32)",
    40: "var(--space-40)",
    48: "var(--space-48)",
    64: "var(--space-64)",
  },

  typography: {
    body: {
      sm: "var(--text-sm)",
      md: "var(--text-base)",
      lg: "var(--text-lg)",
    },
    heading: {
      sm: "var(--text-xl)",
      md: "var(--text-2xl)",
      lg: "var(--text-3xl)",
      xl: "var(--text-4xl)",
    },
    label: {
      sm: "var(--text-xs)",
      md: "var(--text-sm)",
    },
  },

  radius: {
    none: "var(--radius-none)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    xl: "var(--radius-xl)",
    full: "var(--radius-full)",
  },

  shadow: {
    xs: "var(--shadow-xs)",
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
    xl: "var(--shadow-xl)",
  },

  z: {
    base: "var(--z-base)",
    dropdown: "var(--z-dropdown)",
    sticky: "var(--z-sticky)",
    modal: "var(--z-modal)",
    toast: "var(--z-toast)",
    overlay: "var(--z-overlay)",
  },

  screens: {
    sm: "var(--bp-sm)",
    md: "var(--bp-md)",
    lg: "var(--bp-lg)",
    xl: "var(--bp-xl)",
    "2xl": "var(--bp-2xl)",
  },

  containers: {
    sm: "var(--container-sm)",
    md: "var(--container-md)",
    lg: "var(--container-lg)",
    xl: "var(--container-xl)",
  },
};

export type Tokens = typeof tokens;
