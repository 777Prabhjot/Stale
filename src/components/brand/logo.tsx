import Link from "next/link";
import { routes, siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

/** Wordmark: a small slate tile with a chalk stroke, next to the name. */
export function Logo({ href = routes.home, className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
        <rect x="1.5" y="3" width="21" height="18" rx="4" className="fill-slate" />
        <path d="M6 15.5c2.2-.9 3.4-3.6 5.6-3.6 2.4 0 2.3 2.8 6.4 2.1" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl leading-none">{siteConfig.name}</span>
    </Link>
  );
}
