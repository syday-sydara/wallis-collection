// lib/whatsapp/config.ts

export const WHATSAPP_BASE_URL = "https://graph.facebook.com/v18.0";
export const WHATSAPP_TIMEOUT_MS = 8000;
export const WHATSAPP_MAX_ATTEMPTS = 2;

// Nigeria-focused defaults
export const DEFAULT_COUNTRY_CODE = "+234";
export const NIGERIA_CURRENCY_SYMBOL = "₦";

// Circuit breaker
export const WHATSAPP_CIRCUIT_FAILURE_THRESHOLD = 5;
export const WHATSAPP_CIRCUIT_OPEN_MS = 30_000;
