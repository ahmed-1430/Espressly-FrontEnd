"use client";

import { useRef } from "react";
import Image from "next/image";
import { HeroMedia, HeroMeta, HeroScrollCue } from "./hero-atoms";
import { HeroEntrance, HeroExit } from "./hero-motion";
import { galleryFrames } from "@/data/gallery";
import { cn } from "@/lib/cn";

/**
 * GALLERY hero — "the exhibition".
 *
 * There is no conventional masthead here on purpose. The first viewport is a
 * single full-bleed frame with the title set into the lower third of the image
 * rather than beside it, three supporting thumbnails overlapping its bottom edge,
 * and a caption rail. A visitor should be looking at photography before they have
 * read anything.
 *
 * The overlapping thumbnails are the same frames that open the grid below, which
 * makes the hero read as the first spread rather than a separate section.
 */
export function GalleryHero() {
  const rootRef = useRef<HTMLElement>(null);
  const supporting = galleryFrames.slice(1, 4);

  return (
    <section
      ref={rootRef}
      aria-labelledby="gallery-hero-title"
      className="relative isolate overflow-hidden border-b border-border pt-16 lg:pt-[76px]"
    >
      <HeroMedia
        src="/images/hero-counter.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        parallax={14}
        className="absolute inset-0 -z-10 h-full w-full"
      >
        {/*
          Two scrims, because the photograph is busy in two directions: a
          bottom-up wash for the title and thumbnails that sit low in the frame,
          and a left-to-right wash so the copy column keeps a ground to sit on.
          A single gradient would leave the lede unreadable against the bulbs.
        */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-background-sunken via-background-sunken/55 to-background-sunken/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-background-sunken/92 via-background-sunken/45 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-background-sunken to-transparent"
        />
      </HeroMedia>

      {/* Caption rail, top-left — reads as a gallery wall label. */}
      <div
        data-hero-stage="eyebrow"
        className="mx-auto flex w-full max-w-[110rem] items-center justify-between gap-6 px-5 pt-8 sm:px-8 lg:px-12"
      >
        <p className="micro text-foreground-soft">Espressly — Photography</p>
        <p className="micro hidden text-muted-foreground sm:block">
          Shot on film and on a Tuesday
        </p>
      </div>

      <div className="mx-auto w-full max-w-[110rem] px-5 pb-0 pt-16 sm:px-8 sm:pt-24 lg:px-12">
        <h1
          id="gallery-hero-title"
          className="font-display text-[clamp(3.75rem,15vw,13rem)] leading-[0.82] tracking-display"
        >
          <span className="block overflow-hidden">
            <span data-hero-stage="title" className="block">
              Gallery
            </span>
          </span>
        </h1>

        <p
          data-hero-stage="copy"
          className="mt-8 max-w-md text-pretty text-[clamp(0.9375rem,1.2vw,1.0625rem)] leading-relaxed text-foreground-soft"
        >
          The room, the bar, the roast, and the people who work them.
        </p>

        {/* Supporting frames overlapping the bottom edge of the hero image. */}
        <ul
          data-hero-stage="meta"
          // Small by design — a supporting strip, not a gallery frame.
          data-decorative-thumb
          className="mt-12 grid grid-cols-3 gap-3 sm:mt-16 sm:gap-5 lg:max-w-3xl lg:gap-6"
        >
          {supporting.map((frame, index) => (
            <li
              key={frame.id}
              className={cn(
                "relative aspect-4/5 overflow-hidden bg-background-raised",
                index === 1 && "lg:-translate-y-8",
              )}
            >
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="(max-width: 640px) 30vw, 12vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata sits below the overlapping frames on a solid ground. */}
      <div className="relative mt-12 bg-background pb-10 pt-10 sm:mt-16 lg:mt-0 lg:pb-12">
        <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between gap-8">
            <HeroMeta
              items={[
                { label: "Frames", value: String(galleryFrames.length).padStart(2, "0") },
                { label: "Period", value: "2019 — 2026" },
                { label: "Studio", value: "Queen St W" },
              ]}
              className="flex-1 border-t-0 pt-0"
            />
            <a href="#frames" className="hidden shrink-0 sm:block">
              <HeroScrollCue label="View all" />
            </a>
          </div>
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{
          stages: ["eyebrow", "title", "copy", "meta"],
          stagger: 0.14,
          duration: 1.35,
        }}
      />
      <HeroExit
        rootRef={rootRef}
        targets={[
          { selector: '[data-hero-stage="title"]', yPercent: -18, opacity: 0.2 },
        ]}
      />
    </section>
  );
}