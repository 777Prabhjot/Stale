"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { routes } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-3xl text-ink">This page didn&apos;t load</h1>
      <p className="mt-3 text-muted">{getErrorMessage(error)}</p>
      <div className="mt-8 flex justify-center gap-2">
        <Button onClick={retry}>Try again</Button>
        <ButtonLink href={routes.dashboard} variant="secondary">
          Back to menu
        </ButtonLink>
      </div>
    </div>
  );
}
