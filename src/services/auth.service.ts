import { api } from "@/lib/api";
import { isAppError } from "@/lib/errors";
import type { LoginInput, RegisterInput, User } from "@/lib/schemas/auth";
import type { Cafe } from "@/lib/schemas/cafe";

export type AuthSession = { user: User; cafe: Cafe };

/** The session lives in an httpOnly cookie set by the API; these calls never see the token. */
export const authService = {
  /** The signed-in owner, or null when signed out. */
  async getSession(): Promise<AuthSession | null> {
    try {
      return await api<AuthSession>("/auth/me");
    } catch (error) {
      if (isAppError(error) && error.code === "UNAUTHORIZED") return null;
      throw error;
    }
  },

  login(input: LoginInput): Promise<AuthSession> {
    return api<AuthSession>("/auth/login", { method: "POST", body: input });
  },

  register(input: RegisterInput): Promise<AuthSession> {
    return api<AuthSession>("/auth/register", { method: "POST", body: input });
  },

  async logout(): Promise<void> {
    await api<void>("/auth/logout", { method: "POST" });
  },
};
