export function toast(message: string, variant: "success" | "error") {
  if (typeof window === "undefined") return;

  // Create container if it doesn't exist
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className =
      "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 px-4";
    document.body.appendChild(container);
  }

  // Toast element
  const el = document.createElement("div");
  el.className = `
    animate-fadeIn-fast
    rounded-md px-4 py-3 text-sm font-medium shadow-lg
    text-white
    ${variant === "success" ? "bg-success" : "bg-danger"}
  `;
  el.textContent = message;

  container.appendChild(el);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    el.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => el.remove(), 300);
  }, 3000);
}
