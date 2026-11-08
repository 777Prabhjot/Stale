"use client";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { routes } from "@/lib/config";

export function SiteHeader() {
  const { state } = useAuth();

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      <Logo />
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Account">
        {state.status === "authenticated" ? (
          <ButtonLink href={routes.dashboard} size="sm">
            Open dashboard
          </ButtonLink>
        ) : (
          <>
            <ButtonLink href={routes.login} variant="ghost" size="sm">
              Sign in
            </ButtonLink>
            <ButtonLink href={routes.register} size="sm">
              Register café
            </ButtonLink>
          </>
        )}
      </nav>
    </header>
  );
}
