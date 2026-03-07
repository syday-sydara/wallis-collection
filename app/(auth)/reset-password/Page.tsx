"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState } from "react";

export default function Page() {
  const [done, setDone] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    setDone(true);
  }

  return (
    <AuthCard title="Reset Password">
      {done ? (
        <p className="text-center text-green-600">
          Password updated. You can now log in.
        </p>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <AuthInput name="password" type="password" placeholder="New password" required />
          <AuthInput name="confirm" type="password" placeholder="Confirm password" required />
          <AuthButton>Reset Password</AuthButton>
        </form>
      )}
    </AuthCard>
  );
}