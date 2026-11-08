"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { routes } from "@/lib/config";
import { getErrorMessage, isAppError } from "@/lib/errors";
import type { MenuItem } from "@/lib/schemas/menu-item";
import { menuService } from "@/services/menu.service";
import { ItemForm } from "./item-form";

type State =
  | { status: "loading" }
  | { status: "ready"; item: MenuItem }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function EditItemScreen({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    menuService
      .getMine(id)
      .then((item) => active && setState({ status: "ready", item }))
      .catch((error: unknown) => {
        if (!active) return;
        setState(
          isAppError(error) && error.code === "NOT_FOUND"
            ? { status: "not-found" }
            : { status: "error", message: getErrorMessage(error) },
        );
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state.status === "loading") return <PageLoader label="Loading dish" />;

  if (state.status !== "ready") {
    return (
      <EmptyState
        title={state.status === "not-found" ? "Dish not found" : "This dish didn't load"}
        description={
          state.status === "not-found"
            ? "It may have been deleted. Go back to your menu to see what's there."
            : state.message
        }
        action={<ButtonLink href={routes.dashboard}>Back to menu</ButtonLink>}
      />
    );
  }

  return (
    <>
      <h1 className="mb-8 font-display text-4xl text-ink">Edit {state.item.name}</h1>
      <ItemForm item={state.item} />
    </>
  );
}
