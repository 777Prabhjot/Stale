"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/errors";
import type { MenuItem } from "@/lib/schemas/menu-item";
import { menuService } from "@/services/menu.service";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; items: MenuItem[] };

export function useMenuItems() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    try {
      const items = await menuService.listMine();
      setState({ status: "ready", items });
    } catch (error) {
      setState({ status: "error", message: getErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    // Initial fetch; state is only set after the awaited service call resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    void load();
  }, [load]);

  /** Apply a local change immediately; returns a function that reverts it. */
  const patchItem = useCallback((id: string, patch: Partial<MenuItem>) => {
    let previous: MenuItem | undefined;
    setState((current) => {
      if (current.status !== "ready") return current;
      return {
        status: "ready",
        items: current.items.map((item) => {
          if (item.id !== id) return item;
          previous = item;
          return { ...item, ...patch };
        }),
      };
    });
    return () => {
      if (!previous) return;
      const original = previous;
      setState((current) =>
        current.status === "ready"
          ? { status: "ready", items: current.items.map((i) => (i.id === id ? original : i)) }
          : current,
      );
    };
  }, []);

  const removeLocal = useCallback((id: string) => {
    setState((current) =>
      current.status === "ready"
        ? { status: "ready", items: current.items.filter((i) => i.id !== id) }
        : current,
    );
  }, []);

  const setItems = useCallback((items: MenuItem[]) => setState({ status: "ready", items }), []);

  return { state, reload, patchItem, removeLocal, setItems };
}
