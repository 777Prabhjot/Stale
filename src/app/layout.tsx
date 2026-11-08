import type { Metadata, Viewport } from "next";
import { Figtree, IBM_Plex_Mono, Young_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const display = Young_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-young-serif",
});

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: { default: `${siteConfig.name} — digital café menus`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: "#f6f7f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
