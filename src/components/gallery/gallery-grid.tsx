"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";

import { galleryFrames } from "@/data/gallery";
import { GalleryViewer } from "./gallery-viewer";

type TransitionMode = "Wipe" | "Blinds" | "Iris" | "Pixels" | "Doors";

const modes: TransitionMode[] = [
  "Wipe",
  "Blinds",
  "Iris",
  "Pixels",
  "Doors",
];

const curtainColor = "#e9e3d8";

function Curtain({
  mode,
  onComplete,
  reducedMotion,
}: {
  mode: TransitionMode;
  onComplete: () => void;
  reducedMotion: boolean;
}) {
  useEffect(() => {
    if (reducedMotion) onComplete();
  }, [reducedMotion, onComplete]);

  if (reducedMotion) return null;

  const common = {
    initial: { scaleX: 1 },
    animate: { scaleX: 0 },
    transition: {
      duration: 0.8,
      ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
    },
    onAnimationComplete: onComplete,
  };

  if (mode === "Wipe") {
    return (
      <motion.div
        className="absolute inset-0 z-10 origin-left"
        style={{ backgroundColor: curtainColor }}
        {...common}
      />
    );
  }

  if (mode === "Blinds") {
    return (
      <div className="absolute inset-0 z-10 flex">
        {Array.from({ length: 8 }, (_, index) => (
          <motion.div
            key={index}
            className="h-full flex-1 origin-top"
            style={{ backgroundColor: curtainColor }}
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{
              duration: 0.65,
              delay: index * 0.04,
              ease: [0.76, 0, 0.24, 1],
            }}
            onAnimationComplete={index === 7 ? onComplete : undefined}
          />
        ))}
      </div>
    );
  }

  if (mode === "Iris") {
    return (
      <motion.div
        className="absolute inset-0 z-10"
        style={{ backgroundColor: curtainColor }}
        initial={{ clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: "circle(75% at 50% 50%)" }}
        transition={{
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1],
        }}
        onAnimationComplete={onComplete}
      />
    );
  }

  if (mode === "Doors") {
    return (
      <div className="absolute inset-0 z-10 flex">
        {[0, 1].map((side) => (
          <motion.div
            key={side}
            className={`h-full w-1/2 ${
              side === 0 ? "origin-left" : "origin-right"
            }`}
            style={{ backgroundColor: curtainColor }}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.76, 0, 0.24, 1],
            }}
            onAnimationComplete={side === 1 ? onComplete : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10 grid grid-cols-8 grid-rows-6">
      {Array.from({ length: 48 }, (_, index) => (
        <motion.div
          key={index}
          style={{ backgroundColor: curtainColor }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{
            duration: 0.35,
            delay: ((index % 8) + Math.floor(index / 8)) * 0.02,
            ease: "easeInOut",
          }}
          onAnimationComplete={index === 47 ? onComplete : undefined}
        />
      ))}
    </div>
  );
}

export function GalleryGrid() {
  const reducedMotion = useReducedMotion();

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
  const [mode, setMode] = useState<TransitionMode>("Wipe");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [transitionId, setTransitionId] = useState(0);
  const [curtainVisible, setCurtainVisible] = useState(false);

  const active = frames[activeIndex];
  const total = frames.length;

  const changeSlide = useCallback(
    (direction: number) => {
      if (total < 2) return;

      setCurtainVisible(true);
      setTransitionId((id) => id + 1);
      setActiveIndex((index) => (index + direction + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (viewerIndex !== null || total < 2) return;

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

  if (!active) {
    return (
      <p className="border border-border p-8 text-sm text-muted-foreground">
        Gallery photography is currently unavailable.
      </p>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="micro uppercase tracking-[0.2em] text-muted-foreground">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Live · Curtains
          </p>

          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")}
            <span className="mx-1.5">/</span>
            {String(total).padStart(2, "0")}
          </p>
        </div>

        <div className="grid overflow-hidden border border-border lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#e9e3d8] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[440px]">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={active.src}
                className="absolute inset-0"
                initial={reducedMotion ? false : { opacity: 0.75, scale: 1.025 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: reducedMotion ? 0 : 0.45 }}
              >
                <Image
                  src={active.src}
                  alt={active.alt}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {curtainVisible && (
              <Curtain
                key={transitionId}
                mode={mode}
                reducedMotion={Boolean(reducedMotion)}
                onComplete={() => setCurtainVisible(false)}
              />
            )}

            <button
              type="button"
              onClick={openViewer}
              aria-label={`View full image: ${active.caption}`}
              className="absolute inset-0 z-20 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center border border-white/50 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/50">
                <Maximize2 size={16} aria-hidden="true" />
              </span>
            </button>
          </div>

          <div className="flex min-h-[250px] flex-col justify-between p-6 sm:p-9 lg:min-h-0 lg:p-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: reducedMotion ? 0 : 0.35 }}
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

        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5 border border-border/70 p-1.5 sm:mt-7 sm:inline-flex sm:relative sm:left-1/2 sm:-translate-x-1/2">
          {modes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              aria-pressed={mode === item}
              className={`px-3 py-2.5 text-xs transition-colors sm:px-4 ${
                mode === item
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {total > 1 && (
          <div className="mt-6 flex justify-center gap-2" role="group" aria-label="Choose photograph">
            {frames.map((frame, index) => (
              <button
                key={frame.id}
                type="button"
                onClick={() => {
                  if (index === activeIndex) return;
                  setCurtainVisible(true);
                  setTransitionId((id) => id + 1);
                  setActiveIndex(index);
                }}
                aria-label={`Show photograph ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                className={`h-1 transition-all duration-300 ${
                  activeIndex === index
                    ? "w-8 bg-foreground"
                    : "w-3 bg-border hover:bg-muted-foreground"
                }`}
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
