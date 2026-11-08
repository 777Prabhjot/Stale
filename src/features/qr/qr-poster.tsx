"use client";

import Image from "next/image";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/auth/auth-provider";
import { useOrigin } from "@/hooks/use-origin";
import { routes } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";
import { downloadPoster } from "./download-poster";

export function QrPoster() {
  const { cafe } = useSession();
  const origin = useOrigin();
  const toast = useToast();
  const hiResRef = useRef<HTMLCanvasElement>(null);
  const [downloading, setDownloading] = useState(false);

  const menuUrl = origin ? `${origin}${routes.publicMenu(cafe.slug)}` : "";

  async function handleDownload() {
    if (!hiResRef.current || !menuUrl) return;
    setDownloading(true);
    try {
      await downloadPoster({
        qrCanvas: hiResRef.current,
        cafeName: cafe.name,
        menuUrl,
        fileName: `${cafe.slug}-menu-qr.png`,
      });
      toast.success("QR card downloaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(menuUrl);
      toast.success("Menu link copied");
    } catch {
      toast.error("Couldn't copy. Select the link and copy it manually.");
    }
  }

  // minmax(0, …): let columns shrink below their content, so long menu links truncate
  // instead of widening the page on phones.
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="print-area mx-auto flex w-full max-w-xs min-w-0 flex-col items-center rounded-[1.75rem] border border-line bg-surface px-8 pt-9 pb-7 text-center shadow-[0_30px_60px_-30px_rgba(24,32,28,0.25)]">
        {cafe.logo && (
          <Image src={cafe.logo} alt="" width={48} height={48} unoptimized className="mb-3 size-12 rounded-xl object-contain" />
        )}
        <p className="font-display text-2xl text-ink">{cafe.name}</p>
        <p className="mt-1 text-sm text-muted">Scan for today&apos;s menu</p>
        <div className="mt-6 flex size-52 items-center justify-center">
          {menuUrl ? (
            <QRCodeSVG value={menuUrl} size={208} level="M" fgColor="#18201c" title={`QR code for ${menuUrl}`} />
          ) : (
            <Spinner className="text-muted" />
          )}
        </div>
        <p className="mt-5 max-w-full truncate font-mono text-xs text-muted">
          {menuUrl.replace(/^https?:\/\//, "")}
        </p>
      </div>

      {menuUrl && (
        <QRCodeCanvas
          ref={hiResRef}
          value={menuUrl}
          size={1024}
          level="M"
          marginSize={2}
          fgColor="#18201c"
          className="hidden"
          aria-hidden="true"
        />
      )}

      <div className="max-w-md min-w-0 print:hidden">
        <h2 className="text-lg font-semibold text-ink">Put this on every table</h2>
        <p className="mt-2 leading-relaxed text-muted">
          Customers scan it with their phone camera and land on your live menu. Print it once. When
          you change a price or add a discount, the same code shows the new menu.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={handleDownload} loading={downloading} disabled={!menuUrl}>
            Download PNG
          </Button>
          <Button variant="secondary" onClick={() => window.print()} disabled={!menuUrl}>
            Print
          </Button>
        </div>

        <div className="mt-8">
          <p className="text-sm font-medium text-ink">Menu link</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pr-1.5 pl-3.5">
            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate font-mono text-sm text-slate hover:underline"
            >
              {menuUrl}
            </a>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!menuUrl}>
              Copy
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted">
            Changing your menu link in Settings changes this code. Reprint it if you do.
          </p>
        </div>
      </div>
    </div>
  );
}
