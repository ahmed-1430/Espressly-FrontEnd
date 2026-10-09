"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Smooth scrolling, wired correctly into GSAP.
 *
 * Lenis owns the scroll position and calls `ScrollTrigger.update` on every frame,
 * so pinned and scrubbed timelines stay in step with the interpolated position
 * rather than the native one. The instance is published on `window` so imperative
 * callers — the mobile menu's scroll lock, anchor jumps — can reach it without
 * threading a React context through every server-rendered page.
 *
 * Skipped entirely for reduced motion and for touch devices, where native
 * momentum is already tuned.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Touch devices keep native momentum, which iOS and Android already tune well.
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      smoothWheel: true,
    });

    (window as Window & { __espresslyLenis?: Lenis }).__espresslyLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as Window & { __espresslyLenis?: Lenis }).__espresslyLenis;
    };
  }, []);

  return null;
}