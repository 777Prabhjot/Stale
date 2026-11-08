import { AppError } from "@/lib/errors";

const MAX_INPUT_BYTES = 8 * 1024 * 1024;

/**
 * Shrinks an uploaded logo to fit inside `maxSize`×`maxSize` and returns a data URL.
 * Keeps logos small enough for browser storage until real file storage exists.
 */
export async function resizeImage(file: File, maxSize = 256): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new AppError("VALIDATION", "Choose an image file (PNG, JPG or WebP).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new AppError("VALIDATION", "That image is over 8 MB. Choose a smaller one.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (cause) {
    throw new AppError("VALIDATION", "That image couldn't be read. Try a PNG or JPG.", { cause });
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new AppError("UNKNOWN", "Your browser couldn't process the image.");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps transparency and is much smaller than PNG; Safari < 14 falls back to PNG.
  const webp = canvas.toDataURL("image/webp", 0.85);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png");
}
