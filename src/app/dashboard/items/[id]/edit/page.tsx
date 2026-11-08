import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/spinner";
import { EditItemScreen } from "@/features/menu/components/edit-item-screen";

// Dashboard content needs the signed-in owner, which is checked in the browser, so it can't
// prerender. Remove once sign-in is checked on the server (proxy.ts). See features/auth/require-auth.tsx.
export const instant = false;

export const metadata: Metadata = { title: "Edit dish" };

export default function EditItemPage({ params }: PageProps<"/dashboard/items/[id]/edit">) {
  return (
    <Suspense fallback={<PageLoader label="Loading dish" />}>
      {params.then(({ id }) => (
        <EditItemScreen id={id} />
      ))}
    </Suspense>
  );
}
