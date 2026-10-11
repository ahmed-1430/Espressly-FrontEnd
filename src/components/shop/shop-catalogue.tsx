"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { products, productCategories, type ProductCategory } from "@/data/products";
import { FlipText } from "@/components/motion/text-motion";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/cn";

/**
 * Shop.
 *
 * Data-driven from `data/products.ts` and filtered by category. There is no
 * cart or payment here: each product card carries the affordance a future
 * ecommerce integration would hook into, and says so plainly rather than
 * simulating a checkout.
 */
export function ShopCatalogue() {
  const [active, setActive] = useState<ProductCategory | "all">("all");

  const visible = useMemo(
    () =>
      active === "all"
        ? products
        : products.filter((product) => product.category === active),
    [active],
  );

  const filters = [
    { id: "all" as const, label: "Everything" },
    ...productCategories,
  ];

  return (
    <div>
      {/*
        Section heading. Without it the catalogue's product names were <h3>s
        sitting directly under the hero's <h1>, skipping a level — and the
        "See the range" action in the hero landed on an unlabelled grid.
      */}
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] tracking-display">
            The range
          </h2>
          <p className="mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            Everything is roasted in the back room and dispatched within two
            working days. Ordering is by enquiry, so nothing here is sitting in a
            cart waiting to be forgotten.
          </p>
        </div>
      </div>

      {/* Category rail */}
      <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter products by category"
          className="mask-fade-x flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((filter) => {
            const selected = filter.id === active;
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(filter.id)}
                className={cn(
                  "relative shrink-0 whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-300",
                  selected
                    ? "text-accent-bright"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {filter.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 bottom-0.5 h-px origin-left bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)]",
                    selected ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </div>

        <p className="micro shrink-0 text-muted-foreground">
          {/* The count is a live value, so it flips rather than swapping — the
              digits changing on a board makes the filter's effect legible
              instead of leaving the reader to notice a quiet number change. */}
          <FlipText
            className="text-accent"
            value={String(visible.length).padStart(2, "0")}
            direction="down"
            duration={0.45}
          />
          {" products"}
        </p>
      </div>

      {/* Grid: asymmetric on desktop so the row has a lead item. */}
      <ul className="mt-14 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-12">
        {visible.map((product, index) => (
          <li
            key={product.id}
            className={cn(
              "group",
              // Every third product is a lead item spanning more of the grid.
              index % 5 === 0
                ? "lg:col-span-7"
                : index % 5 === 1
                  ? "lg:col-span-5"
                  : "lg:col-span-4",
            )}
          >
            <ProductCard product={product} lead={index % 5 === 0} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductCard({
  product,
  lead,
}: {
  product: (typeof products)[number];
  lead?: boolean;
}) {
  return (
    <article className="flex h-full flex-col">
      <div
        className={cn(
          "relative overflow-hidden bg-background-raised",
          lead ? "aspect-4/3" : "aspect-4/5",
        )}
      >
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          loading={lead ? "eager" : "lazy"}
          sizes={
            lead
              ? "(max-width: 1024px) 100vw, 56vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 32vw"
          }
          className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.limited ? (
            <span className="micro border border-accent/40 bg-background/70 px-3 py-1.5 text-accent-bright backdrop-blur-sm">
              Limited
            </span>
          ) : null}
          {product.roast ? (
            <span className="micro border border-border bg-background/70 px-3 py-1.5 text-foreground-soft backdrop-blur-sm">
              {product.roast} roast
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-baseline justify-between gap-5">
          <h3
            className={cn(
              "font-display leading-none tracking-display transition-colors duration-400 group-hover:text-accent-bright",
              lead ? "text-[clamp(1.75rem,3.4vw,2.75rem)]" : "text-[clamp(1.375rem,2.4vw,1.875rem)]",
            )}
          >
            {product.name}
          </h3>
          <span className="shrink-0 text-base tabular-nums text-foreground-soft">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="micro mt-3 text-muted-foreground">{product.subtitle}</p>

        <p
          className={cn(
            "mt-4 text-pretty leading-relaxed text-muted-foreground",
            lead ? "max-w-lg" : "max-w-sm",
          )}
        >
          {product.description}
        </p>

        {lead ? (
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {product.details.map((detail) => (
              <li key={detail} className="micro text-accent/80">
                {detail}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-7">
          {/* No checkout is implemented; this states that rather than pretending. */}
          <ButtonLink href="/contact" variant="outline" size="sm" arrow>
            Enquire
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}