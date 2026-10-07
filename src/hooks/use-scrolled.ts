"use client";

import { useEffect, useState } from "react";

/**
 * True once the window has scrolled past `threshold` pixels.
 *
 * Navigation reads this to move from its transparent over-hero state to the
 * glass state. It is deliberately coarse: only the boundary matters, so React
 * re-renders exactly once per crossing rather than on every scroll frame.
 */
export function useScrolled(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > threshold);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return scrolled;
}