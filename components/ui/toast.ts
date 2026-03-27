export function toast(message: string, variant: "success" | "error") {
  if (typeof window === "undefined") return;
  const color = variant === "success" ? "green" : "red";
  console.log(`%c${message}`, `color:${color}; font-weight:bold;`);
}
