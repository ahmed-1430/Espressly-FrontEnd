"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Line-by-line text reveal.
 *
 * Each line is wrapped in its own overflow-hidden mask and slides up from below
 * the mask edge. This is the site's signature type moment: it reads as the words
 * being set rather than fading in, and it never animates the text itself, only
 * the wrapper's transform.
 *
 * Because masking requires a known line height, callers pass lines that are
 * already broken where they want the reveal to happen.
 */
export function SplitLines({
  lines,
  as: Tag = "span",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.11,
  duration = 1.05,
}: {
  lines: readonly ReactNode[];
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  lineClassName?: string;
  /** Seconds before the first line animates. */
  delay?: number;
  /** Seconds between lines. */
  stagger?: number;
  /** Seconds per line. */
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const masks = Array.from(node.querySelectorAll<HTMLElement>(".line-mask"));
    const inner = masks.map((mask) => mask.querySelector<HTMLElement>(":scope > span"));

    if (!masks.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || node.getBoundingClientRect().bottom < 0) {
      masks.forEach((mask) => mask.classList.add("is-revealed"));
      return;
    }

    let observer: IntersectionObserver | null = null;

    const play = () => {
      masks.forEach((mask, index) => {
        mask.style.setProperty("--line-delay", `${delay + stagger * index}s`);
        const child = inner[index];
        if (child) child.style.transitionDuration = `${duration}s`;
        // Next frame, so the initial transform is committed before we release it.
        window.requestAnimationFrame(() => mask.classList.add("is-revealed"));
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        observer = null;
        play();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);

    // Safety net: if the observer never fires (hidden tab, print), reveal anyway.
    const timeout = window.setTimeout(() => {
      observer?.disconnect();
      observer = null;
      play();
    }, 2600);

    return () => {
      window.clearTimeout(timeout);
      observer?.disconnect();
    };
  }, [delay, stagger, duration]);

  // Each line is its own block, so assistive tech would otherwise read the
  // heading as one run-on sentence. An explicit label keeps the accessible text
  // natural while the visual lines stay separate.
  const accessibleText = lines
    .map((line) => (typeof line === "string" ? line : ""))
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("block", className)}
      aria-label={accessibleText || undefined}
    >
      <span aria-hidden className="contents">
        {lines.map((line, index) => (
          <span key={index} className={cn("line-mask", lineClassName)}>
            <span>{line}</span>
          </span>
        ))}
      </span>
    </Tag>
  );
}