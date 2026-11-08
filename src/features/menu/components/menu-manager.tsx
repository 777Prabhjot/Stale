"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { useAuth, useSession } from "@/features/auth/auth-provider";
import { routes } from "@/lib/config";
import { getErrorMessage } from "@/lib/errors";
import type { Currency, Section } from "@/lib/schemas/cafe";
import type { MenuItem } from "@/lib/schemas/menu-item";
import { cn } from "@/lib/utils";
import { menuService, type MoveDirection } from "@/services/menu.service";
import { sectionService } from "@/services/section.service";
import { useMenuItems } from "../hooks/use-menu-items";
import { groupBySection } from "../utils";
import { DietaryMark } from "./dietary-mark";
import { DiscountBadge, PriceSummary, TagBadge } from "./price-tag";
import { SectionDialog } from "./section-dialog";
import { SectionIcon } from "./section-icon";

type PendingDelete = { kind: "dish"; item: MenuItem } | { kind: "section"; section: Section };
type SectionEditor = { open: false } | { open: true; section?: Section };

export function MenuManager() {
  const { cafe } = useSession();
  const { setCafe } = useAuth();
  const toast = useToast();
  const { state, reload, patchItem, removeLocal, setItems } = useMenuItems();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editor, setEditor] = useState<SectionEditor>({ open: false });

  const items = useMemo(() => (state.status === "ready" ? state.items : []), [state]);
  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const all = groupBySection(items, cafe.sections);
    if (!q) return all;
    return all
      .map((g) => ({
        ...g,
        items: g.section.name.toLowerCase().includes(q)
          ? g.items
          : g.items.filter((i) => i.name.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [items, cafe.sections, q]);

  async function toggleAvailability(item: MenuItem, isAvailable: boolean) {
    const revert = patchItem(item.id, { isAvailable });
    try {
      await menuService.setAvailability(item.id, isAvailable);
      toast.success(isAvailable ? `${item.name} is back on the menu` : `${item.name} marked sold out`);
    } catch (error) {
      revert();
      toast.error(getErrorMessage(error));
    }
  }

  async function moveItem(item: MenuItem, direction: MoveDirection) {
    try {
      setItems(await menuService.move(item.id, direction));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function moveSection(section: Section, direction: MoveDirection) {
    try {
      setCafe(await sectionService.move(section.id, direction));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === "dish") {
        await menuService.remove(pendingDelete.item.id);
        removeLocal(pendingDelete.item.id);
        toast.success(`${pendingDelete.item.name} deleted`);
      } else {
        setCafe(await sectionService.remove(pendingDelete.section.id));
        toast.success(`${pendingDelete.section.name} deleted`);
      }
      setPendingDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  if (state.status === "loading") return <PageLoader label="Loading your menu" />;

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-start gap-4">
        <Alert>{state.message}</Alert>
        <Button variant="secondary" size="sm" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  const soldOut = items.filter((i) => !i.isAvailable).length;
  const hasSections = cafe.sections.length > 0;
  const reordering = !q;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Menu</h1>
          <p className="mt-1 text-sm text-muted">
            {cafe.sections.length} {cafe.sections.length === 1 ? "section" : "sections"} · {items.length}{" "}
            {items.length === 1 ? "dish" : "dishes"}
            {soldOut > 0 && ` · ${soldOut} sold out`}
          </p>
        </div>
        {hasSections && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditor({ open: true })}>
              Add section
            </Button>
            <ButtonLink href={routes.newItem}>Add dish</ButtonLink>
          </div>
        )}
      </div>

      {!hasSections ? (
        <div className="mt-10">
          <EmptyState
            title="Start with a section"
            description="Sections group your dishes, like Hot Coffee or Pizza. Give a section sizes if its dishes come in Small, Med and Large."
            action={<Button onClick={() => setEditor({ open: true })}>Add your first section</Button>}
          />
        </div>
      ) : (
        <>
          {items.length > 0 && (
            <div className="mt-8 max-w-xs">
              <label htmlFor="menu-search" className="sr-only">
                Search dishes
              </label>
              <Input
                id="menu-search"
                type="search"
                placeholder="Search dishes or sections"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}

          {groups.length === 0 ? (
            <p className="mt-10 text-muted">No dishes match “{query}”.</p>
          ) : (
            <div className="mt-8 flex flex-col gap-10">
              {groups.map(({ section, items: sectionItems }, groupIndex) => (
                <section key={section.id} aria-labelledby={`heading-${section.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      <h2 id={`heading-${section.id}`} className="flex items-center gap-2 text-lg font-semibold text-ink">
                        <SectionIcon icon={section.icon} className="size-5 text-roast/70" />
                        {section.name}
                        <span className="ml-2 text-sm font-normal text-muted">{sectionItems.length}</span>
                      </h2>
                      <p className="mt-0.5 text-sm text-muted">
                        {section.sizes.length ? section.sizes.map((s) => s.label).join(" · ") : "One price"}
                        {section.note && <> · <span className="italic">{section.note}</span></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {reordering && (
                        <MoveButtons
                          name={section.name}
                          canUp={groupIndex > 0}
                          canDown={groupIndex < groups.length - 1}
                          onMove={(d) => moveSection(section, d)}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => setEditor({ open: true, section })}
                        className="rounded-full px-3 py-1.5 text-sm text-slate hover:bg-slate-soft"
                      >
                        Edit<span className="sr-only"> {section.name} section</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete({ kind: "section", section })}
                        className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-danger-soft hover:text-danger"
                      >
                        Delete<span className="sr-only"> {section.name} section</span>
                      </button>
                    </div>
                  </div>

                  {sectionItems.length === 0 ? (
                    <div className="mt-3 rounded-2xl border border-dashed border-line-strong px-5 py-6 text-sm text-muted">
                      No dishes in this section yet.{" "}
                      <Link href={routes.newItem} className="font-medium text-slate underline-offset-4 hover:underline">
                        Add a dish
                      </Link>
                    </div>
                  ) : (
                    <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
                      {sectionItems.map((item, index) => (
                        <MenuRow
                          key={item.id}
                          item={item}
                          section={section}
                          currency={cafe.currency}
                          move={
                            reordering
                              ? {
                                  canUp: index > 0,
                                  canDown: index < sectionItems.length - 1,
                                  onMove: (d) => moveItem(item, d),
                                }
                              : undefined
                          }
                          onToggle={(value) => toggleAvailability(item, value)}
                          onDelete={() => setPendingDelete({ kind: "dish", item })}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <SectionDialog
        open={editor.open}
        section={editor.open ? editor.section : undefined}
        onClose={() => setEditor({ open: false })}
        onSaved={({ cafe: updated }) => {
          setCafe(updated);
          setEditor({ open: false });
          // Size changes can remap dish prices, so re-read the dishes.
          reload();
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={
          pendingDelete?.kind === "section"
            ? `Delete ${pendingDelete.section.name}?`
            : `Delete ${pendingDelete?.item.name ?? "dish"}?`
        }
        description={
          pendingDelete?.kind === "section"
            ? "The section must be empty. Move or delete its dishes first."
            : "It will disappear from your live menu straight away. This can't be undone."
        }
        confirmLabel={pendingDelete?.kind === "section" ? "Delete section" : "Delete dish"}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function MoveButtons({
  name,
  canUp,
  canDown,
  onMove,
}: {
  name: string;
  canUp: boolean;
  canDown: boolean;
  onMove: (direction: MoveDirection) => void;
}) {
  const style =
    "flex size-8 items-center justify-center rounded-full text-muted hover:bg-slate-soft hover:text-ink disabled:pointer-events-none disabled:opacity-30";
  return (
    <span className="inline-flex">
      <button type="button" className={style} disabled={!canUp} onClick={() => onMove("up")} aria-label={`Move ${name} up`}>
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5 10 7.5l5 5" />
        </svg>
      </button>
      <button type="button" className={style} disabled={!canDown} onClick={() => onMove("down")} aria-label={`Move ${name} down`}>
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 7.5 10 12.5l5-5" />
        </svg>
      </button>
    </span>
  );
}

type MenuRowProps = {
  item: MenuItem;
  section: Section;
  currency: Currency;
  move?: { canUp: boolean; canDown: boolean; onMove: (direction: MoveDirection) => void };
  onToggle: (value: boolean) => void;
  onDelete: () => void;
};

function MenuRow({ item, section, currency, move, onToggle, onDelete }: MenuRowProps) {
  return (
    <li className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-4">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {move && (
          <span className="-my-1 shrink-0">
            <MoveButtons name={item.name} {...move} />
          </span>
        )}
        <div className={cn("min-w-0 flex-1", !move && "pl-1", !item.isAvailable && "opacity-55")}>
          <div className="flex flex-wrap items-center gap-2">
            <DietaryMark dietary={item.dietary} />
            <span className="font-medium text-ink">{item.name}</span>
            <TagBadge tag={item.tag} />
            <DiscountBadge discount={item} currency={currency} />
            {!item.isAvailable && (
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-muted">Sold out</span>
            )}
          </div>
          {item.description && <p className="mt-1 truncate text-sm text-muted">{item.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <PriceSummary item={item} section={section} currency={currency} />
        <div className="flex shrink-0 items-center gap-1">
          <Switch checked={item.isAvailable} onCheckedChange={onToggle} label={`${item.name} available`} hideLabel />
          <Link
            href={routes.editItem(item.id)}
            className="ml-2 rounded-full px-3 py-1.5 text-sm text-slate hover:bg-slate-soft"
          >
            Edit<span className="sr-only"> {item.name}</span>
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-danger-soft hover:text-danger"
          >
            Delete<span className="sr-only"> {item.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
