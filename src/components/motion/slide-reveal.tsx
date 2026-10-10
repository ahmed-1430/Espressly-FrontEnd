"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/gsap";

/**
 * Reveals content by sliding it in from one side.
 *
 * The counterpart to `Reveal`, which only ever moves content up. A page built
 * from vertical reveals has one rhythm; alternating the axis is what makes a
 * text-and-image pair read as a composition rather than two stacked blocks —
 * copy entering from the left while its photograph enters from the right.
 *
 * Implemented with the Web Animations API rather than GSAP. This is a one-shot
 * entrance with no scroll coupling, so it does not need the ticker or a context,
 * and leaving it out of GSAP keeps the scroll-driven work auditable.
 *
 * Under reduced motion the element is simply made visible: the point of the
 * preference is that nothing moves, not that something is hidden.
 */
export type SlideDirection = "left" | "right" | "up" | "down";

type Props = {
  children: ReactNode;
  /** Which edge the content travels from. */
  from?: SlideDirection;
  as?: ElementType;
  className?: string;
  /** Seconds to wait before starting. */
  delay?: number;
  duration?: number;
  /** Travel distance as a fraction of the element's own size. */
  distance?: number;
  /** Seconds to wait for the element to enter the viewport. */
  margin?: string;
  /** Play once and stop observing. */
  once?: boolean;
  delayStagger?: number;
};

export function SlideReveal({
  children,
  from = "left",
  as: Tag = "div",
  className,
  delay = 0,
  duration = 1,
  distance = 0.35,
  margin = "0px 0px -12% 0px",
  once = true,
  delayStagger = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const axis = from === "left" || from === "right" ? "X" : "Y";
    const sign = from === "right" || from === "down" ? 1 : -1;

    const styles = getComputedStyle(el);
    const base = styles.transform === "none" ? "" : styles.transform;
    const hidden = `translate${axis}(${sign * distance * 100}%)`;
    el.style.opacity = "0";
    el.style.transform = base ? `${base} ${hidden}` : hidden;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            if (!once) {
              el.style.opacity = "0";
              el.style.transform = hidden;
            }
            continue;
          }
          // Interpolated from the measured transform rather than reset to none, so
          // an ancestor's own transform is not discarded on arrival.
          const fromValue = el.style.transform;
          el.style.opacity = "1";
          el.animate(
            [{ transform: fromValue }, { transform: base ? base : "none" }],
            {
              duration: duration * 1000,
              delay: (delay + delayStagger) * 1000,
              easing: "cubic-bezier(0.16, 1, 0.3, 1)",
              fill: "both",
            },
          );
          if (once) observer.unobserve(el);
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [from, delay, duration, distance, margin, once, delayStagger]);

  return (
    <Tag
      ref={ref}
      className={cn("motion-reduce:transform-none motion-reduce:opacity-100", className)}
    >
      {children}
    </Tag>
  );
}