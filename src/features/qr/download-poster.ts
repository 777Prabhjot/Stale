import { AppError } from "@/lib/errors";

type PosterOptions = {
  qrCanvas: HTMLCanvasElement;
  cafeName: string;
  menuUrl: string;
  fileName: string;
};

const WIDTH = 1200;
const HEIGHT = 1600;
const INK = "#18201c";
const MUTED = "#6b756f";

function cssFont(variable: string, fallback: string) {
  const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return family ? `${family}, ${fallback}` : fallback;
}

/** Draws a print-ready table card (name, QR, caption) and downloads it as PNG. */
export async function downloadPoster({ qrCanvas, cafeName, menuUrl, fileName }: PosterOptions) {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new AppError("UNKNOWN", "Your browser couldn't create the image.");

  const display = cssFont("--font-young-serif", "Georgia, serif");
  const sans = cssFont("--font-figtree", "system-ui, sans-serif");
  const mono = cssFont("--font-plex-mono", "monospace");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "center";

  ctx.fillStyle = INK;
  ctx.font = `88px ${display}`;
  ctx.fillText(cafeName, WIDTH / 2, 230, WIDTH - 160);

  ctx.fillStyle = MUTED;
  ctx.font = `44px ${sans}`;
  ctx.fillText("Scan for today's menu", WIDTH / 2, 320);

  const qrSize = 760;
  ctx.drawImage(qrCanvas, (WIDTH - qrSize) / 2, 420, qrSize, qrSize);

  ctx.fillStyle = MUTED;
  ctx.font = `32px ${mono}`;
  ctx.fillText(menuUrl.replace(/^https?:\/\//, ""), WIDTH / 2, 1320, WIDTH - 160);

  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
