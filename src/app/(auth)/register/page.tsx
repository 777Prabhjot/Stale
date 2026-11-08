import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = { title: "Register your café" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display text-4xl text-ink">Register your café</h1>
      <p className="mt-2 mb-8 text-muted">You&apos;ll get a menu link and a QR code for your tables.</p>
      <RegisterForm />
    </>
  );
}
