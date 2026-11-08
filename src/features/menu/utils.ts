import { BASE_SIZE_ID, type Section } from "@/lib/schemas/cafe";
import type { MenuItem } from "@/lib/schemas/menu-item";

export type MenuGroup = { section: Section; items: MenuItem[] };

/** Groups dishes under the café's sections, both in the owner's chosen order. */
export function groupBySection(items: MenuItem[], sections: Section[]): MenuGroup[] {
  return sections.map((section) => ({
    section,
    items: items
      .filter((item) => item.sectionId === section.id)
      .sort((a, b) => a.position - b.position),
  }));
}

export type SizePrice = { sizeId: string; label: string; amount: number | undefined };

/** One entry per column of the section; `amount` is undefined when not sold in that size. */
export function getSizePrices(item: Pick<MenuItem, "prices">, section: Section | undefined): SizePrice[] {
  if (!section || section.sizes.length === 0) {
    return [{ sizeId: BASE_SIZE_ID, label: "", amount: item.prices[BASE_SIZE_ID] }];
  }
  return section.sizes.map((size) => ({
    sizeId: size.id,
    label: size.label,
    amount: item.prices[size.id],
  }));
}

export function sectionAnchor(section: Pick<Section, "id">) {
  return `section-${section.id}`;
}
