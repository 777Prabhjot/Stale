import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 font-display text-4xl text-ink">This page isn&apos;t on the menu</h1>
      <p className="mt-3 max-w-sm text-muted">Check the link, or head back to the start.</p>
      <ButtonLink href={routes.home} className="mt-8">
        Go to homepage
      </ButtonLink>
    </main>
  );
}
