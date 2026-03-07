"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="text-sm text-primary">{label}</label>}

      <input
        {...props}
        className={`
          w-full px-4 py-2 rounded-lg border text-sm
          focus:ring-2 focus:ring-primary/40 outline-none
          ${error ? "border-danger" : "border-neutral/30"}
        `}
      />

      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}