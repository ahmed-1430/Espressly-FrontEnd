"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { galleryFrames, type GalleryFrame } from "@/data/gallery";
import { cn } from "@/lib/cn";

/**
 * Gallery.
 *
 * An authored composition rather than a masonry dump: each frame declares whether
 * it is wide, tall or standard, and the grid honours that so the page reads like a
 * magazine spread. Hover raises the frame and reveals its caption; clicking opens
 * a lightbox with focus trapping and keyboard navigation.
 */
export function GalleryGrid() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const frames = useMemo(() => galleryFrames, []);

  function step(delta: number) {
    setActiveIndex((current) => {
      if (current === null) return null;
      return (current + delta + frames.length) % frames.length;
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-12 lg:gap-x-6">
        {frames.map((frame, index) => (
          <GalleryItem
            key={frame.id}
            frame={frame}
            index={index}
            onOpen={() => setActiveIndex(index)}
          />
        ))}
      </div>

      {activeIndex !== null ? (
        <Lightbox
          frames={frames}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onStep={step}
        />
      ) : null}
    </>
  );
}

function GalleryItem({
  frame,
  index,
  onOpen,
}: {
  frame: GalleryFrame;
  index: number;
  onOpen: () => void;
}) {
  const span =
    frame.span === "wide"
      ? "sm:col-span-2"
      : frame.span === "tall"
        ? "lg:row-span-2"
        : "";

  // Tall frames get a portrait ratio so the row-span-2 reads correctly.
  const ratio =
    frame.span === "wide"
      ? "aspect-16/9"
      : frame.span === "tall"
        ? "aspect-3/4 h-full min-h-[26rem] lg:min-h-full"
        : "aspect-4/3";

  return (
    <figure
      className={cn(
        "group relative",
        frame.span === "tall" && "lg:flex",
        span,
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="view"
        aria-label={`View ${frame.meta} — ${frame.caption}`}
        className={cn(
          "relative block w-full overflow-hidden bg-background-raised text-left",
          ratio,
          frame.span === "tall" && "lg:h-full",
        )}
      >
        <Image
          src={frame.src}
          alt={frame.alt}
          fill
          loading={index < 2 ? "eager" : "lazy"}
          sizes={
            frame.span === "wide"
              ? "(max-width: 640px) 100vw, 92vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 30vw"
          }
          className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />

        {/* Caption panel wipes up from the bottom edge on hover. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-full items-end justify-between gap-4 bg-gradient-to-t from-background-sunken/90 via-background-sunken/55 to-transparent p-5 pb-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0",
            "pt-14",
          )}
        >
          <span className="text-sm leading-snug text-foreground">
            {frame.caption}
          </span>
          <span className="micro shrink-0 text-accent-bright">
            {String(index + 1).padStart(2, "0")}
          </span>
        </span>
      </button>

      <figcaption className="micro mt-3 flex items-center justify-between gap-4 text-muted-foreground">
        <span>{frame.meta}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Full-screen lightbox.
 *
 * A native `dialog` gives focus trapping, Escape handling and inertness of the
 * rest of the page for free. Arrow keys step through the set, and the counter
 * keeps position legible.
 */
function Lightbox({
  frames,
  index,
  onClose,
  onStep,
}: {
  frames: readonly GalleryFrame[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const frame = frames[index];
  const dialogRef = useModalDialog();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          onStep(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          onStep(-1);
        }
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-background-sunken/96 p-0 text-foreground backdrop-blur-md"
      aria-label="Gallery image viewer"
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8">
          <p className="micro text-muted-foreground">
            <span className="text-accent-bright">
              {String(index + 1).padStart(2, "0")}
            </span>{" "}
            / {String(frames.length).padStart(2, "0")}
            <span className="mx-3 text-border-strong">·</span>
            {frame.meta}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="group flex h-11 items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="micro">Close</span>
            <span aria-hidden className="relative block h-4 w-4">
              <span className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <Image
            key={frame.id}
            src={frame.src}
            alt={frame.alt}
            fill
            sizes="100vw"
            className="animate-[lightbox-in_520ms_var(--ease-out-expo)_both] object-contain px-4 py-6 sm:px-16 sm:py-10"
          />

          <button
            type="button"
            onClick={() => onStep(-1)}
            aria-label="Previous image"
            className="group absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-border bg-background/60 text-foreground-soft backdrop-blur-sm transition-colors hover:border-accent hover:text-accent-bright sm:left-6"
          >
            <svg aria-hidden viewBox="0 0 24 12" fill="none" className="h-2.5 w-6">
              <path
                d="M24 6H3m0 0 5-5M3 6l5 5"
                stroke="currentColor"
                strokeWidth="1.3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onStep(1)}
            aria-label="Next image"
            className="group absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-border bg-background/60 text-foreground-soft backdrop-blur-sm transition-colors hover:border-accent hover:text-accent-bright sm:right-6"
          >
            <svg aria-hidden viewBox="0 0 24 12" fill="none" className="h-2.5 w-6">
              <path
                d="M0 6h21m0 0-5-5m5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.3"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </button>
        </div>

        <div className="border-t border-border px-5 py-5 sm:px-8">
          <p className="text-pretty leading-relaxed text-foreground-soft">
            {frame.caption}
          </p>
          <p className="micro mt-3 text-muted-foreground">
            Use ← → to move, Esc to close
          </p>
        </div>
      </div>
    </dialog>
  );
}

/**
 * Opens a dialog as a modal on mount.
 *
 * `showModal()` gives focus trapping, Escape handling and inertness of the rest of
 * the page without hand-rolling any of it. The ref is stable, so this runs once.
 */
function useModalDialog() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node && !node.open) node.showModal();
  }, []);

  return ref;
}