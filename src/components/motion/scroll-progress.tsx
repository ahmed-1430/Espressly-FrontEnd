"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Reading progress indicator.
 *
 * A hairline pinned to the very top edge of the viewport, above all content,
 * filling left to right as the page is read.
 *
 * Two decisions worth recording:
 *
 * It is driven by a ScrollTrigger rather than a scroll listener. ScrollTrigger
 * fires from the same ticker as GSAP, and `SmoothScroll` forwards Lenis's
 * interpolated position into that ticker — so the bar tracks the position the
 * page is *visually* at, not the position the native scroller has already been
 * told about. With a raw listener the bar visibly lags the content on fast
 * momentum scrolls.
 *
 * `fastScrollEnd` ends the progress at the last scrollable pixel rather than at
 * the bottom of the document, which is where a naive ratio would stop short.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          // Resolves to the maximum scrollable offset, so the bar completes
          // exactly as the last content reaches the top of the viewport.
          end: () =>
            ScrollTrigger.maxScroll(window) > 0
              ? ScrollTrigger.maxScroll(window)
              : document.documentElement.scrollHeight - window.innerHeight,
          scrub: reduce ? true : 0.35,
          invalidateOnRefresh: true,
        },
      });
    });

    return () => {
      context.revert();
    };
  }, []);

  return (
    <div
      aria-hidden
      // A stable hook. `verify:progress` used to find this by the shape
      // `[aria-hidden="true"].fixed.top-0`, which the custom cursor's ring also
      // matches — and the ring renders first, so the gate began asserting against
      // a 30px circle instead of the 1px bar. Identity beats class-shape.
      data-scroll-progress=""
      className="pointer-events-none fixed inset-x-0 top-0 z-[140] h-px"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left scale-x-0 bg-linear-to-r from-accent-deep via-accent to-accent-bright will-change-transform"
      />
    </div>
  );
}