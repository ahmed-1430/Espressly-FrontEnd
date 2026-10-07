"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point for GSAP plugins.
 *
 * Registering here keeps every animation module free of side effects, and makes
 * it impossible to use ScrollTrigger without having loaded it first.
 */
// Registering at module scope is safe: the plugin is imported, not looked up on
// `window`, and registration is idempotent.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Shared easing and duration vocabulary. Every timeline pulls from these so the
 * site moves with one voice instead of a dozen unrelated feels.
 */
export const motion = {
  ease: {
    /** Decelerating, expensive. Entrances. */
    out: "expo.out",
    /** Symmetrical. Pinned and horizontal movement. */
    inOut: "power4.inOut",
    /** Quick depart. Exits. */
    in: "power3.in",
  },
  duration: {
    fast: 0.5,
    base: 0.9,
    slow: 1.4,
  },
  stagger: {
    tight: 0.045,
    base: 0.08,
    loose: 0.14,
  },
} as const;

/** True when the visitor prefers reduced motion. Safe to call during render. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}