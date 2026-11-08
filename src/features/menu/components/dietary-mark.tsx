import type { Dietary } from "@/lib/schemas/menu-item";

export const dietaryLabels: Record<Dietary, string> = {
  unspecified: "Not specified",
  veg: "Vegetarian",
  egg: "Contains egg",
  "non-veg": "Non-vegetarian",
};

const colors: Record<Exclude<Dietary, "unspecified">, string> = {
  veg: "#2f7d32",
  egg: "#c99a06",
  "non-veg": "#8a3b1f",
};

/** The square-and-dot food mark diners in India already recognise. */
export function DietaryMark({ dietary }: { dietary: Dietary }) {
  if (dietary === "unspecified") return null;
  const color = colors[dietary];
  return (
    <svg viewBox="0 0 14 14" role="img" aria-label={dietaryLabels[dietary]} className="size-3.5 shrink-0">
      <title>{dietaryLabels[dietary]}</title>
      <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
      {dietary === "non-veg" ? (
        <path d="M7 3.6 10.2 9.6H3.8Z" fill={color} />
      ) : (
        <circle cx="7" cy="7" r="3" fill={color} />
      )}
    </svg>
  );
}
