"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { sectionAnchor } from "@/features/menu/utils";
import { cn } from "@/lib/utils";

type NavSection = { id: string; name: string };

const GAP_BELOW_NAV = 12;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Sticky section tabs for the public menu:
 * - the tab of the section you're reading is highlighted (and scrolled into view in the tab row)
 * - tapping a tab scrolls just below the bar and briefly highlights that section's heading
 */
export function SectionNav({ sections }: { sections: NavSection[] }) {
  const navRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState(sections[0]?.id);
  // While a tapped tab scrolls the page, hold the highlight on it instead of
  // flicking through every section passed on the way.
  const jumpingRef = useRef(false);

  // Scroll-spy: the active section is the last one whose top has passed under the bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (jumpingRef.current) return;
      const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 0;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(sectionAnchor(s));
        if (el && el.getBoundingClientRect().top <= navBottom + GAP_BELOW_NAV + 1) current = s.id;
      }
      // Short last sections can never reach the top; at the very bottom, they're the one you're on.
      if (atBottom) current = sections[sections.length - 1]?.id;
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // Keep the active tab visible in the horizontally scrolling row.
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector<HTMLElement>(`[data-section="${activeId}"]`);
    if (!nav || !tab) return;
    const left = tab.offsetLeft - nav.clientWidth / 2 + tab.offsetWidth / 2;
    nav.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [activeId]);

  const goTo = useCallback((event: MouseEvent<HTMLAnchorElement>, section: NavSection) => {
    const target = document.getElementById(sectionAnchor(section));
    if (!target) return; // let the browser follow the #link
    event.preventDefault();

    // Line the heading itself (not the section's top padding) up just under the bar.
    const heading = target.querySelector("h2");
    const navHeight = navRef.current?.offsetHeight ?? 0;
    const top = (heading ?? target).getBoundingClientRect().top + window.scrollY - navHeight - GAP_BELOW_NAV;
    jumpingRef.current = true;
    const release = () => {
      jumpingRef.current = false;
      window.removeEventListener("scrollend", release);
    };
    window.addEventListener("scrollend", release);
    setTimeout(release, 1000); // browsers without `scrollend`, or when there was nothing to scroll

    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    history.replaceState(null, "", `#${sectionAnchor(section)}`);
    setActiveId(section.id);

    // Restart the "you are here" highlight on the heading, even on repeated taps.
    if (heading) {
      clearTimeout(Number(heading.dataset.arriveTimer));
      heading.classList.remove("section-arrive");
      void heading.offsetWidth; // force reflow so the animation replays
      heading.classList.add("section-arrive");
      // A timer rather than `animationend`: with reduced motion there is no animation to end.
      heading.dataset.arriveTimer = String(window.setTimeout(() => heading.classList.remove("section-arrive"), 1600));
    }
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Menu sections"
      className="sticky top-0 z-10 -mx-5 flex gap-1.5 overflow-x-auto border-y border-roast/10 bg-paper/95 px-5 py-2.5 backdrop-blur scrollbar-none"
    >
      {sections.map((section) => {
        const active = section.id === activeId;
        return (
          <a
            key={section.id}
            data-section={section.id}
            href={`#${sectionAnchor(section)}`}
            onClick={(e) => goTo(e, section)}
            aria-current={active ? "location" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200 motion-reduce:transition-none",
              active ? "bg-slate font-medium text-white" : "text-muted hover:bg-slate-soft hover:text-ink",
            )}
          >
            {section.name}
          </a>
        );
      })}
    </nav>
  );
}
