import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { GuestOnly } from "@/features/auth/guest-only";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-16 sm:pt-12">
        <div className="w-full max-w-md">
          <GuestOnly>{children}</GuestOnly>
        </div>
      </main>
    </div>
  );
}
