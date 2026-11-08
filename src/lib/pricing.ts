import type { Currency } from "./schemas/cafe";
import type { MenuItemData } from "./schemas/menu-item";

export type Discount = Pick<MenuItemData, "discountType" | "discountValue">;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function hasDiscount(discount: Discount): boolean {
  return discount.discountType !== "none" && Boolean(discount.discountValue);
}

/** The same discount applies to every size of a dish. */
export function applyDiscount(amount: number, discount: Discount): number {
  if (!hasDiscount(discount)) return amount;
  const value = discount.discountValue ?? 0;
  return discount.discountType === "percent"
    ? round2(amount * (1 - value / 100))
    : round2(Math.max(amount - value, 0));
}

/** Human label such as "20% off" or "₹30 off". */
export function discountLabel(discount: Discount, currency: Currency): string | null {
  if (!hasDiscount(discount)) return null;
  const value = discount.discountValue ?? 0;
  return discount.discountType === "percent"
    ? `${value}% off`
    : `${formatPrice(value, currency)} off`;
}

const formatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(amount: number, currency: Currency): string {
  const fractional = !Number.isInteger(amount);
  const key = `${currency}-${fractional}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en", {
      style: "currency",
      currency,
      minimumFractionDigits: fractional ? 2 : 0,
      maximumFractionDigits: 2,
    });
    formatters.set(key, formatter);
  }
  return formatter.format(amount);
}

export function currencySymbol(currency: Currency): string {
  return (
    new Intl.NumberFormat("en", { style: "currency", currency })
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}
