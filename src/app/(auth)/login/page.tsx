import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-4xl text-ink">Welcome back</h1>
      <p className="mt-2 mb-8 text-muted">Sign in to update your menu.</p>
      <LoginForm />
    </>
  );
}
