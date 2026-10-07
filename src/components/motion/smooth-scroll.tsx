"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

/**
 * Module-scoped handle on the active Lenis instance.
 *
 * Anchors and floating controls need to scroll programmatically, and they cannot
 * read the instance across component boundaries. Keeping it here avoids putting
 * a scroll API on a React context that would then have to be threaded through
 * every server-rendered page.
 */
let activeLenis: Lenis | null = null;

/**
 * Scroll to an element, compensating for the fixed navigation.
 *
 * Falls back to native smooth scrolling when Lenis is not running, so anchors
 * still work on touch devices and under reduced motion.
 */
export function scrollToId(id: string, navOffset = 76) {
  const target = document.getElementById(id);
  if (!target) return;

  if (activeLenis) {
    activeLenis.scrollTo(target, { offset: -navOffset });
    return;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - navOffset,
    behavior: reduce ? "auto" : "smooth",
  });
}

/**
 * Smooth scrolling, wired correctly into GSAP.
 *
 * Lenis owns the scroll position and calls `ScrollTrigger.update` on every frame,
 * so pinned and scrubbed timelines stay in step with the interpolated position
 * rather than the native one. Everything is torn down on unmount, and the whole
 * thing is skipped for reduced motion and for touch devices, where native
 * scrolling already feels right.
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
    activeLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      activeLenis = null;
    };
  }, []);

  return null;
}