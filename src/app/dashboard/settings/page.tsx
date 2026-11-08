import type { Metadata } from "next";
import { SettingsForm } from "@/features/cafe/settings-form";

// Dashboard content needs the signed-in owner, which is checked in the browser, so it can't
// prerender. Remove once sign-in is checked on the server (proxy.ts). See features/auth/require-auth.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <h1 className="font-display text-4xl text-ink">Settings</h1>
      <p className="mt-1 mb-8 text-sm text-muted">Details customers see at the top of your menu.</p>
      <SettingsForm />
    </>
  );
}
