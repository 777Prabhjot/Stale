import { api } from "@/lib/api";
import type { Cafe } from "@/lib/schemas/cafe";
import type { MenuItem, MenuItemInput } from "@/lib/schemas/menu-item";

export type PublicMenu = { cafe: Cafe; items: MenuItem[] };
export type MoveDirection = "up" | "down";

const itemPath = (id: string) => `/items/${encodeURIComponent(id)}`;

export const menuService = {
  async listMine(): Promise<MenuItem[]> {
    const { items } = await api<{ items: MenuItem[] }>("/items");
    return items;
  },

  async getMine(id: string): Promise<MenuItem> {
    const { item } = await api<{ item: MenuItem }>(itemPath(id));
    return item;
  },

  async create(input: MenuItemInput): Promise<MenuItem> {
    const { item } = await api<{ item: MenuItem }>("/items", { method: "POST", body: input });
    return item;
  },

  async update(id: string, input: MenuItemInput): Promise<MenuItem> {
    const { item } = await api<{ item: MenuItem }>(itemPath(id), { method: "PUT", body: input });
    return item;
  },

  async setAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
    const { item } = await api<{ item: MenuItem }>(`${itemPath(id)}/availability`, {
      method: "PATCH",
      body: { isAvailable },
    });
    return item;
  },

  /** Swaps a dish with its neighbour in the same section. Returns all of the café's dishes. */
  async move(id: string, direction: MoveDirection): Promise<MenuItem[]> {
    const { items } = await api<{ items: MenuItem[] }>(`${itemPath(id)}/move`, {
      method: "POST",
      body: { direction },
    });
    return items;
  },

  async remove(id: string): Promise<void> {
    await api<void>(itemPath(id), { method: "DELETE" });
  },

  /** No sign-in needed: this is what diners load after scanning the QR code. */
  getPublicMenu(slug: string): Promise<PublicMenu> {
    return api<PublicMenu>(`/public/menus/${encodeURIComponent(slug)}`);
  },
};
