// components/formkit/SubmitButton.tsx
"use client";

import { useFormContext } from "./FormContextProvider";

export interface SubmitButtonProps {
  label: string;
  loadingLabel?: string;
}

export function SubmitButton({ label, loadingLabel = "Submitting…" }: SubmitButtonProps) {
  const { isSubmitting } = useFormContext();

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="btn btn-primary hover-lift disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isSubmitting ? loadingLabel : label}
    </button>
  );
}
