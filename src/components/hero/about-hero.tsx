"use client";

import { useRef } from "react";
import { HeroEyebrow, HeroMedia, HeroMeta } from "./hero-atoms";
import { HeroEntrance, HeroExit } from "./hero-motion";
import { siteConfig } from "@/config/site";

/**
 * ABOUT hero — "the band".
 *
 * A wide photographic band with the founding statement set against it and the
 * page title running alongside rather than above. The reading order is
 * title → statement → band, which is the order the story actually happens in,
 * and it avoids the same left-text/right-image arrangement the other heroes use.
 */
export function AboutHero() {
  const rootRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={rootRef}
      aria-labelledby="about-hero-title"
      className="relative border-b border-border bg-background pt-28 lg:pt-36"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-8 lg:px-12">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 lg:pt-4">
            <HeroEyebrow data-hero-stage="eyebrow">
              Since {siteConfig.founded}
            </HeroEyebrow>

            <h1
              id="about-hero-title"
              className="mt-7 font-display text-[clamp(3rem,10vw,8rem)] leading-[0.86] tracking-display"
            >
              <span className="block overflow-hidden">
                <span data-hero-stage="title" className="block">
                  About
                </span>
              </span>
              <span
                data-hero-stage="title"
                className="block pl-[0.08em] text-accent-bright italic"
              >
                Us
              </span>
            </h1>
          </div>

          {/*
            The statement is the hero. It is the only text on the page that is set
            at reading size before any scroll, because the point of this page is
            the argument, not the heading.
          */}
          <div className="lg:col-span-7 lg:col-start-6">
            <p
              data-hero-stage="copy"
              className="max-w-2xl font-display text-[clamp(1.5rem,2.9vw,2.5rem)] leading-[1.18] tracking-display text-foreground"
            >
              We are a small coffee house on Queen Street that never quite finished
              opening. Three years later it is still the same idea:{" "}
              <span className="text-accent-bright italic">
                one blend, roasted on site, in a room built for staying.
              </span>
            </p>

            <p
              data-hero-stage="actions"
              className="mt-8 max-w-xl text-pretty leading-relaxed text-muted-foreground"
            >
              It began with a second-hand lever machine, a sheet of card for a sign,
              and a stubborn refusal to serve coffee we would not drink ourselves.
              That has stayed the whole idea.
            </p>
          </div>
        </div>
      </div>

      {/* Wide band, deliberately wider than the text block above it. */}
      <div className="mx-auto mt-14 w-full max-w-[110rem] px-5 pb-0 sm:mt-20 sm:px-8 lg:mt-24 lg:px-12">
        <HeroMedia
          src="/images/space-counter.jpg"
          alt="A barista working behind a white brick counter lined with shelves and stock."
          fill
          priority
          sizes="(max-width: 640px) 92vw, (max-width: 1760px) 88vw, 1680px"
          parallax={9}
          delay={0.25}
          className="aspect-16/9 w-full sm:aspect-21/8"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-linear-to-t from-background-sunken/45 to-transparent"
          />
        </HeroMedia>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[110rem] px-5 pb-12 sm:px-8 lg:mt-14 lg:px-12 lg:pb-14">
        <HeroMeta
          items={[
            { label: "Founded", value: String(siteConfig.founded) },
            { label: "Baristas", value: "9" },
            { label: "Blends tried", value: "11" },
            { label: "Roasted", value: "On site" },
          ]}
        />
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{
          stages: ["eyebrow", "title", "copy", "actions", "meta"],
          stagger: 0.1,
          duration: 1.2,
        }}
      />
      <HeroExit
        rootRef={rootRef}
        targets={[
          { selector: '[data-hero-stage="title"]', yPercent: -16, opacity: 0.25 },
          { selector: '[data-hero-stage="copy"]', yPercent: -10, opacity: 0.3 },
        ]}
      />
    </section>
  );
}