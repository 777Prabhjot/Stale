import type { Metadata } from "next";
import { QrPoster } from "@/features/qr/qr-poster";

// Dashboard content needs the signed-in owner, which is checked in the browser, so it can't
// prerender. Remove once sign-in is checked on the server (proxy.ts). See features/auth/require-auth.tsx.
export const instant = false;

export const metadata: Metadata = { title: "QR code" };

export default function QrPage() {
  return (
    <>
      <h1 className="mb-8 font-display text-4xl text-ink print:hidden">QR code</h1>
      <QrPoster />
    </>
  );
}
