"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState } from "react";

export default function Page() {
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    setSent(true);
  }

  return (
    <AuthCard title="Forgot Password">
      {sent ? (
        <p className="text-center text-green-600">
          Reset link sent to your email.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput name="email" type="email" placeholder="Enter your email" required />
          <AuthButton>Send Reset Link</AuthButton>
        </form>
      )}
    </AuthCard>
  );
}