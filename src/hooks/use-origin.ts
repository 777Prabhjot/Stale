"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/lib/config";

const noopSubscribe = () => () => {};

/** Public base URL for links/QR codes. Empty during SSR to avoid hydration mismatches. */
export function useOrigin(): string {
  const origin = useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => "",
  );
  return siteConfig.url || origin;
}
