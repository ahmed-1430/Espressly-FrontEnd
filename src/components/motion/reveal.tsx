"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealVariant = "fade-up" | "fade" | "slide-left" | "scale" | "clip";

/**
 * The base reveal primitive.
 *
 * When `stagger` is set and the element has children, each child becomes its own
 * reveal target so the group can cascade. Those children do not carry a
 * `data-reveal` attribute of their own, so the variant is written onto each target
 * explicitly — the CSS keys its hidden and revealed states off that attribute, and
 * a mismatch there would leave the group permanently un-animated.
 *
 * Targets start hidden and are released by an IntersectionObserver, so there is no
 * flash of unstyled content and no layout shift: only opacity and transform
 * animate. Without JavaScript nothing is hidden.
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
  /** Seconds before the first target animates. */
  delay?: number;
  /** Seconds each target takes. */
  duration?: number;
  /** Seconds between targets when revealing a group. */
  stagger?: number;
  /** Viewport inset that triggers the reveal. */
  margin?: string;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  // `variant` is read inside the effect but held in a ref. Every call site passes a
  // literal, and depending on it directly would tear down and rebuild the observer
  // whenever a parent re-rendered.
  const variantRef = useRef(variant);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const activeVariant = variantRef.current;
    const grouped = stagger > 0 && node.children.length > 0;
    const targets = grouped ? Array.from(node.children) : [node];

    targets.forEach((target, index) => {
      const el = target as HTMLElement;
      el.dataset.reveal = activeVariant;
      el.style.setProperty("--reveal-duration", `${duration}s`);
      // Grouped targets are offset individually; a lone target uses `delay` as-is.
      el.style.setProperty(
        "--reveal-delay",
        `${grouped ? delay + stagger * index : delay}s`,
      );
      el.classList.add("reveal-pending");
    });

    const release = (el: Element) => {
      el.classList.add("is-revealed");
      el.classList.remove("reveal-pending");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          release(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );

    for (const target of targets) {
      // A target that mounts already scrolled past will never intersect, so the
      // observer alone would leave it hidden forever. That happens on a reload
      // which restores scroll position, and on any deep link to an anchor below
      // the fold. Release those directly.
      if (target.getBoundingClientRect().bottom < 0) release(target);
      else observer.observe(target);
    }

    return () => {
      observer.disconnect();
      for (const target of targets) {
        target.classList.remove("reveal-pending", "is-revealed");
        delete (target as HTMLElement).dataset.reveal;
      }
    };
  }, [delay, duration, stagger, margin]);

  return (
    <Tag ref={ref} className={cn(className)}>
      {children}
    </Tag>
  );
}