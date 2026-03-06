"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "subtle";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm tracking-wide";

  const variants = {
    primary: "bg-primary text-bg hover:opacity-90",
    outline:
      "border border-primary text-primary hover:bg-primary/10",
    subtle: "text-secondary hover:text-primary",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}