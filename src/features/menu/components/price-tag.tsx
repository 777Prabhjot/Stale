import { applyDiscount, discountLabel, formatPrice, hasDiscount, type Discount } from "@/lib/pricing";
import type { Currency, Section } from "@/lib/schemas/cafe";
import type { ItemTag, MenuItem } from "@/lib/schemas/menu-item";
import { cn } from "@/lib/utils";
import { getSizePrices } from "../utils";

type PriceTagProps = {
  amount: number;
  discount: Discount;
  currency: Currency;
  /** Stack the crossed-out price above the final one (for narrow price columns). */
  stacked?: boolean;
  className?: string;
};

/** Final price in mono; when discounted, the old price is crossed out beside it. */
export function PriceTag({ amount, discount, currency, stacked, className }: PriceTagProps) {
  const discounted = hasDiscount(discount);
  return (
    <span
      className={cn(
        "inline-flex font-mono tabular-nums",
        stacked ? "flex-col items-end leading-tight" : "items-baseline gap-2",
        className,
      )}
    >
      {discounted && (
        <s className={cn("text-muted decoration-danger/70 decoration-[1.5px]", stacked ? "text-[0.7rem]" : "text-sm")}>
          <span className="sr-only">was </span>
          {formatPrice(amount, currency)}
        </s>
      )}
      <span className="font-medium text-ink">
        {discounted && <span className="sr-only">now </span>}
        {formatPrice(applyDiscount(amount, discount), currency)}
      </span>
    </span>
  );
}

/** Compact one-line summary for the dashboard, e.g. "Reg ₹40 · Large ₹60". */
export function PriceSummary({
  item,
  section,
  currency,
}: {
  item: Pick<MenuItem, "prices" | "discountType" | "discountValue">;
  section: Section | undefined;
  currency: Currency;
}) {
  const prices = getSizePrices(item, section).filter((p) => p.amount !== undefined);
  if (prices.length === 0) return <span className="text-sm text-danger">Price not set</span>;

  return (
    <span className="flex flex-wrap items-baseline justify-end gap-x-3 gap-y-1">
      {prices.map((p) => (
        <span key={p.sizeId} className="inline-flex items-baseline gap-1.5">
          {p.label && <span className="text-xs text-muted">{p.label}</span>}
          <PriceTag amount={p.amount!} discount={item} currency={currency} />
        </span>
      ))}
    </span>
  );
}

const badge = "rounded-full px-2 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide uppercase";

export function DiscountBadge({ discount, currency }: { discount: Discount; currency: Currency }) {
  const label = discountLabel(discount, currency);
  if (!label) return null;
  return <span className={cn(badge, "bg-chalk text-chalk-ink")}>{label}</span>;
}

export const tagLabels: Record<ItemTag, string> = {
  none: "No tag",
  bestseller: "Bestseller",
  new: "New",
  special: "Chef's special",
};

export function TagBadge({ tag }: { tag: ItemTag }) {
  if (tag === "none") return null;
  return <span className={cn(badge, "bg-slate text-white")}>{tagLabels[tag]}</span>;
}
