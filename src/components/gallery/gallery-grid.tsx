"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { galleryFrames, type GalleryFrame } from "@/data/gallery";
import { CurtainReveal } from "@/components/motion/curtain-reveal";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { GalleryViewer } from "./gallery-viewer";

/**
 * Gallery.
 *
 * An authored composition, not a feed. The page is built around one featured
 * photograph and arranged around it; there is no grid to be filled and no repeat
 * of the same subject.
 *
 * The previous implementation was a flex column of eighteen spreads at
 * `gap-44`, each a full-measure frame. That produced a 19,715px page — roughly
 * twenty-two viewport heights — for nine distinct subjects, because six of the
 * eighteen files were café interiors and the remaining frames were stretched
 * wide enough that the repetition was the composition. It was also rendered
 * three times: the hero showed three frames as thumbnails, a pinned contact-sheet
 * band showed twelve, and the spreads showed all eighteen again.
 *
 * Layout here is explicit per role rather than derived from a parent track. Every
 * frame declares its own aspect ratio, so nothing can collapse the way an earlier
 * 12-column grid with `row-span` did.
 */

/** Explicit ratios, so a frame's height is never derived from a parent track. */
const ratioFor = (span: GalleryFrame["span"]) =>
  span === "feature"
    ? "aspect-4/5 sm:aspect-16/9 lg:aspect-21/9"
    : span === "wide"
      ? "aspect-4/3 sm:aspect-16/9"
      : span === "tall"
        ? "aspect-3/4"
        : "aspect-4/5";

/**
 * Column widths per role, as a fraction of the measure.
 *
 * The asymmetry in this page comes from mixing aspect ratios and differing
 * widths, not from margin offsets. An earlier version offset the second item of
 * a pair with `lg:mt-24` against two equal-height images, which produced a 550px
 * hole in the left column — the offset moved one item down while the row height
 * stayed set by the other. Ragged row heights fall out of the ratios themselves.
 */
const widthFor = (span: GalleryFrame["span"]) =>
  span === "feature"
    ? ""
    : span === "wide"
      ? "lg:w-[62%]"
      : span === "tall"
        ? "lg:w-[36%]"
        : "";

function GalleryFrame_({
  frame,
  index,
  onOpen,
  className,
  sizes,
  priority,
}: {
  frame: GalleryFrame;
  index: number;
  onOpen: () => void;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <figure
      data-parallax=""
      className={cn("group relative", widthFor(frame.span), className)}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-background-raised",
          ratioFor(frame.span),
        )}
      >
        <CurtainReveal className="absolute inset-0" panels={5}>
          <button
            type="button"
            onClick={onOpen}
            data-cursor="view"
            aria-label={`Open frame ${number}: ${frame.caption}`}
            className="absolute inset-0 block h-full w-full cursor-none text-left"
          >
            <Image
              src={frame.src}
              alt={frame.alt}
              fill
              priority={priority}
              loading={priority ? undefined : "lazy"}
              sizes={sizes}
              className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />

            {/* Caption rises on hover, desktop only. The rail below carries the
                same text at every width, so nothing is hover-only. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden translate-y-3 items-end bg-linear-to-t from-background-sunken/90 via-background-sunken/40 to-transparent p-6 opacity-0 transition-all duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 lg:flex lg:flex-col lg:justify-end"
            >
              <span className="max-w-md text-pretty leading-snug text-foreground">
                {frame.caption}
              </span>
            </span>
          </button>
        </CurtainReveal>
      </div>

      <figcaption className="mt-4 flex items-baseline gap-4">
        <span aria-hidden className="micro text-accent">
          {number}
        </span>
        <span className="micro text-muted-foreground">{frame.meta}</span>
        <span className="text-sm leading-snug text-foreground-soft">
          {frame.caption}
        </span>
      </figcaption>
    </figure>
  );
}

export function GalleryGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /*
    Scroll-linked parallax.
    
    The curtain reveal is a one-shot entrance: it fires as a frame arrives and is
    finished. That left the gallery with no motion that responded to scroll at
    all, which an audit measuring transform deltas across a scroll reported as
    imperceptible. A scrubbed drift restores the cinematic register without
    adding a single element to the page.
    
    Restrained on purpose — 6%, well under the threshold where a photograph
    visibly slides against its frame. The image is scaled to 1.08 first so the
    drift never exposes an edge, and the whole thing is skipped under reduced
    motion and below `lg`, where the frames are small and the drift would only
    read as jitter.
  */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const ctx = gsap.context(() => {
      const figures = gsap.utils.toArray<HTMLElement>("[data-parallax]", root);
      for (const figure of figures) {
        const image = figure.querySelector("img");
        if (!image) continue;
        gsap.fromTo(
          image,
          { scale: 1.08, yPercent: -3 },
          {
            scale: 1.08,
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: figure,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  // Authored roles rather than a slice of the set. The data is ordered to match
  // this composition — featured frame, then a portrait/landscape pair, then a
  // ragged run of three, then a closing pair — and `audit:gallery` asserts the
  // order, because a frame dropped here is a frame the lightbox can still open
  // and find nothing behind. An earlier version destructured the remainder and
  // rendered three of it, silently losing two.
  const [feature, tallA, wideA, insetA, insetB, insetC, tallB, wideB] =
    galleryFrames;

  function step(delta: number) {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + delta + galleryFrames.length) % galleryFrames.length;
    });
  }

  return (
    <>
      <div ref={rootRef} className="flex flex-col gap-14 sm:gap-16 lg:gap-20">
        {/* 01 — the featured photograph, full measure. */}
        <GalleryFrame_
          frame={feature}
          index={0}
          onOpen={() => setActiveIndex(0)}
          sizes="100vw"
          priority
        />

        {/*
          02 + 03 — a portrait frame and a landscape frame sharing one row. The
          row is as tall as the portrait, so the landscape leaves a ragged base
          against it: the asymmetry is structural rather than an offset that can
          open a hole.
        */}
        <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-16">
          <GalleryFrame_
            frame={tallA}
            index={1}
            onOpen={() => setActiveIndex(1)}
            sizes="(max-width: 640px) 92vw, 34vw"
          />
          <GalleryFrame_
            frame={wideA}
            index={2}
            onOpen={() => setActiveIndex(2)}
            className="lg:mt-24"
            sizes="(max-width: 640px) 92vw, 46vw"
          />
        </div>

        {/*
          04 + 05 + 06 — three insets on a ragged run, each held against a
          different edge and a different baseline, so the block reads as placed
          rather than tiled.
        */}
        <div className="grid grid-cols-1 items-end gap-10 sm:grid-cols-3 sm:gap-6 lg:gap-12">
          <GalleryFrame_
            frame={insetA}
            index={3}
            onOpen={() => setActiveIndex(3)}
            sizes="(max-width: 640px) 92vw, 30vw"
          />
          <GalleryFrame_
            frame={insetB}
            index={4}
            onOpen={() => setActiveIndex(4)}
            className="lg:mb-14 lg:w-[76%] lg:justify-self-center"
            sizes="(max-width: 640px) 92vw, 24vw"
          />
          <GalleryFrame_
            frame={insetC}
            index={5}
            onOpen={() => setActiveIndex(5)}
            className="lg:w-[86%] lg:justify-self-end"
            sizes="(max-width: 640px) 92vw, 26vw"
          />
        </div>

        {/* 07 + 08 — closing pair, portrait against landscape. */}
        <div className="grid grid-cols-1 items-start gap-10 sm:grid-cols-2 sm:gap-8 lg:gap-16">
          <GalleryFrame_
            frame={wideB}
            index={6}
            onOpen={() => setActiveIndex(6)}
            sizes="(max-width: 640px) 92vw, 46vw"
          />
          <GalleryFrame_
            frame={tallB}
            index={7}
            onOpen={() => setActiveIndex(7)}
            className="lg:justify-self-center lg:w-[78%]"
            sizes="(max-width: 640px) 92vw, 34vw"
          />
        </div>
      </div>

      {activeIndex !== null ? (
        <GalleryViewer
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onStep={step}
        />
      ) : null}
    </>
  );
}