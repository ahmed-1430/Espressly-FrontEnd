"use client";

import { useRef } from "react";
import { SplitLines } from "@/components/motion/split-lines";
import { galleryFrames } from "@/data/gallery";

/**
 * GALLERY masthead — compact.
 *
 * The earlier hero was a full-bleed photograph at `100vw` with a 13rem title set
 * into it, three overlapping thumbnails, and a metadata rail: the same structure
 * every other inner page used, which is precisely what made the site read as one
 * template. It also spent the first viewport re-showing three frames the spreads
 * below showed again.
 *
 * This is a wall label instead. Type, a count, and the first frame immediately
 * below it — so the reader is looking at photography within the opening viewport,
 * without a full-height image standing between them and it.
 */
export function GalleryHero() {
  const rootRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={rootRef}
      aria-labelledby="gallery-hero-title"
      className="border-b border-border pt-16 lg:pt-[76px]"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Photography</span>
            </div>

            <h1
              id="gallery-hero-title"
              className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.88] tracking-display"
            >
              <SplitLines lines={["Gallery"]} duration={1.1} />
            </h1>
          </div>

          <div className="max-w-sm lg:pb-3 lg:text-right">
            <p className="text-pretty text-[clamp(0.9375rem,1.2vw,1.0625rem)] leading-relaxed text-foreground-soft">
              Nine photographs of the bar, the roast and the room.
            </p>

            <dl className="mt-6 flex items-end gap-8 lg:justify-end">
              <div>
                <dt className="micro text-muted-foreground">Frames</dt>
                <dd className="mt-1 font-display text-2xl text-accent">
                  {String(galleryFrames.length).padStart(2, "0")}
                </dd>
              </div>
              <div>
                <dt className="micro text-muted-foreground">Period</dt>
                <dd className="mt-1 font-display text-2xl">2019—26</dd>
              </div>
              {/*
                Kept as a real in-page link rather than a decorative scroll cue:
                the masthead is compact, so there is little to scroll past, but a
                keyboard user still wants a way to reach the photographs directly
                and `verify:anchors` checks this resolves without a native jump.
              */}
              <div className="hidden sm:block">
                <dt className="micro text-muted-foreground">&nbsp;</dt>
                <dd className="mt-1">
                  <a
                    href="#frames"
                    className="text-sm text-foreground underline decoration-accent/60 underline-offset-4 transition-colors hover:text-accent focus-visible:text-accent"
                  >
                    View the set
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}