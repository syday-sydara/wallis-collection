import plugin from "tailwindcss/plugin";

export const designSystemPlugin = plugin(function ({
  addComponents,
  addUtilities,
  theme,
}) {
  /* -------------------------------------------------- */
  /* COMPONENTS                                         */
  /* -------------------------------------------------- */

  addComponents({
    /* ---------------- BUTTON ---------------- */
    ".btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "var(--font-weight-medium)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-2) var(--space-4)",
      transition:
        "background var(--transition-fast) var(--ease-standard), color var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast)",
      cursor: "pointer",
      lineHeight: "var(--line-height-md)",
    },

    ".btn-primary": {
      background: "rgb(var(--color-primary))",
      color: "rgb(var(--text-inverse))",
    },

    ".btn-primary:hover": {
      opacity: "0.9",
    },

    ".btn-primary:active": {
      transform: "scale(0.97)",
    },

    ".btn:disabled": {
      background: "rgb(var(--color-disabled))",
      color: "rgb(var(--color-disabled-foreground))",
      cursor: "not-allowed",
      opacity: "0.6",
    },

    /* ---------------- CARD ---------------- */
    ".card": {
      background: "rgb(var(--bg-card))",
      border: "1px solid rgb(var(--border-default))",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-sm)",
      padding: "var(--space-4)",
      transition: "box-shadow var(--transition-fast)",
    },

    ".card:hover": {
      boxShadow: "var(--shadow-md)",
    },

    /* ---------------- INPUT ---------------- */
    ".input": {
      width: "100%",
      borderRadius: "var(--radius-md)",
      border: "1px solid rgb(var(--border-default))",
      background: "rgb(var(--bg-default))",
      color: "rgb(var(--text-primary))",
      padding: "var(--space-2) var(--space-3)",
      transition:
        "border-color var(--transition-fast), background var(--transition-fast)",
    },

    ".input::placeholder": {
      color: "rgb(var(--text-secondary))",
      opacity: "0.7",
    },

    ".input:hover": {
      borderColor: "rgb(var(--text-secondary))",
    },

    ".input:focus-visible": {
      outline: "var(--focus-ring-width) solid rgb(var(--focus-ring))",
      outlineOffset: "2px",
      borderColor: "rgb(var(--color-primary))",
    },

    ".input:disabled": {
      background: "rgb(var(--color-disabled))",
      color: "rgb(var(--color-disabled-foreground))",
      cursor: "not-allowed",
      opacity: "0.6",
    },

    ".input-sm": {
      padding: "var(--space-1) var(--space-2)",
      fontSize: "var(--font-size-sm)",
    },

    ".input-lg": {
      padding: "var(--space-3) var(--space-4)",
      fontSize: "var(--font-size-lg)",
    },

    ".input-error": {
      borderColor: "rgb(var(--color-danger))",
    },

    ".input-error:focus-visible": {
      outlineColor: "rgb(var(--color-danger))",
    },

    ".input-success": {
      borderColor: "rgb(var(--color-success))",
    },

    ".input-success:focus-visible": {
      outlineColor: "rgb(var(--color-success))",
    },
  });

  /* -------------------------------------------------- */
  /* UTILITIES                                          */
  /* -------------------------------------------------- */

  addUtilities({
    /* Skeleton */
    ".skeleton": {
      background:
        "linear-gradient(90deg, rgb(var(--skeleton)) 25%, rgb(var(--bg-muted)) 50%, rgb(var(--skeleton)) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s linear infinite",
    },

    /* Animations */
    ".animate-fade-in": {
      animation: "fade-in var(--transition-medium) var(--ease-standard)",
    },

    ".animate-scale-in": {
      animation: "scale-in var(--transition-fast) var(--ease-standard)",
    },

    ".animate-slide-up": {
      animation: "slide-up 0.25s ease-out",
    },

    ".animate-toast-slide-in": {
      animation: "toast-slide-in 0.25s ease-out",
    },
  });
});
