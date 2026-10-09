"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/cn";
import { cn } from "@/lib/cn";

export type FeaturedDrink = {
  readonly id: string;
  readonly name: string;
  readonly note: string;
  readonly detail: string;
  readonly price: number;
  readonly image: string;
};

const drinks: readonly FeaturedDrink[] = [
  {
    id: "espresso",
    name: "Espresso",
    note: "Dark roast, cocoa and dried fig",
    detail: "Brazil · Ethiopia",
    price: 4.25,
    image: "/images/bar-espresso.jpg",
  },
  {
    id: "flat-white",
    name: "Flat White",
    note: "Ristretto under thin microfoam",
    detail: "House standard",
    price: 5.5,
    image: "/images/bar-flatwhite.jpg",
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    note: "Eighteen hours, no heat",
    detail: "Served over one clear block",
    price: 5.75,
    image: "/images/cold-brew.jpg",
  },
  {
    id: "brown-butter",
    name: "Brown Butter Latte",
    note: "Toasted, salted, not too sweet",
    detail: "House signature",
    price: 6.75,
    image: "/images/bar-macchiato.jpg",
  },
];

/**
 * Featured coffee.
 *
 * An asymmetric editorial row: a tall portrait frame on the left, and four drink
 * entries on the right that alternate image/text emphasis. Hovering an entry
 * swaps the large image, which gives the section a reason to exist beyond a grid
 * of cards.
 */
export function FeaturedCoffee() {
  const [active, setActive] = useState(0);
  const current = drinks[active];

  return (
    <section
      id="featured"
      aria-labelledby="featured-title"
      className="relative overflow-hidden bg-background py-24 sm:py-28 lg:py-36"
    >
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-[0.35]"
      />

      <div className="relative mx-auto w-full max-w-[110rem] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">On the bar</span>
            </div>
            <h2 id="featured-title" className="mt-6 text-[clamp(2rem,5vw,4rem)] tracking-display">
              Four coffees,
              <br />
              done properly
            </h2>
          </div>

          <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground lg:text-right">
            The menu is longer than this. These four are what we are known for, and
            the ones we would pick if you asked us to choose.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* Large frame, crossfades between drinks on hover */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/5 w-full overflow-hidden bg-background-sunken lg:sticky lg:top-32">
              {drinks.map((drink, index) => (
                <Image
                  key={drink.id}
                  src={drink.image}
                  // Decorative: the drink's name and detail are rendered as text
                  // directly beneath this frame, and the same names are listed in
                  // the entries beside it. An alt here would announce the same
                  // three names twice.
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className={cn(
                    "object-cover transition-opacity duration-700 ease-[var(--ease-out-expo)]",
                    index === active ? "opacity-100" : "opacity-0",
                  )}
                  aria-hidden="true"
                />
              ))}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background-sunken/70 via-transparent to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="micro text-accent-bright">{current.detail}</p>
                <p className="mt-2 font-display text-3xl tracking-display sm:text-4xl">
                  {current.name}
                </p>
              </div>
            </div>
          </div>

          {/* Entries */}
          <div className="lg:col-span-7">
            <ul className="flex flex-col">
              {drinks.map((drink, index) => {
                const isActive = index === active;
                return (
                  <li key={drink.id}>
                    <Link
                      href="/menu"
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      aria-current={undefined}
                      className="group block border-b border-border py-7 first:border-t sm:py-9"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-baseline gap-5 sm:gap-8">
                          <span
                            className={cn(
                              "micro shrink-0 transition-colors duration-500",
                              isActive ? "text-accent" : "text-muted-foreground/60",
                            )}
                          >
                            0{index + 1}
                          </span>
                          <div>
                            <h3
                              className={cn(
                                "font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none tracking-display transition-colors duration-500",
                                isActive
                                  ? "text-accent-bright"
                                  : "text-foreground group-hover:text-accent-bright",
                              )}
                            >
                              {drink.name}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {drink.note}
                            </p>
                          </div>
                        </div>

                        <span className="flex shrink-0 items-center gap-4 pt-1">
                          <span className="text-sm tabular-nums text-foreground-soft">
                            {formatPrice(drink.price)}
                          </span>
                          <svg
                            aria-hidden
                            viewBox="0 0 24 12"
                            fill="none"
                            className={cn(
                              "h-2.5 w-6 transition-all duration-500 ease-[var(--ease-out-expo)]",
                              isActive
                                ? "translate-x-0 text-accent opacity-100"
                                : "-translate-x-2 text-muted-foreground opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                            )}
                          >
                            <path
                              d="M0 6h21m0 0-5-5m5 5-5 5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        </span>
                      </div>

                      {/* Price rule that draws in on hover */}
                      <span
                        aria-hidden
                        className="mt-5 block h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10">
              <Link
                href="/menu"
                className="group inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:text-accent-bright"
              >
                <span className="relative">
                  Full menu
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:origin-left group-hover:scale-x-100"
                  />
                </span>
                <svg
                  aria-hidden
                  viewBox="0 0 24 12"
                  fill="none"
                  className="h-3 w-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
                >
                  <path
                    d="M0 6h21m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}