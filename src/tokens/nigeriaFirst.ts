export const nigeriaFirst = {
  payment: {
    transfer: "var(--payment-transfer)",
    pos: "var(--payment-pos)",
    retry: "var(--payment-retry)",
    reversed: "var(--payment-reversed)",
  },

  delivery: {
    dispatch: "var(--delivery-dispatch)",
    transit: "var(--delivery-transit)",
    riderAssigned: "var(--delivery-rider-assigned)",
    failed: "var(--delivery-failed)",
  },

  whatsapp: {
    inbound: "var(--whatsapp-inbound)",
    outbound: "var(--whatsapp-outbound)",
    unread: "var(--whatsapp-unread)",
    failed: "var(--whatsapp-failed)",
  },

  uiDensity: {
    compact: {
      xs: "var(--space-compact-1)",
      sm: "var(--space-compact-2)",
      md: "var(--space-compact-3)",
    },
  },

  typography: {
    headingBold: "var(--text-heading-bold)",
    labelStrong: "var(--text-label-strong)",
    bodyReadable: "var(--text-body-readable)",
  },
};

export type NigeriaFirstTokens = typeof nigeriaFirst;
