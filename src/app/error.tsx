"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { routes } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";

export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-ink">This page didn&apos;t load</h1>
      <p className="mt-3 max-w-sm text-muted">{getErrorMessage(error)}</p>
      <div className="mt-8 flex gap-2">
        <Button onClick={retry}>Try again</Button>
        <ButtonLink href={routes.home} variant="secondary">
          Go to homepage
        </ButtonLink>
      </div>
    </main>
  );
}
