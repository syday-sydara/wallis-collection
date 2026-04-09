// components/admin/ui/AdminSkeleton.tsx
import clsx from "clsx";

export function AdminSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "animate-pulse rounded-md bg-surface-muted/50",
        className
      )}
    />
  );
}

export const SkeletonCard = () => (
  <div className="space-y-3 p-4 border border-border rounded-md">
    <AdminSkeleton className="h-4 w-1/3" />
    <AdminSkeleton className="h-3 w-full" />
    <AdminSkeleton className="h-3 w-5/6" />
    <AdminSkeleton className="h-3 w-2/3" />
  </div>
);

export const SkeletonTable = () => (
  <div className="border border-border rounded-md">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-3 border-b border-border">
        <AdminSkeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

export const SkeletonField = () => (
  <div className="space-y-2">
    <AdminSkeleton className="h-3 w-1/4" />
    <AdminSkeleton className="h-9 w-full" />
  </div>
);

export const SkeletonPageHeader = () => (
  <div className="space-y-2">
    <AdminSkeleton className="h-5 w-1/3" />
    <AdminSkeleton className="h-3 w-1/2" />
  </div>
);
