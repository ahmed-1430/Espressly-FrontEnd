"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { galleryFrames, type GalleryFrame } from "@/data/gallery";
import { CurtainReveal } from "@/components/motion/curtain-reveal";
import { cn } from "@/lib/cn";
import { GalleryViewer } from "./gallery-viewer";

/**
 * Gallery.
 *
 * An authored sequence of spreads, not a grid to be filled. Each frame declares
 * how it sits — `full` breaks the measure, `inset` is set narrow against
 * whitespace, `tall` drops down the page — and negative space between spreads is
 * part of the composition rather than leftover space.
 *
 * The previous implementation used a 12-column grid with `row-span-2` items whose
 * height came from `min-height: 100%`. Inside implicit auto rows that resolves
 * circularly and the rows collapsed: nineteen frames rendered into a 965px band
 * of slivers. Layout here is driven by explicit aspect ratios on a flex column,
 * which cannot collapse.
 *
 * Reveal is a Motion curtain: oversized frames open with an edge wipe, the
 * smaller ones part in five panels from the centre outward, so the page's two
 * dominant frame types do not arrive by the same gesture.
 */
export function GalleryGrid() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function step(delta: number) {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + delta + galleryFrames.length) % galleryFrames.length;
    });
  }

  return (
    <>
      <div ref={rootRef} className="flex flex-col gap-24 sm:gap-32 lg:gap-44">
        {galleryFrames.map((frame, index) => (
          <GalleryFrame
            key={frame.id}
            frame={frame}
            index={index}
            onOpen={() => setActiveIndex(index)}
          />
        ))}
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

/** Explicit ratios, so a frame's height is never derived from a parent track. */
const ratioFor = (span: GalleryFrame["span"]) =>
  span === "full"
    ? "aspect-16/10 sm:aspect-21/9"
    : span === "tall"
      ? "aspect-3/4"
      : span === "inset"
        ? "aspect-4/5"
        : "aspect-4/3";

function GalleryFrame({
  frame,
  index,
  onOpen,
}: {
  frame: GalleryFrame;
  index: number;
  onOpen: () => void;
}) {
  const isHalf = frame.span === "half";

  return (
    <figure
      data-frame
      className={cn(
        "flex flex-col",
        isHalf && "sm:grid sm:grid-cols-2 sm:gap-10 sm:items-end lg:gap-16",
      )}
    >
      {/*
        `inset` frames are offset to one side rather than centred, which is what
        stops the page reading as a stack of centred rows.
      */}
      <div
        className={cn(
          "group relative w-full overflow-hidden bg-background-raised",
          ratioFor(frame.span),
          frame.span === "full" && "sm:-mx-6 lg:-mx-16",
          frame.span === "inset" &&
            "sm:w-2/3 sm:shrink-0 sm:self-start lg:w-1/2",
          frame.span === "tall" && "sm:w-3/4 lg:w-1/2",
          isHalf && "sm:w-full",
        )}
      >
        {/*
          Curtain reveal. Oversized frames open with a single edge wipe and the
          smaller ones with a five-panel curtain, so the two dominant frame types
          on the page do not arrive by the same gesture.
        */}
        <CurtainReveal
          className="absolute inset-0"
          panels={frame.span === "full" ? 1 : 5}
          origin={frame.span === "full" ? "bottom" : "center"}
        >
          <button
            type="button"
            onClick={onOpen}
            data-cursor="view"
            aria-label={`View ${frame.meta} — ${frame.caption}`}
            className="absolute inset-0 block h-full w-full cursor-none text-left"
          >
            <Image
              src={frame.src}
              alt={frame.alt}
              fill
              loading={index < 3 ? "eager" : "lazy"}
              sizes={
                frame.span === "full"
                  ? "(max-width: 640px) 92vw, (max-width: 1024px) 88vw, 74vw"
                  : "(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 34vw"
              }
              className="object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]"
            />

            {/* Caption panel wipes up on hover, desktop only. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-full items-end justify-between gap-6 bg-linear-to-t from-background-sunken/92 via-background-sunken/55 to-transparent px-7 pb-7 pt-20 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0 lg:flex"
            >
              <span className="max-w-sm text-pretty leading-snug text-foreground">
                {frame.caption}
              </span>
              <span className="micro shrink-0 text-accent-bright">
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>
          </button>
        </CurtainReveal>
      </div>

      {/* Caption rail. Always visible on touch, where there is no hover. */}
      <figcaption
        className={cn(
          "mt-5 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-6",
          frame.span === "inset" && "sm:mt-6",
          isHalf && "sm:col-start-2 sm:mt-0 sm:self-end sm:pb-2 sm:pl-0",
        )}
      >
        <div className="flex items-baseline gap-4">
          <span className="micro text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="micro text-muted-foreground">{frame.meta}</span>
        </div>

        <p className="max-w-md text-pretty leading-snug text-foreground-soft">
          {frame.caption}
        </p>

        {frame.note ? (
          <p className="hidden text-pretty text-sm italic leading-snug text-muted-foreground lg:ml-auto lg:max-w-xs lg:text-right">
            {frame.note}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}