import { MenuManager } from "@/features/menu/components/menu-manager";

// Dashboard content needs the signed-in owner, which is checked in the browser, so it can't
// prerender. Remove once sign-in is checked on the server (proxy.ts). See features/auth/require-auth.tsx.
export const instant = false;

export default function DashboardPage() {
  return <MenuManager />;
}
