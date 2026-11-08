"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import { DietaryMark } from "@/features/menu/components/dietary-mark";
import { DiscountBadge, PriceTag, TagBadge } from "@/features/menu/components/price-tag";
import { getSizePrices, groupBySection, sectionAnchor } from "@/features/menu/utils";
import { SectionIcon } from "@/features/menu/components/section-icon";
import { DoodlePattern } from "./menu-backdrop";
import { SectionNav } from "./section-nav";
import { routes, siteConfig } from "@/lib/config";
import { getErrorMessage, isAppError } from "@/lib/errors";
import { hasDiscount } from "@/lib/pricing";
import type { Cafe, Currency, Section } from "@/lib/schemas/cafe";
import type { MenuItem } from "@/lib/schemas/menu-item";
import { cn } from "@/lib/utils";
import { menuService, type PublicMenu as PublicMenuData } from "@/services/menu.service";

type State =
  | { status: "loading" }
  | { status: "ready"; menu: PublicMenuData }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function PublicMenu({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    menuService
      .getPublicMenu(slug)
      .then((menu) => active && setState({ status: "ready", menu }))
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
  }, [slug, attempt]);

  if (state.status === "loading") return <PageLoader label="Opening menu" />;

  if (state.status === "not-found") {
    return (
      <MenuMessage
        title="Menu not found"
        body="This QR code doesn't point to an active menu. Ask the staff for a printed menu."
      />
    );
  }

  if (state.status === "error") {
    return (
      <MenuMessage
        title="The menu didn't load"
        body={state.message}
        action={
          <Button
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </Button>
        }
      />
    );
  }

  return <MenuView menu={state.menu} />;
}

function MenuView({ menu }: { menu: PublicMenuData }) {
  const { cafe, items } = menu;
  const groups = useMemo(
    () => groupBySection(items, cafe.sections).filter((g) => g.items.length > 0),
    [items, cafe.sections],
  );
  const navSections = useMemo(() => groups.map(({ section: s }) => ({ id: s.id, name: s.name })), [groups]);
  const usedDietary = new Set(items.map((i) => i.dietary).filter((d) => d !== "unspecified"));

  return (
    <>
      <MenuHeader cafe={cafe} />

      <div className="mx-auto w-full max-w-xl px-5 pb-12">
        {cafe.notices.length > 0 && (
          <ul className="mt-6 space-y-1.5 rounded-2xl border border-roast/10 bg-latte/45 px-5 py-4 text-sm text-ink">
            {cafe.notices.map((notice) => (
              <li key={notice} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-roast/60" />
                {notice}
              </li>
            ))}
          </ul>
        )}

        {groups.length === 0 ? (
          <p className="py-16 text-center text-muted">The menu is being written. Check back soon.</p>
        ) : (
          <>
            {/* Spacer rather than a wrapper: the sticky bar must stay a direct child of this column. */}
            <div aria-hidden="true" className="h-6" />
            {groups.length > 1 && <SectionNav sections={navSections} />}

            {groups.map(({ section, items: sectionItems }) => (
              <MenuSection key={section.id} section={section} items={sectionItems} currency={cafe.currency} />
            ))}
          </>
        )}

        <footer className="mt-16 border-t border-roast/15 pt-6 text-center text-xs text-muted">
          {usedDietary.size > 0 && (
            <p className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
              {usedDietary.has("veg") && <Legend dietary="veg" label="Veg" />}
              {usedDietary.has("egg") && <Legend dietary="egg" label="Egg" />}
              {usedDietary.has("non-veg") && <Legend dietary="non-veg" label="Non-veg" />}
            </p>
          )}
          <p>
            Menu by{" "}
            <Link href={routes.home} className="underline-offset-4 hover:underline">
              {siteConfig.name}
            </Link>
          </p>
        </footer>
      </div>
    </>
  );
}

function MenuHeader({ cafe }: { cafe: Cafe }) {
  const links = [
    { label: "Instagram", href: cafe.instagram },
    { label: "Facebook", href: cafe.facebook },
    { label: "Zomato", href: cafe.zomato },
    { label: "Swiggy", href: cafe.swiggy },
  ].filter((l) => l.href);

  return (
    <header>
      {/* Chalkboard signboard with the café's name */}
      <div className="relative overflow-hidden bg-slate text-menu-paper">
        <DoodlePattern opacity={0.07} />
        <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 pt-12 pb-9 text-center">
          {cafe.logo && (
            <Image
              src={cafe.logo}
              alt=""
              width={72}
              height={72}
              unoptimized
              className="mb-4 size-18 rounded-2xl bg-menu-paper object-contain p-1"
            />
          )}
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{cafe.name}</h1>
          {cafe.tagline && <p className="mt-2 text-menu-paper/75">{cafe.tagline}</p>}
          <MenuDivider />
          {(cafe.address || cafe.phone) && (
            <p className="text-sm text-menu-paper/75">
              {cafe.address}
              {cafe.address && cafe.phone && <span aria-hidden="true"> · </span>}
              {cafe.phone && (
                <a href={`tel:${cafe.phone.replace(/[\s-]/g, "")}`} className="underline-offset-4 hover:underline">
                  {cafe.phone}
                </a>
              )}
            </p>
          )}
          {links.length > 0 && (
            <p className="mt-4 flex flex-wrap justify-center gap-1.5">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-menu-paper/30 px-3 py-1 text-xs text-menu-paper/85 hover:border-menu-paper/70 hover:text-menu-paper"
                >
                  {link.label}
                </a>
              ))}
            </p>
          )}
        </div>
      </div>
      {/* Scalloped edge, like a café awning */}
      <div aria-hidden="true" className="awning-edge h-3" />
    </header>
  );
}

/** Price columns share one width so sizes line up down the section, like a printed menu. */
const COLUMN = "3.6rem";

function MenuSection({ section, items, currency }: { section: Section; items: MenuItem[]; currency: Currency }) {
  const sized = section.sizes.length > 0;
  const grid: CSSProperties | undefined = sized
    ? { gridTemplateColumns: `minmax(0,1fr) repeat(${section.sizes.length}, ${COLUMN})` }
    : undefined;

  return (
    <section id={sectionAnchor(section)} className="scroll-mt-16 pt-10">
      <div className="flex items-center gap-4">
        <h2 className="flex items-center gap-2.5 font-display text-2xl text-ink">
          <SectionIcon icon={section.icon} className="size-7 text-roast/75" />
          {section.name}
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-roast/15" />
      </div>
      {sized && (
        <div className="mt-3 grid gap-x-1.5" style={grid} aria-hidden="true">
          <span />
          {section.sizes.map((size) => (
            <span key={size.id} className="text-right font-mono text-[0.7rem] tracking-wide text-muted uppercase">
              {size.label}
            </span>
          ))}
        </div>
      )}

      <ul className={cn("space-y-6", sized ? "mt-3" : "mt-5")}>
        {items.map((item) => (
          <MenuEntry key={item.id} item={item} section={section} currency={currency} grid={grid} />
        ))}
      </ul>

      {section.note && <p className="mt-6 text-sm text-muted italic">{section.note}</p>}
    </section>
  );
}

function MenuEntry({
  item,
  section,
  currency,
  grid,
}: {
  item: MenuItem;
  section: Section;
  currency: Currency;
  grid: CSSProperties | undefined;
}) {
  const sized = Boolean(grid);
  const prices = getSizePrices(item, section);
  const showDiscount = item.isAvailable && hasDiscount(item);
  const hasBadges = item.tag !== "none" || showDiscount;

  const mark = item.dietary !== "unspecified" && (
    <span className="mt-[0.3em] mr-2 shrink-0 self-start">
      <DietaryMark dietary={item.dietary} />
    </span>
  );

  // Narrow price columns make long names wrap, so the sized layout uses the background
  // leader (dots follow the last line); the single-price layout keeps the flex leader.
  const name = sized ? (
    <div className="flex min-w-0">
      {mark}
      <h3 className="leader-fill min-w-0 flex-1 text-[1.05rem] leading-snug font-medium text-ink">
        <span className="leader-text">{item.name}</span>
      </h3>
    </div>
  ) : (
    <div className="flex min-w-0 flex-1 items-baseline">
      {mark}
      <h3 className="min-w-0 text-[1.05rem] font-medium text-ink">{item.name}</h3>
      <span className="leader" />
    </div>
  );

  return (
    <li className={cn(!item.isAvailable && "opacity-50")}>
      {sized ? (
        <div className="grid items-end gap-x-1.5" style={grid}>
          {name}
          {item.isAvailable ? (
            prices.map((p) => (
              <span key={p.sizeId} className="text-right">
                {p.amount !== undefined ? (
                  <>
                    <span className="sr-only">{p.label}: </span>
                    <PriceTag amount={p.amount} discount={item} currency={currency} stacked />
                  </>
                ) : (
                  <span className="font-mono text-muted" aria-label={`Not available in ${p.label}`}>
                    –
                  </span>
                )}
              </span>
            ))
          ) : (
            <span className="text-right font-mono text-sm text-muted" style={{ gridColumn: `span ${prices.length}` }}>
              Sold out
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-baseline">
          {name}
          {!item.isAvailable ? (
            <span className="font-mono text-sm text-muted">Sold out</span>
          ) : prices[0].amount !== undefined ? (
            <PriceTag amount={prices[0].amount} discount={item} currency={currency} />
          ) : null}
        </div>
      )}

      {item.description && <p className="mt-1 pr-4 text-sm leading-relaxed text-muted">{item.description}</p>}
      {hasBadges && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <TagBadge tag={item.tag} />
          {showDiscount && <DiscountBadge discount={item} currency={currency} />}
        </div>
      )}
    </li>
  );
}

function Legend({ dietary, label }: { dietary: "veg" | "egg" | "non-veg"; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <DietaryMark dietary={dietary} />
      {label}
    </span>
  );
}

/** Thin rule with a coffee bean, between the café's name and its details. */
function MenuDivider() {
  return (
    <div aria-hidden="true" className="my-5 flex items-center gap-3 text-menu-paper/40">
      <span className="h-px w-12 bg-current" />
      <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.4">
        <ellipse cx="10" cy="10" rx="5.5" ry="8" transform="rotate(30 10 10)" />
        <path d="M13.5 3.5c-4 3-1 9-7 13" strokeLinecap="round" />
      </svg>
      <span className="h-px w-12 bg-current" />
    </div>
  );
}

function MenuMessage({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-ink">{title}</h1>
      <p className="mt-3 text-muted">{body}</p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
