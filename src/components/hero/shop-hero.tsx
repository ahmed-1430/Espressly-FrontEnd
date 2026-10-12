"use client";

import { useRef } from "react";
import { HeroMedia, HeroScrollCue } from "./hero-atoms";
import { HeroEntrance } from "./hero-motion";
import { SplitLines } from "@/components/motion/split-lines";
import { featuredProducts, products, type Product } from "@/data/products";
import { formatPrice } from "@/lib/cn";
import { cn } from "@/lib/cn";

/**
 * SHOP hero — a catalogue opening, not a poster.
 *
 * Was a full-bleed product photograph with a grid overlay and an 11rem title. The
 * page sells four things; the hero spent a full viewport on one of them and gave
 * no price, no name and no way to judge scale.
 *
 * Now the featured products are the composition: three packs at actual relative
 * size, named and priced, with the copy held in a narrow column beside them. The
 * reader can decide what to buy before scrolling.
 */
export function ShopHero() {
  const rootRef = useRef<HTMLElement>(null);
  // `featuredProducts` is an ordered id list, not objects, so it is resolved
  // against `products` here. Slicing first and resolving after keeps the data
  // module the single place that decides which products are featured.
  const packs = featuredProducts
    .slice(0, 3)
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  return (
    <section
      ref={rootRef}
      aria-labelledby="shop-hero-title"
      className="relative border-b border-border pt-16 lg:pt-[76px]"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Roasted weekly</span>
            </div>

            <h1
              id="shop-hero-title"
              className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.88] tracking-display"
            >
              <SplitLines lines={["The", "shop"]} duration={1.05} />
            </h1>

            <p
              data-hero-stage="copy"
              className="mt-7 max-w-sm text-pretty leading-relaxed text-foreground-soft"
            >
              Whole bean, ground to order, and the blends we actually keep on the
              bar. Posted on Wednesday, gone by Sunday.
            </p>

            <div className="mt-9 flex items-center gap-6">
              <a href="#catalogue">
                <HeroScrollCue label="See everything" />
              </a>
              <p className="micro text-muted-foreground">Free over $45</p>
            </div>
          </div>

          {/*
            Deliberately a catalogue row, not a hero image: three packs at their
            real relative widths, each labelled. The first is offset downward so
            the row is not a level shelf.
          */}
          <div className="lg:col-span-7">
            <ul className="flex items-end gap-4 sm:gap-6">
              {packs.map((product, index) => (
                <li
                  key={product.id}
                  className={cn(
                    "flex-1",
                    // Three packs, each with a name and a price, overflow the
                    // measure below 640px. The third is dropped at those widths
                    // rather than letting the row set the page's scroll width.
                    index === 2 && "hidden sm:block",
                    index === 0 && "lg:mb-10",
                    index === 2 && "lg:-mb-6",
                  )}
                >
                  <a
                    href="#catalogue"
                    className="group block"
                    aria-label={`${product.name}, ${formatPrice(product.price)}`}
                  >
                    <div className="relative aspect-4/5 overflow-hidden bg-background-raised">
                      <HeroMedia
                        src={product.image}
                        alt={product.imageAlt}
                        fill
                        priority={index === 0}
                        parallax={0}
                        delay={0.07 * index}
                        sizes="(max-width: 640px) 30vw, 18vw"
                        imageClassName="transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="mt-3 flex items-baseline justify-between gap-2">
                      <span className="min-w-0 text-sm leading-snug text-foreground">
                        {product.name}
                      </span>
                      <span className="micro shrink-0 text-accent">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{ stages: ["copy"], stagger: 0.12, duration: 1.1 }}
      />
    </section>
  );
}