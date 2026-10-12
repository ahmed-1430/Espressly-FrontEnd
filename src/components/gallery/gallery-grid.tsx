"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
} from "lucide-react";

import { galleryFrames, type GalleryFrame } from "@/data/gallery";
import { GalleryViewer } from "./gallery-viewer";

type TransitionMode = "Wipe" | "Blinds" | "Iris" | "Pixels" | "Doors";

type IndexedFrame = {
  frame: GalleryFrame;
  originalIndex: number;
};

const transitionModes: TransitionMode[] = [
  "Wipe",
  "Blinds",
  "Iris",
  "Pixels",
  "Doors",
];

const CURTAIN_COLOR = "#e9e3d8";

function CurtainTransition({
  mode,
  transitionKey,
  reducedMotion,
}: {
  mode: TransitionMode;
  transitionKey: string;
  reducedMotion: boolean;
}) {
  if (reducedMotion) return null;

  if (mode === "Wipe") {
    return (
      <motion.div
        key={transitionKey}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundColor: CURTAIN_COLOR,
          transformOrigin: "left",
        }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    );
  }

  if (mode === "Blinds") {
    return (
      <div
        key={transitionKey}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <motion.div
            key={index}
            className="h-full flex-1"
            style={{ backgroundColor: CURTAIN_COLOR }}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{
              duration: 0.65,
              delay: index * 0.045,
              ease: [0.76, 0, 0.24, 1],
            }}
          />
        ))}
      </div>
    );
  }

  if (mode === "Iris") {
    return (
      <motion.div
        key={transitionKey}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{ backgroundColor: CURTAIN_COLOR }}
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: "circle(75% at 50% 50%)" }}
        transition={{
          duration: 0.9,
          ease: [0.76, 0, 0.24, 1],
        }}
      />
    );
  }

  if (mode === "Doors") {
    return (
      <div
        key={transitionKey}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex"
      >
        <motion.div
          className="h-full w-1/2"
          style={{ backgroundColor: CURTAIN_COLOR }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
        />

        <motion.div
          className="h-full w-1/2"
          style={{ backgroundColor: CURTAIN_COLOR }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      </div>
    );
  }

  // Pixels: a compact staggered reveal using a grid of curtain tiles.
  return (
    <div
      key={transitionKey}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 grid grid-cols-8 grid-rows-6"
    >
      {Array.from({ length: 48 }, (_, index) => (
        <motion.div
          key={index}
          style={{ backgroundColor: CURTAIN_COLOR }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{
            duration: 0.35,
            delay:
              ((index % 8) + Math.floor(index / 8)) * 0.025,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function GalleryGrid() {
  const prefersReducedMotion = useReducedMotion();

  const frames = useMemo<IndexedFrame[]>(() => {
    const seen = new Set<string>();

    return galleryFrames.reduce<IndexedFrame[]>(
      (result, frame, originalIndex) => {
        const src = frame.src?.trim();

        if (!src || seen.has(src)) return result;

        seen.add(src);
        result.push({ frame, originalIndex });

        return result;
      },
      [],
    );
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [mode, setMode] = useState<TransitionMode>("Wipe");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const active = frames[activeIndex];
  const total = frames.length;

  const changeSlide = useCallback(
    (direction: number) => {
      if (total < 2) return;

      setActiveIndex((current) => (current + direction + total) % total);
    },
    [total],
  );

  const openViewer = useCallback(() => {
    if (active) {
      setViewerIndex(active.originalIndex);
    }
  }, [active]);

  const stepViewer = useCallback(
    (direction: number) => {
      if (total < 2) return;

      const current = frames.findIndex(
        (item) => item.originalIndex === viewerIndex,
      );

      const next = (current + direction + total) % total;

      setViewerIndex(frames[next].originalIndex);
    },
    [frames, total, viewerIndex],
  );

  if (!active) {
    return (
      <div className="flex min-h-48 items-center justify-center border border-border text-sm text-muted-foreground">
        Gallery photography is currently unavailable.
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="micro uppercase tracking-[0.2em] text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
            Live · Curtains
          </p>

          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="mx-1.5">/</span>
            {String(total).padStart(2, "0")}
          </p>
        </div>

        <div className="grid overflow-hidden border border-border bg-background lg:min-h-[470px] lg:grid-cols-[1.05fr_0.95fr]">
          {/* Featured photograph */}
          <div className="relative aspect-[4/3] overflow-hidden bg-background-raised sm:aspect-[16/10] lg:aspect-auto lg:min-h-[470px]">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={active.frame.src}
                className="absolute inset-0"
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0.8, scale: 1.025 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Image
                  src={active.frame.src}
                  alt={active.frame.alt}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            <CurtainTransition
              mode={mode}
              transitionKey={`${active.frame.src}-${activeIndex}-${mode}`}
              reducedMotion={Boolean(prefersReducedMotion)}
            />

            <button
              type="button"
              onClick={openViewer}
              aria-label={`View full image: ${active.frame.caption}`}
              className="absolute inset-0 z-20 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center border border-white/50 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/50">
                <Maximize2 size={16} aria-hidden="true" />
              </span>
            </button>
          </div>

          {/* Editorial information */}
          <div className="flex min-h-[250px] flex-col justify-between p-6 sm:p-9 lg:min-h-0 lg:p-10 xl:p-12">
            <div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.frame.src}
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 14 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <p className="mb-5 font-mono text-xs tracking-[0.15em] text-muted-foreground">
                    FRAME {String(activeIndex + 1).padStart(2, "0")}
                  </p>

                  <h2 className="max-w-md font-display text-3xl leading-[1.05] tracking-display sm:text-4xl lg:text-5xl">
                    {active.frame.caption}
                  </h2>

                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {active.frame.meta}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => changeSlide(-1)}
                disabled={total < 2}
                aria-label="Previous photograph"
                className="inline-flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
              >
                <ArrowLeft size={17} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => changeSlide(1)}
                disabled={total < 2}
                className="group inline-flex h-11 items-center gap-4 border border-border px-5 text-sm transition-colors hover:border-foreground hover:bg-foreground hover:text-background disabled:opacity-40"
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

        {/* Transition controls */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 border border-border/70 p-1.5 sm:mt-7 sm:inline-flex sm:relative sm:left-1/2 sm:-translate-x-1/2">
          {transitionModes.map((item) => {
            const selected = mode === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                aria-pressed={selected}
                className={[
                  "px-3 py-2.5 text-xs transition-colors duration-200 sm:px-4",
                  selected
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Direct slide selection */}
        {total > 1 && (
          <div
            className="mt-6 flex justify-center gap-2"
            role="group"
            aria-label="Choose photograph"
          >
            {frames.map((item, index) => (
              <button
                key={item.frame.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show photograph ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={[
                  "h-1 transition-all duration-300",
                  activeIndex === index
                    ? "w-8 bg-foreground"
                    : "w-3 bg-border hover:bg-muted-foreground",
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