import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { DietaryMark } from "@/features/menu/components/dietary-mark";
import { DEMO_ACCOUNT, routes, siteConfig } from "@/lib/config";

const steps = [
  {
    title: "Register your café",
    body: "Pick a name and a menu link. It takes under a minute.",
  },
  {
    title: "Add your dishes",
    body: "Name, price, category, veg or non-veg. Add a discount whenever you like.",
  },
  {
    title: "Put the QR on your tables",
    body: "Print it once. The code never changes, even when your prices do.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-4 pt-10 pb-20 sm:px-6 md:grid-cols-[1.5fr_1fr] md:pt-20 md:pb-28">
          <div>
            <h1 className="font-display text-[2.6rem] leading-[1.05] tracking-tight text-ink sm:text-[3.25rem] lg:text-[3.6rem]">
              Change a price.
              <br />
              <span className="text-slate">Not the whole menu.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              {siteConfig.name} puts your café menu behind a QR code on every table. Edit dishes,
              prices and discounts from your phone, and customers see the change as soon as you
              save.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={routes.register}>Register your café</ButtonLink>
              <ButtonLink href={routes.publicMenu(DEMO_ACCOUNT.slug)} variant="secondary">
                See a sample menu
              </ButtonLink>
            </div>
          </div>

          <HeroMenuCard />
        </section>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="font-display text-3xl text-ink">How it works</h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title} className="border-t border-ink pt-5">
                  <span className="font-mono text-sm text-muted">Step {index + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-sm text-muted sm:px-6">
        {siteConfig.name} · Menus for local cafés
      </footer>
    </>
  );
}

/** Shows the core idea: an old price is crossed out and rewritten in place. */
function HeroMenuCard() {
  const rows = [
    { name: "Cappuccino", price: "₹160" },
    { name: "Filter kaapi", price: "₹90" },
  ];

  return (
    <figure
      aria-label="Example menu where the cold brew price drops from ₹220 to ₹187"
      className="mx-auto w-full max-w-sm rounded-[1.75rem] border border-line bg-surface p-7 shadow-[0_30px_60px_-30px_rgba(24,32,28,0.25)]"
    >
      <p className="font-display text-2xl text-ink">Brew &amp; Bloom</p>
      <p className="mt-1 text-sm text-muted">Coffee, bakes and slow mornings</p>

      <p className="mt-7 font-mono text-xs tracking-[0.18em] text-muted uppercase">Coffee</p>
      <ul className="mt-3 space-y-4" aria-hidden="true">
        <MenuLine name="Cappuccino" price={rows[0].price} />
        <li>
          <div className="flex items-baseline">
            <DietaryMark dietary="veg" />
            <span className="ml-2 text-ink">Cold brew</span>
            <span className="leader" />
            <span className="relative font-mono text-sm text-muted">
              ₹220
              <span className="strike-line absolute inset-x-[-2px] top-1/2 h-[1.5px] bg-danger/80" />
            </span>
            <span className="rewrite-in ml-2 font-mono font-medium text-ink">₹187</span>
          </div>
          <span className="rewrite-in mt-1.5 ml-5.5 inline-block rounded-full bg-chalk px-2 py-0.5 font-mono text-[0.7rem] font-medium tracking-wide text-chalk-ink uppercase">
            15% off today
          </span>
        </li>
        <MenuLine name="Filter kaapi" price={rows[1].price} />
      </ul>
    </figure>
  );
}

function MenuLine({ name, price }: { name: string; price: string }) {
  return (
    <li className="flex items-baseline">
      <DietaryMark dietary="veg" />
      <span className="ml-2 text-ink">{name}</span>
      <span className="leader" />
      <span className="font-mono font-medium text-ink">{price}</span>
    </li>
  );
}
