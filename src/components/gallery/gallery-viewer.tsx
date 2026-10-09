"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { galleryFrames } from "@/data/gallery";
import { useScrollLock } from "@/lib/scroll";

/**
 * Full-screen gallery viewer.
 *
 * Built on Motion rather than a native `<dialog>` so the image can cross-fade
 * and slide on direction change — a dialog can only fade as a whole, which makes
 * stepping through a set feel like the same frame flickering rather than moving.
 *
 * Accessibility is native and not re-implemented: `role="dialog"`,
 * `aria-modal`, Escape, and a Tab trap inside the panel, plus scroll lock with
 * focus restoration.
 *
 * Touch: horizontal drag tracks the pointer and dismisses past a threshold,
 * otherwise commits to the previous/next frame.
 */
export function GalleryViewer({
  index,
  onClose,
  onStep,
}: {
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const frame = galleryFrames[index];
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const filmstripRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);

  /*
   * Keep the current frame's thumbnail in view.
   *
   * Eighteen thumbs overflow the strip at almost every viewport, so stepping with
   * the arrow keys or swiping would otherwise walk the selection out of sight —
   * the outline marking the current frame scrolls away while it is still the
   * current frame.
   */
  useEffect(() => {
    const strip = filmstripRef.current;
    const thumb = activeThumbRef.current;
    if (!strip || !thumb) return;

    const stripBox = strip.getBoundingClientRect();
    const thumbBox = thumb.getBoundingClientRect();
    if (thumbBox.left >= stripBox.left && thumbBox.right <= stripBox.right) return;

    strip.scrollTo({
      left: strip.scrollLeft + (thumbBox.left - stripBox.left) - strip.clientWidth / 2 + thumb.clientWidth / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [index, reduce]);

  const handlePrevious = useCallback(() => onStep(-1), [onStep]);
  const handleNext = useCallback(() => onStep(1), [onStep]);

  /* --- horizontal swipe --- */
  const pointerStart = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const onPointerDown = (event: React.PointerEvent) => {
    // Mouse drags should select the image instead of swiping it.
    if (event.pointerType === "mouse") return;
    pointerStart.current = event.clientX;
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (pointerStart.current === null) return;
    // Resist vertical so the gesture stays horizontal.
    const delta = event.clientX - pointerStart.current;
    setDragOffset(delta * 0.55);
  };

  const onPointerUp = () => {
    if (pointerStart.current === null) return;
    const threshold = 70;
    if (dragOffset < -threshold) handleNext();
    else if (dragOffset > threshold) handlePrevious();
    pointerStart.current = null;
    setDragOffset(0);
  };

  /* --- scroll lock, focus, Escape, arrows, Tab trap --- */
  useScrollLock(true);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [onClose, handleNext, handlePrevious]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
      className="fixed inset-0 z-[150] flex flex-col bg-background-sunken/97 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      ref={panelRef}
    >
      {/* --- header: counter + close --- */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-8">
        <p className="micro text-muted-foreground">
          <span className="text-accent-bright">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mx-2 text-border-strong">/</span>
          {String(galleryFrames.length).padStart(2, "0")}
          <span className="mx-3 hidden text-border-strong sm:inline">·</span>
          <span className="hidden sm:inline">{frame.meta}</span>
        </p>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="-mr-3 flex h-12 items-center gap-3 px-1 text-muted-foreground transition-colors duration-300 hover:text-foreground"
        >
          <span className="micro">Close</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            className="h-5 w-5"
          >
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
          <span className="sr-only">Close gallery viewer</span>
        </button>
      </div>

      {/* --- image ---
          Swipe is implemented with pointer events rather than Motion's drag
          gesture: the type for `onDragEnd` collides with React's native drag
          handler across Motion versions, and a raw pointer delta is both simpler
          and identical in behaviour on every browser. */}
      <div
        className="relative min-h-0 flex-1 touch-pan-y select-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ x: dragOffset }}
          transition={dragOffset ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={frame.id}
              className="absolute inset-0"
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, x: 28, scale: 0.985 }
              }
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
              transition={
                reduce
                  ? { duration: 0.15 }
                  : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="100vw"
                className="object-contain px-4 py-6 sm:px-20 sm:py-10"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Arrows sit outside the swipe surface so a drag never starts on them. */}
        <ViewerArrow side="left" onClick={handlePrevious} label="Previous image" />
        <ViewerArrow side="right" onClick={handleNext} label="Next image" />
      </div>

      {/* --- caption + filmstrip --- */}
      <div className="shrink-0 border-t border-border px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-lg text-pretty leading-relaxed text-foreground-soft">
            {frame.caption}
          </p>
          <p className="micro hidden text-muted-foreground lg:block">
            Swipe or use ← → to move — Esc to close
          </p>
        </div>

        {/* Filmstrip doubles as a position indicator and a jump target. */}
        <div
          ref={filmstripRef}
          className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {galleryFrames.map((entry, entryIndex) => (
            <button
              key={entry.id}
              type="button"
              ref={entryIndex === index ? activeThumbRef : undefined}
              onClick={() => onStep(entryIndex - index)}
              aria-label={`Go to ${entry.meta} — ${entry.caption}`}
              aria-current={entryIndex === index ? "true" : undefined}
              className={`relative h-12 w-16 shrink-0 overflow-hidden transition-opacity duration-300 sm:h-14 sm:w-20 ${
                entryIndex === index ? "opacity-100" : "opacity-40 hover:opacity-80"
              }`}
            >
              <Image
                src={entry.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
              {entryIndex === index ? (
                <span
                  aria-hidden
                  className="absolute inset-0 border border-accent"
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ViewerArrow({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  const isLeft = side === "left";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group absolute top-1/2 hidden h-16 w-16 -translate-y-1/2 items-center justify-center border border-border bg-background/50 text-foreground-soft backdrop-blur-sm transition-colors duration-300 hover:border-accent hover:text-accent-bright sm:flex ${
        isLeft ? "left-4 lg:left-8" : "right-4 lg:right-8"
      }`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        vectorEffect="non-scaling-stroke"
        className={`h-3 w-7 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
          isLeft
            ? "group-hover:-translate-x-1"
            : "group-hover:translate-x-1"
        }`}
      >
        <path
          d={isLeft ? "M24 6H3m0 0 5-5M3 6l5 5" : "M0 6h21m0 0-5-5m5 5-5 5"}
        />
      </svg>
    </button>
  );
}