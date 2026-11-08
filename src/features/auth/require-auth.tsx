"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { PageLoader } from "@/components/ui/spinner";
import { routes } from "@/lib/config";
import { useAuth } from "./auth-provider";

/**
 * Client-side guard: asks the API who's signed in (httpOnly cookie) and redirects if nobody is.
 * The API enforces sign-in on every request regardless; this only decides what to render.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.status === "unauthenticated") router.replace(routes.login);
  }, [state.status, router]);

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Alert>{state.message}</Alert>
      </div>
    );
  }
  if (state.status !== "authenticated") return <PageLoader />;
  return children;
}
