import type { ReactNode } from "react";
import type { SectionIcon as SectionIconKey } from "@/lib/schemas/cafe";
import { cn } from "@/lib/utils";

/*
 * Hand-drawn style line icons for menu sections (24×24, stroke = currentColor), in the same
 * spirit as the doodles on the menu's signboard.
 */
const paths: Record<Exclude<SectionIconKey, "none">, ReactNode> = {
  coffee: (
    <>
      <path d="M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M4 21.5h14" />
      <path d="M9 3c-1 1.4 1 2.4 0 4.5M12.5 3c-1 1.4 1 2.4 0 4.5" />
    </>
  ),
  tea: (
    <>
      <path d="M6 7h12l-1.4 12.3a2 2 0 0 1-2 1.7H9.4a2 2 0 0 1-2-1.7Z" />
      <path d="M6.6 12h10.8" />
      <path d="M10 2.5c-.8 1 .8 1.8 0 3M14 2.5c-.8 1 .8 1.8 0 3" />
    </>
  ),
  "cold-drink": (
    <>
      <path d="M10 2h4v3l1.5 3v12.5A1.5 1.5 0 0 1 14 22h-4a1.5 1.5 0 0 1-1.5-1.5V8L10 5Z" />
      <path d="M8.5 12h7M8.5 16.5h7" />
    </>
  ),
  shake: (
    <>
      <path d="M7 10h10l-1.3 10.2a1.5 1.5 0 0 1-1.5 1.3H9.8a1.5 1.5 0 0 1-1.5-1.3Z" />
      <path d="M6.5 10a2.5 2.5 0 0 1 2.6-3.3 3 3 0 0 1 5.8 0A2.5 2.5 0 0 1 17.5 10" />
      <path d="M13.5 6.5 15.5 2h2" />
    </>
  ),
  mojito: (
    <>
      <path d="M5 8h13l-1.4 11.5a2 2 0 0 1-2 1.5H8.4a2 2 0 0 1-2-1.5Z" />
      <path d="M8 13.5c1.4-1.2 2.8-1.2 4 0M10.5 16.5l1.5 1" />
      <circle cx="18" cy="6" r="3" />
      <path d="M18 3v6M15 6h6" />
    </>
  ),
  pizza: (
    <>
      <path d="M3.5 5.5c5.5-2.7 11.5-2.7 17 0L12 21.5Z" />
      <path d="M4.6 8c4.7-2 10.1-2 14.8 0" />
      <circle cx="10.3" cy="10.8" r="1.2" />
      <circle cx="14.2" cy="13.2" r="1.1" />
      <circle cx="11.6" cy="16" r="0.9" />
    </>
  ),
  burger: (
    <>
      <path d="M4 11a8 6 0 0 1 16 0Z" />
      <path d="M3.5 14c1.4.9 2.6.9 4 0s2.6.9 4 0 2.6.9 4 0 2.6.9 4 0" />
      <path d="M4.5 17h15v1a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18Z" />
      <path d="M9 7.5l.6-.3M12.5 6.8l.6.2M15.3 8.2l.4-.4" />
    </>
  ),
  sandwich: (
    // A sandwich half: crust on the two straight sides, filling along the cut.
    <>
      <path d="M3.5 20.5 20.5 3.5v15a2 2 0 0 1-2 2Z" />
      <path d="M17.5 9.5v8h-8" />
      <path d="M6.8 19.2c.9-.1 1.3-.9 2.2-1s1.3.6 2.2.5" />
      <path d="M12.2 13.8c.9-.1 1.3-.9 2.2-1s1.3.6 2.2.5" />
    </>
  ),
  "garlic-bread": (
    <>
      <path d="M5 11.5a4 4 0 0 1 2-7.5h10a4 4 0 0 1 2 7.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19Z" />
      <path d="M9 11.5l.8.8M13.5 13.5l.8.8M10 16.5l.8.8M15 9.5l.8.8" />
    </>
  ),
  momos: (
    <>
      <path d="M3.5 16c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 16Z" />
      <path d="M12 7.5v3.5M8.7 8.5l1.2 2.8M15.3 8.5l-1.2 2.8" />
      <path d="M2.5 21.5h19" />
    </>
  ),
  fries: (
    <>
      <path d="M8 10V4M10.8 10V2.8M13.6 10V4.2M16.2 10V5.8" />
      <path d="M6 10h12l-1.6 10.6a1 1 0 0 1-1 .9H8.6a1 1 0 0 1-1-.9Z" />
      <path d="M6.3 12c2.8 1.8 8.6 1.8 11.4 0" />
    </>
  ),
  pasta: (
    <>
      <path d="M3 12h18c0 4.4-4 8-9 8s-9-3.6-9-8Z" />
      <path d="M7.5 12c0-2.2 2.2-2.2 2.2-4.4S7.5 5.4 7.5 3.2M12 12c0-2.2 2.2-2.2 2.2-4.4S12 5.4 12 3.2M16.5 12c0-1.6 1.5-1.8 1.5-3.4" />
    </>
  ),
  wrap: (
    <>
      <path d="M4.6 16.6 14.8 6.4a3.5 3.5 0 0 1 5 5L9.6 21.6a3.5 3.5 0 0 1-5-5Z" />
      <path d="M14 7.2l3 3" />
      <path d="M8.5 13.5l2 2M11 11l1.2 1.2" />
    </>
  ),
  dessert: (
    <>
      <path d="M3 13 19 8v12H3Z" />
      <path d="M3 16.5h16" />
      <path d="M3 13l16-5" />
      <circle cx="15.5" cy="5" r="1.5" />
      <path d="M15.5 6.5V8.6" />
    </>
  ),
  "ice-cream": (
    <>
      <path d="M7.5 11.5 12 22l4.5-10.5" />
      <path d="M7 11.5a5 5 0 1 1 10 0Z" />
      <path d="M9.4 15.5l3.8-2.2M10.6 18.6l2.8-1.6" />
    </>
  ),
  combo: (
    <>
      <path d="M2.5 15a4.5 3.6 0 0 1 9 0Z" />
      <path d="M2.5 17h9" />
      <path d="M3 19h8v.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 3 19.5Z" />
      <path d="M14 8h6.5l-1.1 12.3a1 1 0 0 1-1 .9H16a1 1 0 0 1-1-.9Z" />
      <path d="M17.5 8l1-5.5h2" />
    </>
  ),
  plate: (
    <>
      <path d="M2.5 19.5h19" />
      <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" />
      <path d="M12 12V10.5M10.5 10.5h3" />
    </>
  ),
};

export function SectionIcon({ icon, className }: { icon: SectionIconKey; className?: string }) {
  if (icon === "none") return null;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-6 shrink-0", className)}
    >
      {paths[icon]}
    </svg>
  );
}
