// components/formkit/validation.ts
export type Validator = (value: any) => string | null;

export const required = (msg = "This field is required"): Validator => (value) =>
  value === undefined || value === null || value === "" ? msg : null;

export const minLength = (len: number, msg?: string): Validator => (value) =>
  value && value.length < len ? msg ?? `Must be at least ${len} characters` : null;

export const email = (msg = "Enter a valid email address"): Validator => (value) =>
  value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? msg : null;

export const pattern = (regex: RegExp, msg: string): Validator => (value) =>
  value && !regex.test(value) ? msg : null;

export const custom = (fn: Validator): Validator => fn;
