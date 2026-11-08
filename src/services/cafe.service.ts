import { api } from "@/lib/api";
import type { Cafe, CafeProfile } from "@/lib/schemas/cafe";

export const cafeService = {
  async updateProfile(profile: CafeProfile): Promise<Cafe> {
    const { cafe } = await api<{ cafe: Cafe }>("/cafe", { method: "PATCH", body: profile });
    return cafe;
  },
};
