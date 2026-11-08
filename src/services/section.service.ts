import { api } from "@/lib/api";
import type { Cafe, Section, SectionInput } from "@/lib/schemas/cafe";
import type { MoveDirection } from "./menu.service";

type SectionResult = { cafe: Cafe; section: Section };

const sectionPath = (id: string) => `/sections/${encodeURIComponent(id)}`;

/** Sections live on the café, so every call returns the updated café. */
export const sectionService = {
  create(input: SectionInput): Promise<SectionResult> {
    return api<SectionResult>("/sections", { method: "POST", body: input });
  },

  /** Size changes keep dish prices attached on the server (see the API's sections service). */
  update(sectionId: string, input: SectionInput): Promise<SectionResult> {
    return api<SectionResult>(sectionPath(sectionId), { method: "PUT", body: input });
  },

  async remove(sectionId: string): Promise<Cafe> {
    const { cafe } = await api<{ cafe: Cafe }>(sectionPath(sectionId), { method: "DELETE" });
    return cafe;
  },

  async move(sectionId: string, direction: MoveDirection): Promise<Cafe> {
    const { cafe } = await api<{ cafe: Cafe }>(`${sectionPath(sectionId)}/move`, {
      method: "POST",
      body: { direction },
    });
    return cafe;
  },
};
