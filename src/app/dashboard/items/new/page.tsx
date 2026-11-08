import type { Metadata } from "next";
import { ItemForm } from "@/features/menu/components/item-form";

// Dashboard content needs the signed-in owner, which is checked in the browser, so it can't
// prerender. Remove once sign-in is checked on the server (proxy.ts). See features/auth/require-auth.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Add dish" };

export default function NewItemPage() {
  return (
    <>
      <h1 className="mb-8 font-display text-4xl text-ink">Add dish</h1>
      <ItemForm />
    </>
  );
}
