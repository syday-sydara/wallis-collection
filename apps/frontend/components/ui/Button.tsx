import clsx from "clsx";

export function Button({ className = "", ...props }) {
  return (
    <div className={clsx("rounded border border-gray-200 p-3 bg-white", className)} {...props}>
      <span className="text-gray-400 text-sm">Button component</span>
    </div>
  );
}
