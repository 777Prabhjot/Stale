"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { useAuth, useSession } from "@/features/auth/auth-provider";
import { routes } from "@/lib/config";
import { cn } from "@/lib/utils";

const nav = [
  { href: routes.dashboard, label: "Menu", match: (p: string) => p === routes.dashboard || p.startsWith("/dashboard/items") },
  { href: routes.qr, label: "QR code", match: (p: string) => p.startsWith(routes.qr) },
  { href: routes.settings, label: "Settings", match: (p: string) => p.startsWith(routes.settings) },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { cafe } = useSession();

  async function handleSignOut() {
    await logout();
    router.replace(routes.login);
  }

  return (
    <header className="border-b border-line bg-surface print:hidden">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 pt-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo href={routes.dashboard} />
          <span className="text-line-strong" aria-hidden="true">/</span>
          <span className="truncate text-sm font-medium text-ink">{cafe.name}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <a
            href={routes.publicMenu(cafe.slug)}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink sm:inline-block"
          >
            View live menu ↗
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>

      <nav aria-label="Dashboard" className="mx-auto mt-3 flex w-full max-w-5xl gap-1 overflow-x-auto px-2 sm:px-4">
        {nav.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-b-2 px-3 pt-2 pb-3 text-sm transition-colors",
                active ? "border-slate font-medium text-ink" : "border-transparent text-muted hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
