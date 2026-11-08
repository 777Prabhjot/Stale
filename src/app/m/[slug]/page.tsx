import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLoader } from "@/components/ui/spinner";
import { PaperGrain } from "@/features/public-menu/menu-backdrop";
import { PublicMenu } from "@/features/public-menu/public-menu";

export const metadata: Metadata = { title: "Menu" };

export default function PublicMenuPage({ params }: PageProps<"/m/[slug]">) {
  return (
    // `menu-surface`: the whole page is menu paper (warm cream), not the app's cool white.
    <main className="menu-surface flex-1">
      <PaperGrain />
      <Suspense fallback={<PageLoader label="Opening menu" />}>
        {params.then(({ slug }) => (
          <PublicMenu slug={slug} />
        ))}
      </Suspense>
    </main>
  );
}
