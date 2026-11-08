"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/ui/spinner";
import { routes } from "@/lib/config";
import { useAuth } from "./auth-provider";

/**
 * Sends signed-in owners to their dashboard instead of the login/register screens.
 * Children render while the session is still loading, so the forms are part of the
 * prerendered HTML (and Next.js can validate the segment for instant navigation).
 */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "authenticated") router.replace(routes.dashboard);
  }, [state.status, router]);

  if (state.status === "authenticated") return <PageLoader />;
  return children;
}
