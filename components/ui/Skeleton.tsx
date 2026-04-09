import { cn } from "@/lib/utils";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: React.ElementType;
  shape?: "rect" | "rounded" | "circle";
};

export function Skeleton({
  className,
  as: Component = "div",
  shape = "rect",
  ...props
}: SkeletonProps) {
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "rounded"
      ? "rounded-md"
      : "rounded-none"; // rect

  return (
    <Component
      role="status"
      aria-busy="true"
      className={cn("animate-pulse bg-skeleton", shapeClass, className)}
      {...props}
    />
  );
}