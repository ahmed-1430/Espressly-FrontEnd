"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealVariant = "fade-up" | "fade" | "slide-left" | "scale" | "clip";

/**
 * The base reveal primitive.
 *
 * Targets start hidden in CSS and are released by an IntersectionObserver, so
 * there is no flash of unstyled content and no layout shift: only opacity and
 * transform are animated. If JavaScript never runs the content stays visible,
 * because the hiding rules are scoped to elements this component observes.
 */
export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.9,
  stagger = 0.07,
  margin = "-10% 0px -10% 0px",
  as: Tag = "div",
  className,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Seconds to wait after entering the viewport. */
  delay?: number;
  /** Seconds the transition takes. */
  duration?: number;
  /** Stagger across direct children instead of animating the wrapper itself. */
  stagger?: number;
  /** Viewport inset that triggers the reveal. */
  margin?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targets =
      stagger > 0 && node.children.length > 0
        ? Array.from(node.children)
        : [node];
    const isGroup = targets.length > 1 || targets[0] !== node;

    targets.forEach((target, index) => {
      const el = target as HTMLElement;
      // When revealing a group the delay is per child; otherwise it is the wrapper.
      const offset = isGroup ? delay + stagger * index : delay;
      el.style.setProperty("--reveal-duration", `${duration}s`);
      el.style.setProperty("--reveal-delay", `${offset}s`);
      el.classList.add("reveal-pending");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          entry.target.classList.remove("reveal-pending");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );

    for (const target of targets) observer.observe(target);

    return () => {
      observer.disconnect();
      for (const target of targets) {
        target.classList.remove("reveal-pending", "is-revealed");
      }
    };
  }, [delay, duration, stagger, margin]);

  return (
    <Tag ref={ref} data-reveal={variant} className={cn(className)}>
      {children}
    </Tag>
  );
}