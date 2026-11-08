/*
 * Decoration for the public menu. Both pieces are aria-hidden and ignore pointer events, so they
 * never get in the way of reading or tapping.
 */

/**
 * Faint line drawings (cups, beans, croissants, spoons) like the doodles on a printed café menu.
 * Drawn in `currentColor`; fills its positioned parent.
 */
export function DoodlePattern({ opacity = 0.1 }: { opacity?: number }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="cafe-doodles" width="220" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)">
          <g
            fill="none"
            stroke="currentColor"
            strokeOpacity={opacity}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cup on a saucer, with steam */}
            <g transform="translate(20 26)">
              <path d="M8 34h40v12a16 16 0 0 1-16 16h-8A16 16 0 0 1 8 46Z" />
              <path d="M48 38h5a7 7 0 0 1 0 14h-6" />
              <path d="M0 68h56" />
              <path d="M20 26c-4-5 4-9 0-15M32 26c-4-5 4-9 0-15" />
            </g>
            {/* Coffee beans */}
            <g transform="translate(150 36) rotate(25)">
              <ellipse rx="9" ry="13" />
              <path d="M0-12c-5 7 5 17 0 24" />
            </g>
            <g transform="translate(176 70) rotate(-30)">
              <ellipse rx="8" ry="12" />
              <path d="M0-11c-4 6 4 16 0 22" />
            </g>
            {/* Croissant */}
            <g transform="translate(118 146)">
              <path d="M0 22C6 6 24-2 44 2c18 4 30 16 34 28-10-6-20-8-30-6-12 2-22 0-30-6-6 0-12 2-18 4Z" />
              <path d="M22 4c2 8 0 14-4 18M40 2c2 10 0 18-4 22M58 8c0 10-2 16-6 20" />
            </g>
            {/* Spoon */}
            <g transform="translate(40 150) rotate(35)">
              <ellipse rx="7" ry="10" />
              <path d="M0 10v42" />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cafe-doodles)" />
    </svg>
  );
}

/** A very fine paper grain over the whole page (multiplied, so text and paper get it equally). */
export function PaperGrain() {
  return <div aria-hidden="true" className="paper-grain pointer-events-none fixed inset-0 z-30" />;
}
