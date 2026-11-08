export const siteConfig = {
  name: "Slate",
  description:
    "Digital menus for cafés. Change a price or run a discount in seconds — no reprinting.",
  /** Public base URL used inside QR codes. Falls back to the current origin when empty. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  /** "Use the demo account" on the sign-in page. Never in production, where anyone could edit it. */
  showDemoLogin: process.env.NODE_ENV !== "production",
} as const;

export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  newItem: "/dashboard/items/new",
  editItem: (id: string) => `/dashboard/items/${id}/edit`,
  qr: "/dashboard/qr",
  settings: "/dashboard/settings",
  publicMenu: (slug: string) => `/m/${slug}`,
} as const;

export const DEMO_ACCOUNT = {
  /** Typed after the +91 prefix on the sign-in form. */
  phone: "9876543210",
  password: "demo1234",
  slug: "cafe-bites",
} as const;
