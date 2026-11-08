# Slate — digital café menus

Cafés list their dishes, edit prices or add discounts, and get one QR code for their tables.
Customers scan it and see the live menu. No reprinting.

Data comes from the Express API in [`../backend`](../backend/README.md). Next.js forwards every
`/api/*` request to it, so the browser talks to one address and the session cookie is first-party.

## Run

Start the API first (see `../backend/README.md`), then:

```bash
npm install
npm run dev        # http://localhost:3000
```

| Env var | Default | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | `http://localhost:4000` | Where `/api/*` is forwarded (read when the server starts) |
| `NEXT_PUBLIC_SITE_URL` | current origin | Base URL printed into QR codes |

Demo login (development only): mobile `9876543210` / `demo1234`, or click "Use the demo account".
It exists after `npm run db:seed` in the backend. Sample public menu: `/m/cafe-bites`.

## Routes

| Route                         | Who      | What                                   |
| ----------------------------- | -------- | -------------------------------------- |
| `/`                           | public   | Landing page                           |
| `/register`, `/login`         | owners   | Create a café / sign in                |
| `/dashboard`                  | owners   | Sections + dishes: reorder, sold-out, edit, delete |
| `/dashboard/items/new`        | owners   | Add a dish (with live preview)         |
| `/dashboard/items/[id]/edit`  | owners   | Edit a dish                            |
| `/dashboard/qr`               | owners   | QR card: download PNG, print, copy URL |
| `/dashboard/settings`         | owners   | Logo, name, link, notices, social links |
| `/m/[slug]`                   | diners   | Public menu opened from the QR code    |

## Structure

```
src/
  app/                 Routes only. Thin pages that compose features.
    (auth)/            Login + register (redirects signed-in owners away)
    dashboard/         Owner area, guarded by <RequireAuth>, has its own error.tsx
    m/[slug]/          Public menu
    error.tsx, global-error.tsx, not-found.tsx
  components/
    ui/                Button, Input, Field, Switch, Toast, ConfirmDialog, …
    layout/            Site and dashboard headers
    brand/             Logo
  features/            UI + hooks grouped by domain
    auth/  menu/ (sections + dishes)  qr/  cafe/  public-menu/
  hooks/               Cross-feature hooks
  lib/
    schemas/           Zod schemas (single source of truth for types + validation)
    errors.ts          AppError (code + fieldErrors), helpers
    forms.ts           Maps service errors onto react-hook-form fields
    pricing.ts         Discount maths + currency formatting
    api.ts             fetch wrapper: /api/* → JSON, every failure → AppError
  services/            One file per API area (auth, cafe, sections, menu); pages only use these
```

## Menu model

- **Sections** (Hot Coffee, Pizza…) are ordered and can have up to 4 **sizes** (Reg / Large,
  Small / Med / Large…). Each size is a price column on the public menu. A section can also
  have a note ("Add any topping for ₹20").
- **Dishes** belong to a section, are ordered within it, and have a price per size. A blank
  size means "not sold in this size". One discount applies to all sizes. Optional highlight:
  Bestseller / New / Chef's special.
- Changing a section's sizes keeps prices attached: single price → first size, sizes → single
  price uses the first available size, and removing a size drops that price.

## Validation and errors

- The same Zod schemas validate the forms (via `zodResolver`) **and** the API's request bodies:
  the backend imports `src/lib/schemas` and `src/lib/errors.ts` directly. Change a rule once.
- Services only throw `AppError` (`VALIDATION`, `CONFLICT`, `NOT_FOUND`, `UNAUTHORIZED`,
  `RATE_LIMITED`, `NETWORK`, `UNKNOWN`), rebuilt from the API's error JSON. `handleFormError` puts
  `fieldErrors` onto the matching inputs and shows everything else as a form-level alert.
- Route-level `error.tsx` boundaries catch render errors; `global-error.tsx` covers the root layout.

## Connecting a backend later

Rewrite the bodies of `src/services/*.service.ts` to call your API and keep their signatures.
Then replace the client-side guard in `features/auth/require-auth.tsx` with cookie-based auth
checked in `proxy.ts`. The public menu can then render on the server for faster first load on
phones.
