"use client";

import { useEffect } from "react";
import { ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Scroll control for imperative callers.
 *
 * Lenis needs to be told when something other than the user owns the scroll
 * position — an open overlay with a scroll lock, an anchor jump, a focus move
 * the browser decides to scroll for. Without this, a scroll-locked overlay
 * fights the smooth-scroll loop and the page resumes mid-flight.
 *
 * Paused instances are counted rather than flagged, so nested callers cannot
 * resume a scroll that something else still needs suspended.
 */
let pausedCount = 0;

type LenisHandle = {
  stop(): void;
  start(): void;
  scrollTo(target: Element | number, options?: { offset?: number; duration?: number }): void;
};

function getLenis(): LenisHandle | undefined {
  return (window as Window & { __espresslyLenis?: LenisHandle }).__espresslyLenis;
}

/** Suspends smooth scrolling. Safe to call more than once. */
export function stopScroll() {
  const lenis = getLenis();
  if (!lenis) return;
  pausedCount += 1;
  if (pausedCount === 1) lenis.stop();
}

/** Resumes smooth scrolling. Extra calls beyond the matching stop are ignored. */
export function startScroll() {
  const lenis = getLenis();
  if (!lenis) return;
  pausedCount = Math.max(0, pausedCount - 1);
  if (pausedCount === 0) lenis.start();
}

/**
 * Scrolls an element into view beneath the fixed navigation.
 *
 * Falls back to native smooth scrolling when Lenis is not running, so anchors
 * still behave correctly on touch devices and under reduced motion.
 */
export function scrollToId(id: string, navOffset = 76) {
  const target = document.getElementById(id);
  if (!target) return;

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: -navOffset });
    return;
  }

  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - navOffset,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

/**
 * Scrolls back to the top, blurring first so the browser does not re-anchor the
 * viewport to whatever was focused.
 */
export function scrollToTop() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.1 });
    return;
  }
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/**
 * Locks page scrolling while an overlay is open.
 *
 * Two independent locks, because either alone is insufficient:
 *
 *  - Lenis is paused, which is the only thing that stops the smooth-scroll loop
 *    from continuing to drive the position behind the overlay.
 *  - `overflow: hidden` on the body is what actually stops a touch device. Lenis
 *    is deliberately not installed on coarse pointers, so on a phone the paused
 *    Lenis path does not exist and the CSS lock is the only one running.
 *
 * The scrollbar's width is added back as padding so the page does not jump
 * sideways the moment the bar disappears.
 *
 * Locks are reference-counted for the same reason `stopScroll` is: an overlay can
 * be opened from inside another overlay, and the inner one closing must not
 * release the outer one's lock.
 */
let lockCount = 0;

/** Locks the page while `active` is true. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    lockCount += 1;
    if (lockCount === 1) {
      const { body, documentElement } = document;
      body.dataset.scrollLocked = "true";
      // Both elements, not just `body`. `overflow: hidden` on `body` alone is
      // unreliable for the viewport: the scrolling element can still be
      // `documentElement`, in which case the lock does nothing on touch.
      documentElement.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    stopScroll();

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        const { body, documentElement } = document;
        delete body.dataset.scrollLocked;
        documentElement.style.overflow = "";
        body.style.overflow = "";
        body.style.overscrollBehavior = "";
        body.style.paddingRight = "";
        startScroll();
        // Every trigger below the fold was positioned against the pre-lock
        // document height; the scrollbar's width has just changed it.
        ScrollTrigger.refresh();
      } else {
        startScroll();
      }
    };
  }, [active]);
}

/**
 * Re-measures ScrollTrigger after a layout change.
 *
 * Called after the mobile panel closes, because the scroll lock changes the
 * document height by the scrollbar's width and every trigger below the fold
 * would otherwise be positioned against the pre-lock geometry.
 */
export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}