"use client";

import { useRef } from "react";
import Image from "next/image";
import { HeroEyebrow, HeroMeta } from "./hero-atoms";
import { HeroEntrance, HeroExit } from "./hero-motion";
import { ButtonLink } from "@/components/ui/button";
import { featuredProducts, products } from "@/data/products";
import { cn } from "@/lib/cn";

/**
 * SHOP hero — "the atelier".
 *
 * Not a photograph beside a title. The type sits on a parchment ground like a
 * workshop label, and two product frames are stacked to the right and deliberately
 * offset from one another, so the page opens as a display case rather than a
 * masthead. Product names and prices are set as catalogue entries directly in
 * the hero.
 *
 * The only parchment-toned hero on the site, which is what makes the shop feel
 * like a different room in the same building.
 */
export function ShopHero() {
  const rootRef = useRef<HTMLElement>(null);

  // Curated in the data module rather than taken from the head of the array, so
  // reordering the catalogue cannot silently change which products the hero
  // shows.
  const featured = featuredProducts
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));

  return (
    <section
      ref={rootRef}
      aria-labelledby="shop-hero-title"
      className="noise relative overflow-hidden border-b border-border-dark bg-surface-parchment text-ink-espresso"
    >
      <div
        aria-hidden
        className="grid-lines-dark pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative mx-auto w-full max-w-[110rem] px-5 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pt-36">
        <div className="grid items-end gap-12 pb-12 lg:grid-cols-12 lg:gap-12 lg:pb-14">
          <div className="lg:col-span-7">
            <HeroEyebrow tone="parchment" data-hero-stage="eyebrow" className="mb-8">
              Beans &amp; Goods
            </HeroEyebrow>

            <h1
              id="shop-hero-title"
              className="font-display text-[clamp(3.5rem,13vw,11rem)] leading-[0.84] tracking-display"
            >
              <span className="block overflow-hidden">
                <span data-hero-stage="title" className="block">
                  Shop
                </span>
              </span>
            </h1>

            <div
              data-hero-stage="rule"
              aria-hidden
              className="mt-9 h-px w-full max-w-sm bg-linear-to-r from-accent-deep to-transparent"
            />

            <p
              data-hero-stage="copy"
              className="mt-8 max-w-lg text-pretty text-[clamp(1rem,1.35vw,1.1875rem)] leading-relaxed text-ink-espresso-soft"
            >
              The same coffee we serve, roasted in the back room twice a week,
              alongside the equipment and objects we actually use ourselves.
            </p>

            <div data-hero-stage="actions" className="mt-10">
              <ButtonLink href="#catalogue" variant="quiet" arrow>
                See the range
              </ButtonLink>
            </div>
          </div>

          {/* Offset product frames — a display case, not a banner. */}
          <div className="relative lg:col-span-5">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {featured.map((product, index) => (
                <figure
                  key={product.id}
                  data-hero-stage={index === 0 ? "title" : "copy"}
                  className={cn(
                    "group",
                    index === 1 && "mt-10 sm:mt-14",
                  )}
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-coffee-mocha">
                    <Image
                      src={product.image}
                      alt={product.imageAlt}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 46vw, 22vw"
                      className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-ink-espresso/45 to-transparent"
                    />
                  </div>
                  <figcaption className="mt-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm">{product.name}</span>
                      <span className="text-sm tabular-nums text-ink-espresso-soft">
                        {product.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="micro mt-1.5 text-ink-espresso-soft">
                      {product.subtitle}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* Sits in the negative space the offset creates. */}
            <span
              aria-hidden
              data-hero-stage="meta"
              className="micro absolute -left-2 top-1/2 hidden -translate-y-1/2 -rotate-90 text-ink-espresso-soft/70 lg:block"
            >
              Roasted Tue &amp; Fri — dispatched in 2 days
            </span>
          </div>
        </div>

        <HeroMeta
          tone="parchment"
          items={[
            { label: "Products", value: String(products.length).padStart(2, "0") },
            { label: "Roasted", value: "Tue & Fri" },
            { label: "Dispatch", value: "2 working days" },
            { label: "Shipping", value: "Free over $60" },
          ]}
        />
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{
          stages: ["eyebrow", "title", "rule", "copy", "actions", "meta"],
          stagger: 0.1,
          duration: 1.05,
        }}
      />
      <HeroExit
        rootRef={rootRef}
        targets={[
          { selector: '[data-hero-stage="title"]', yPercent: -14, opacity: 0.3 },
        ]}
      />
    </section>
  );
}