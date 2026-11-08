import type { SectionIcon } from "./schemas/cafe";

export const sectionIconLabels: Record<SectionIcon, string> = {
  none: "No icon",
  coffee: "Coffee",
  tea: "Tea / chai",
  "cold-drink": "Cold drinks",
  shake: "Shakes",
  mojito: "Mojitos / coolers",
  pizza: "Pizza",
  burger: "Burgers",
  sandwich: "Sandwiches",
  "garlic-bread": "Breads",
  momos: "Momos",
  fries: "Fries / snacks",
  pasta: "Pasta / noodles",
  wrap: "Wraps / rolls",
  dessert: "Desserts",
  "ice-cream": "Ice cream",
  combo: "Combos",
  plate: "General",
};

/*
 * Keyword → icon, checked in order (first match wins), matching at the start of a word so
 * "Steamed" isn't "tea". Keep in step with the backfill in
 * backend/prisma/migrations/*_section_icon/migration.sql.
 */
const RULES: [SectionIcon, RegExp][] = [
  ["shake", /\b(shake|smoothie|milkshake)/i],
  ["mojito", /\b(mojito|cooler|lemonade|soda|lime|mocktail)/i],
  ["coffee", /\b(coffee|espresso|latte|cappuccino|kaapi)/i],
  ["tea", /\b(tea|chai)/i],
  ["cold-drink", /\b(cold drink|soft drink|beverage|drink|juice)/i],
  ["ice-cream", /\b(ice ?cream|sundae|kulfi|gelato)/i],
  ["dessert", /\b(dessert|cake|brownie|sweet|waffle|pastr|bakery)/i],
  ["pizza", /\bpizza/i],
  ["burger", /\bburger/i],
  ["garlic-bread", /\b(garlic|bread)/i],
  ["sandwich", /\b(sandwich|toast)/i],
  ["momos", /\b(momo|dumpling|dim ?sum)/i],
  ["fries", /\b(fries|snack|starter|nacho)/i],
  ["pasta", /\b(pasta|noodle|maggi|chowmein|spaghetti)/i],
  ["wrap", /\b(wrap|roll|frankie|shawarma|kathi)/i],
  ["combo", /\b(combo|meal|thali|platter|offer)/i],
];

/** Best-guess icon for a section name, e.g. "Crunchy Pizza" → "pizza". */
export function suggestSectionIcon(name: string): SectionIcon {
  return RULES.find(([, pattern]) => pattern.test(name))?.[0] ?? "none";
}
