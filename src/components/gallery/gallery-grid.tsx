"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";

import { galleryFrames } from "@/data/gallery";
import { GalleryViewer } from "./gallery-viewer";

const CURTAIN_COLOR = "#e9e3d8";

function Curtain({
  onComplete,
  reducedMotion,
}: {
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  if (reducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 origin-left"
      style={{ backgroundColor: CURTAIN_COLOR }}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={onComplete}
    />
  );
}

export function GalleryGrid() {
  const reducedMotion = useReducedMotion();

  // Remove repeated source paths while preserving the original frame order.
  const frames = useMemo(() => {
    const seen = new Set<string>();

    return galleryFrames.filter((frame) => {
      const src = frame.src.trim();

      if (!src || seen.has(src)) return false;

      seen.add(src);
      return true;
    });
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [transitionId, setTransitionId] = useState(0);
  const [curtainVisible, setCurtainVisible] = useState(false);

  const active = frames[activeIndex];
  const total = frames.length;

  const changeSlide = useCallback(
    (direction: number) => {
      if (total < 2) return;

      setCurtainVisible(!reducedMotion);
      setTransitionId((id) => id + 1);
      setActiveIndex((index) => (index + direction + total) % total);
    },
    [reducedMotion, total],
  );

  // Keyboard navigation for the carousel.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (viewerIndex !== null || total < 2) return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName))
      ) {
        return;
      }

      if (event.key === "ArrowRight") changeSlide(1);
      if (event.key === "ArrowLeft") changeSlide(-1);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [changeSlide, total, viewerIndex]);

  const openViewer = useCallback(() => {
    setViewerIndex(activeIndex);
  }, [activeIndex]);

  const stepViewer = useCallback(
    (direction: number) => {
      setViewerIndex((index) => {
        if (index === null || total < 1) return index;

        return (index + direction + total) % total;
      });
    },
    [total],
  );

  const selectSlide = useCallback(
    (index: number) => {
      if (index === activeIndex || index < 0 || index >= total) return;

      setCurtainVisible(!reducedMotion);
      setTransitionId((id) => id + 1);
      setActiveIndex(index);
    },
    [activeIndex, reducedMotion, total],
  );

  if (!active) {
    return (
      <p className="border border-border p-8 text-sm text-muted-foreground">
        Gallery photography is currently unavailable.
      </p>
    );
  }

  return (
    <>
      <div className="mx-auto w-full">
        {/* Carousel status */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="micro uppercase tracking-[0.2em] text-muted-foreground">
            <span
              aria-hidden="true"
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent"
            />
            Live · Curtains
          </p>

          <p
            className="font-mono text-xs tabular-nums text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="mx-1.5">/</span>
            {String(total).padStart(2, "0")}
          </p>
        </div>

        {/* Main carousel */}
        <div className="grid w-full overflow-hidden border border-border lg:grid-cols-[1.05fr_0.95fr]">
          {/* Featured image */}
          <div className="relative aspect-4/3 min-w-0 overflow-hidden bg-[#e9e3d8] sm:aspect-16/10 lg:aspect-auto lg:min-h-117.5">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={active.src}
                className="absolute inset-0"
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0.8, scale: 1.025 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Wipe curtain */}
            {curtainVisible && (
              <Curtain
                key={transitionId}
                reducedMotion={Boolean(reducedMotion)}
                onComplete={() => setCurtainVisible(false)}
              />
            )}

            {/* Open image viewer */}
            <button
              type="button"
              onClick={openViewer}
              aria-label={`View full image: ${active.caption}`}
              className="absolute inset-0 z-20 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center border border-white/50 bg-black/30 text-white backdrop-blur-sm transition-colors duration-300 hover:bg-black/60">
                <Maximize2 size={16} aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* Slide information */}
          <div className="flex min-h-[250px] min-w-0 flex-col justify-between p-6 sm:p-9 lg:min-h-[470px] lg:p-10 xl:p-12">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={
                  reducedMotion ? false : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="mb-5 font-mono text-xs tracking-[0.15em] text-muted-foreground">
                  FRAME {String(activeIndex + 1).padStart(2, "0")}
                </p>

                <h2 className="max-w-md font-display text-3xl leading-[1.05] tracking-display sm:text-4xl lg:text-5xl">
                  {active.caption}
                </h2>

                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {active.meta}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Previous / Next */}
            <div className="mt-10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => changeSlide(-1)}
                disabled={total < 2}
                aria-label="Previous photograph"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-border text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-[#17110d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={17} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => changeSlide(1)}
                disabled={total < 2}
                className="group inline-flex h-11 items-center gap-4 border border-border px-5 text-sm text-foreground transition-all duration-300 hover:border-accent hover:bg-accent hover:text-[#17110d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Minimal slide indicators — no transition-mode selector */}
        {total > 1 && (
          <div
            className="mt-6 flex justify-center gap-2"
            role="group"
            aria-label="Choose photograph"
          >
            {frames.map((frame, index) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => selectSlide(index)}
                aria-label={`Show photograph ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={[
                  "h-1 transition-all duration-300",
                  activeIndex === index
                    ? "w-8 bg-accent"
                    : "w-3 bg-border hover:bg-accent/60",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      {viewerIndex !== null && (
        <GalleryViewer
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onStep={stepViewer}
        />
      )}
    </>
  );
}
