// lib/risk/rules/default.ts

import type { RiskPolicy, RiskRule } from "@/lib/risk/types";

/* -------------------------------------------------- */
/* Default Rule Set                                    */
/* -------------------------------------------------- */

const rules: RiskRule[] = [
  {
    id: "high_amount",
    label: "High order amount",
    description: "Order amount is unusually high (>= ₦150,000)",
    weight: 25,
    condition: {
      type: "numeric_threshold",
      metric: "amount",
      operator: ">=",
      value: 150_000,
    },
  },

  {
    id: "free_email",
    label: "Free email provider",
    description: "Email domain belongs to a free email provider",
    weight: 10,
    condition: {
      type: "email_domain_in_list",
      list: [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "icloud.com",
        "live.com",
        "proton.me",
        "ymail.com",
      ],
    },
  },

  {
    id: "nigeria_phone_prefix",
    label: "Nigerian phone prefix",
    description: "Phone number uses a Nigerian carrier prefix",
    weight: 5,
    condition: {
      type: "phone_prefix_in_list",
      list: ["+234", "070", "080", "081", "090", "091"],
      length: 4,
    },
  },

  {
    id: "ip_velocity_high",
    label: "High IP velocity",
    description: "Too many requests from the same IP address",
    weight: 20,
    condition: {
      type: "velocity_above",
      metric: "ipVelocity",
      value: 60,
    },
  },

  {
    id: "failed_logins",
    label: "Multiple failed logins",
    description: "User has exceeded safe login attempt thresholds",
    weight: 15,
    condition: {
      type: "failed_logins_above",
      value: 5,
    },
  },

  {
    id: "device_reputation_low",
    label: "Low device reputation",
    description: "Device reputation score is below safe threshold",
    weight: 20,
    condition: {
      type: "device_reputation_below",
      value: 40,
    },
  },

  {
    id: "distance_jump",
    label: "Large IP distance jump",
    description: "User's IP location changed drastically in a short time",
    weight: 15,
    condition: {
      type: "distance_from_last_ip_above",
      value: 1500,
    },
  },

  {
    id: "bot_ua",
    label: "Bot-like user agent",
    description: "User agent string matches known bot signatures",
    weight: 15,
    condition: {
      type: "is_bot",
    },
  },

  {
    id: "private_ip",
    label: "Private IP address",
    description: "User is connecting from a private or masked network",
    weight: 5,
    condition: {
      type: "is_private_ip",
    },
  },

  {
    id: "short_user_agent",
    label: "Suspiciously short user agent",
    description: "User agent string is unusually short (< 20 chars)",
    weight: 10,
    condition: {
      type: "min_user_agent_length",
      value: 20,
    },
  },
];

/* -------------------------------------------------- */
/* Default Policy                                      */
/* -------------------------------------------------- */

export const defaultRiskPolicy: RiskPolicy = {
  id: "default",
  label: "Default Risk Policy",
  description: "Baseline risk policy for checkout, login, and account flows",
  rules,
  baseScore: 0,
  maxScore: 100,
  blockThreshold: 60,
  reviewThreshold: 30,
};
