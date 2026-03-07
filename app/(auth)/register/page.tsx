"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);
    window.location.href = "/login";
  }

  return (
    <AuthCard title="Create Account">
      <form onSubmit={handleRegister} className="space-y-4">
        <AuthInput name="name" type="text" placeholder="Full Name" required />
        <AuthInput name="email" type="email" placeholder="Email" required />
        <AuthInput name="password" type="password" placeholder="Password" required />

        <AuthButton>{loading ? "Creating..." : "Register"}</AuthButton>
      </form>

      <div className="text-sm text-center mt-4">
        <a href="/login" className="text-blue-600">Already have an account</a>
      </div>
    </AuthCard>
  );
}