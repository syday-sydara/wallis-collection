import { cn } from "@/lib/utils";

type Variant = "default" | "brand" | "warning" | "danger";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  default: "bg-surface-muted text-text",
  brand: "bg-primary text-primary-foreground",
  warning: "bg-amber-500 text-white",
  danger: "bg-danger text-white",
};

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
