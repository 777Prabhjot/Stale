import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Alert({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}
