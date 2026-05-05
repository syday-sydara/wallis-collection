import clsx from "clsx";

const badgeVariants = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-danger/10 text-danger border-danger/20",
  info: "bg-info/10 text-info border-info/20",
};

type BadgeVariant = keyof typeof badgeVariants;

export function Badge({ variant = "info", className = "", ...props }: { variant?: BadgeVariant; className?: string; [key: string]: any }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
