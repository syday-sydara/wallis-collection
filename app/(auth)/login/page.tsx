"use client";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/account",
    });

    setLoading(false);
  }

  return (
    <AuthCard title="Login">
      <form onSubmit={handleLogin} className="space-y-4">
        <AuthInput name="email" type="email" placeholder="Email" required />
        <AuthInput name="password" type="password" placeholder="Password" required />

        <AuthButton>{loading ? "Logging in..." : "Login"}</AuthButton>
      </form>

      <div className="text-sm text-center mt-4">
        <a href="/forgot-password" className="text-blue-600">Forgot password</a>
      </div>

      <div className="text-sm text-center mt-2">
        <a href="/register" className="text-blue-600">Create an account</a>
      </div>
    </AuthCard>
  );
}