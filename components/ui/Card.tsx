import { cn } from "@/lib/utils";

type Padding = "none" | "sm" | "md" | "lg";

const paddingClasses: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  padding?: Padding;
};

export function Card({ padding = "md", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface shadow-sm",
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  );
}
