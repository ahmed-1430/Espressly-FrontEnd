"use client";

import { useRef } from "react";
import { HeroMedia, HeroScrollCue } from "./hero-atoms";
import { HeroEntrance } from "./hero-motion";
import { SplitLines } from "@/components/motion/split-lines";
import { cn } from "@/lib/cn";

/**
 * MENU hero — product, not photograph.
 *
 * This was the most templated of the six: `min-h-[92svh]`, a full-bleed bar
 * photograph behind two gradient scrims, and a 15rem title. On the one page whose
 * subject is forty-six products, that spent an entire viewport on atmosphere and
 * pushed the first price below the fold.
 *
 * Now: a compact masthead with the featured drinks as real images in the layout
 * rather than as a backdrop, and the category rail immediately below so the first
 * viewport already offers a way into the menu. Nothing here is centred.
 */
export function MenuHero() {
  const rootRef = useRef<HTMLElement>(null);

  // Two drinks, not three. Three drinks in the five-column right band rendered
  // at roughly 100px wide each — too small to read as photography, which the
  // collapsed-media gate correctly flagged. Two fill the band and can carry it.
  const featured = [
    { src: "/images/menu-flat-white.jpg", alt: "A flat white with a rosetta poured into the milk." },
    { src: "/images/menu-espresso.jpg", alt: "A short espresso in a clear cup, crema settled on top." },
  ];

  return (
    <section
      ref={rootRef}
      aria-labelledby="menu-hero-title"
      className="relative border-b border-border pt-16 lg:pt-[76px]"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 pb-10 pt-10 sm:px-8 sm:pb-14 lg:px-12">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Queen St W</span>
            </div>

            <h1
              id="menu-hero-title"
              className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.88] tracking-display"
            >
              <SplitLines lines={["The", "menu"]} duration={1.05} />
            </h1>

            <p
              data-hero-stage="copy"
              className="mt-7 max-w-md text-pretty leading-relaxed text-foreground-soft"
            >
              Espresso and filter, milk and pastry, and a short seasonal list that
              changes when the beans do.
            </p>
          </div>

          {/*
            Two drinks as a stepped pair: the second is narrower and lower, so the
            eye travels down and across rather than reading a level strip.
          */}
          <div className="lg:col-span-5">
            <ul className="flex items-end gap-4 sm:gap-5">
              {featured.map((drink, index) => (
                <li
                  key={drink.src}
                  className={cn(
                    "relative aspect-3/4 overflow-hidden bg-background-raised",
                    index === 0 && "w-[58%]",
                    index === 1 && "w-[42%] lg:mb-10",
                  )}
                >
                  <HeroMedia
                    src={drink.src}
                    alt={drink.alt}
                    fill
                    priority={index === 0}
                    parallax={0}
                    delay={0.08 * index}
                    sizes="(max-width: 640px) 52vw, (max-width: 1024px) 30vw, 17vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6 border-t border-border pt-6">
          <a href="#categories" className="shrink-0">
            <HeroScrollCue label="Browse the list" />
          </a>
          <p className="micro text-muted-foreground">Prices include VAT</p>
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{ stages: ["copy", "meta"], stagger: 0.12, duration: 1.1 }}
      />
    </section>
  );
}