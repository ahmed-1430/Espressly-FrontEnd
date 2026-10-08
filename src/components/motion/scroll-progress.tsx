"use client";

import { useEffect, useRef } from "react";

type Props = {
  /** Stay hidden until the page has scrolled this far. */
  threshold?: number;
};

/**
 * Scroll progress indicator.
 *
 * A one-pixel rule that fills from the left as the page scrolls, pinned under the
 * navigation. It gives long editorial pages a sense of position without adding a
 * persistent floating widget, and it updates on rAF rather than on scroll events.
 */
export function ScrollProgress({ threshold = 0 }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const wrap = wrapRef.current;
    if (!bar || !wrap) return;

    let frame = 0;

    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;

      if (scrollable <= 0) {
        bar.style.transform = "scaleX(0)";
        wrap.style.opacity = "0";
        return;
      }

      // Short pages have nowhere to go, so the rule stays out of the way.
      wrap.style.opacity = y > threshold ? "1" : "0";
      const ratio = Math.min(1, Math.max(0, y / scrollable));
      bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="fixed inset-x-0 top-16 z-[99] h-px opacity-0 transition-opacity duration-500 lg:top-[76px]"
    >
      <div
        ref={barRef}
        className="h-full origin-left bg-accent will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}