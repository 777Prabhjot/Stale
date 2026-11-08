import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RequireAuth } from "@/features/auth/require-auth";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <DashboardHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </RequireAuth>
  );
}
