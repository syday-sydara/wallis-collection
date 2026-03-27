await prisma.fraudRule.createMany({
  data: [
    {
      name: "high_risk_ip",
      description: "IP address is in a known high‑risk list",
      category: "ip",
      severity: "block",
      weight: 30,
      condition: {
        type: "ip_in_list",
        list: ["41.190.3.22", "102.89.44.10"]
      }
    },
    {
      name: "email_phone_mismatch",
      description: "Email domain does not match phone region",
      category: "identity",
      severity: "review",
      weight: 20,
      condition: {
        type: "email_phone_mismatch"
      }
    },
    {
      name: "too_many_attempts",
      description: "User has exceeded safe number of checkout attempts",
      category: "behavior",
      severity: "block",
      weight: 40,
      condition: {
        type: "numeric_threshold",
        metric: "attempts",
        operator: ">",
        value: 3
      }
    },
    {
      name: "suspicious_user_agent",
      description: "User agent string is unusually short",
      category: "device",
      severity: "log",
      weight: 10,
      condition: {
        type: "min_user_agent_length",
        value: 10
      }
    }
  ]
});