"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getErrorMessage } from "@/lib/errors";
import type { LoginInput, RegisterInput } from "@/lib/schemas/auth";
import type { Cafe } from "@/lib/schemas/cafe";
import { authService, type AuthSession } from "@/services/auth.service";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; session: AuthSession }
  | { status: "error"; message: string };

type AuthContextValue = {
  state: AuthState;
  login: (input: LoginInput) => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  /** Push an updated café into the session after editing settings. */
  setCafe: (cafe: Cafe) => void;
  /** Re-read the session, e.g. after menu edits change the café's categories. */
  refresh: () => Promise<void>;
  /** Starts the first session check. Called by `useAuth`, so pages that never ask don't pay for it. */
  request: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  // The session check runs only once something calls useAuth(). Diners on the public menu
  // never do, so a QR scan doesn't trigger a sign-in lookup.
  const [requested, setRequested] = useState(false);
  const request = useCallback(() => setRequested(true), []);

  useEffect(() => {
    if (!requested) return;
    let active = true;
    authService
      .getSession()
      .then((session) => {
        if (!active) return;
        setState(session ? { status: "authenticated", session } : { status: "unauthenticated" });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: "error", message: getErrorMessage(error) });
      });
    return () => {
      active = false;
    };
  }, [requested]);

  const login = useCallback(async (input: LoginInput) => {
    const session = await authService.login(input);
    setState({ status: "authenticated", session });
    return session;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authService.register(input);
    setState({ status: "authenticated", session });
    return session;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setState({ status: "unauthenticated" });
  }, []);

  const setCafe = useCallback((cafe: Cafe) => {
    setState((current) =>
      current.status === "authenticated"
        ? { status: "authenticated", session: { ...current.session, cafe } }
        : current,
    );
  }, []);

  const refresh = useCallback(async () => {
    const session = await authService.getSession();
    setState(session ? { status: "authenticated", session } : { status: "unauthenticated" });
  }, []);

  const value = useMemo(
    () => ({ state, login, register, logout, setCafe, refresh, request }),
    [state, login, register, logout, setCafe, refresh, request],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  const { request } = ctx;
  useEffect(request, [request]);
  return ctx;
}

/** For screens rendered behind the dashboard guard, where a session is guaranteed. */
export function useSession(): AuthSession {
  const { state } = useAuth();
  if (state.status !== "authenticated") {
    throw new Error("useSession called without an authenticated session");
  }
  return state.session;
}
