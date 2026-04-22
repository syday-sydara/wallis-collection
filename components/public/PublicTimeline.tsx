export const FRIENDLY_STATUS = {
  PENDING: {
    short: "Being prepared",
    long: "Your package is being prepared for dispatch",
    icon: "📦",
    severity: "info",
  },
  IN_TRANSIT: {
    short: "On the way",
    long: "Your package is currently in transit",
    icon: "🚚",
    severity: "info",
  },
  OUT_FOR_DELIVERY: {
    short: "Out for delivery",
    long: "A rider is on the way to your location",
    icon: "🏍️",
    severity: "medium",
  },
  DELIVERED: {
    short: "Delivered",
    long: "Your package has been delivered successfully",
    icon: "✅",
    severity: "low",
  },
  FAILED: {
    short: "Delivery failed",
    long: "A delivery attempt was made but was unsuccessful",
    icon: "⚠️",
    severity: "high",
  },
};
