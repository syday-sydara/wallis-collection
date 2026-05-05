import { cn } from "@/lib/cn";

interface FileUploadProps {
  onChange?: (file: File | null) => void;
  className?: string;
}

export function FileUpload({ onChange, className }: FileUploadProps) {
  return (
    <label
      className={cn(
        "flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-border bg-bg-subtle text-text-secondary",
        "hover:bg-bg-muted",
        className
      )}
    >
      <input
        type="file"
        className="hidden"
        onChange={(e) => onChange?.(e.target.files?.[0] ?? null)}
      />
      <span>Click to upload</span>
    </label>
  );
}
