"use client";

import { useRef } from "react";
import { HeroMedia, HeroMeta } from "./hero-atoms";
import { HeroEntrance } from "./hero-motion";
import { SplitLines } from "@/components/motion/split-lines";

/**
 * ABOUT hero — asymmetric, and the photograph is allowed to be small.
 *
 * The previous version was the same full-bleed band as the other inner pages,
 * with the statement laid across the bottom of it. Its own comment claimed it
 * "avoids the same left-text/right-image arrangement the other heroes use", which
 * was not true of the outer composition — only of the order of two elements
 * inside it.
 *
 * Now the image is a tall, narrow panel set hard against the right margin and
 * pulled up above the text baseline, so the two masses are deliberately unequal
 * and out of alignment. There is no background photograph and no scrim.
 */
export function AboutHero() {
  const rootRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={rootRef}
      aria-labelledby="about-hero-title"
      className="relative border-b border-border pt-16 lg:pt-[76px]"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 lg:px-12">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 lg:pb-4">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Since 2019</span>
            </div>

            <h1
              id="about-hero-title"
              className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.88] tracking-display"
            >
              <SplitLines lines={["A small", "room with", "a long"]} duration={1.05} />
            </h1>

            <p
              data-hero-stage="copy"
              className="mt-7 max-w-lg text-pretty text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-relaxed text-foreground-soft"
            >
              One bar, three grinders, and a roast we publish every Wednesday.
            </p>
          </div>

          {/*
            Narrow and tall, and lifted above the text rather than aligned to it.
            The misalignment is the composition: two equal blocks side by side is
            the arrangement every other hero on this site had settled into.
          */}
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-4/5 overflow-hidden bg-background-raised lg:-mt-16">
              <HeroMedia
                src="/images/space-counter.jpg"
                alt="A barista working behind a white brick counter lined with shelves and stock."
                fill
                priority
                parallax={0}
                sizes="(max-width: 1024px) 92vw, 28vw"
              />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <HeroMeta
            items={[
              { label: "Founded", value: "2019" },
              { label: "Room", value: "Queen St W, Toronto" },
              { label: "Roast day", value: "Wednesday" },
            ]}
          />
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{ stages: ["copy"], stagger: 0.12, duration: 1.1 }}
      />
    </section>
  );
}