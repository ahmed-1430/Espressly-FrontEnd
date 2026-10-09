"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Hero atoms.
 *
 * One vocabulary, six compositions. Every hero draws from these so the pages
 * read as one publication while the arrangements stay distinct.
 *
 * `HeroMedia` is the important one: a masked reveal on mount followed by a
 * scrubbed parallax. The mask is a gradient rather than `clip-path` for the
 * reason documented in `Reveal` — clip-path collapses the intersection
 * rectangle, so anything observing it would never fire.
 */
export function HeroMedia({
  children,
  className,
  mediaClassName,
  parallax = 8,
  delay = 0,
  alt,
  ...props
}: ImageProps & {
  children?: ReactNode;
  className?: string;
  mediaClassName?: string;
  /** Percentage of vertical travel across the hero's scroll range. */
  parallax?: number;
  /** Seconds before the mask begins to open. */
  delay?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      frame.dataset.hero = "revealed";
      return;
    }

    frame.dataset.hero = "pending";

    const timer = window.setTimeout(() => {
      frame.dataset.hero = "revealed";
    }, delay * 1000 + 40);

    return () => window.clearTimeout(timer);
  }, [delay]);

  // Parallax is attached to the shared ticker via GSAP, so it stays in step with
  // Lenis' interpolated scroll position instead of the native one.
  useEffect(() => {
    const frame = frameRef.current;
    const media = mediaRef.current;
    if (!frame || !media || parallax <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert(): void } | undefined;
    let cancelled = false;

    void import("@/lib/gsap").then(({ gsap }) => {
      if (cancelled || !mediaRef.current) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          media,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: {
              trigger: frame,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }, frame);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [parallax]);

  return (
    <div
      ref={frameRef}
      data-hero-media
      className={cn("hero-media relative overflow-hidden", className)}
    >
      {/*
        The media box is over-tall by the parallax range so the frame never
        exposes an edge.

        The four edges are set individually rather than with `inset-0` plus a
        vertical override. Two `inset-*` utilities would be the same specificity
        and the winner would come down to stylesheet order, not the order they
        appear here — and a box that resolves to shrink-to-fit width collapses
        the absolutely positioned `fill` image inside it to zero pixels.
      */}
      <div
        ref={mediaRef}
        className={cn(
          "absolute",
          parallax > 0
            ? "inset-x-0 -top-[9%] -bottom-[9%]"
            : "inset-0",
          mediaClassName,
        )}
      >
        <Image alt={alt ?? ""} {...props} className="h-full w-full object-cover" />
      </div>
      {children}
    </div>
  );
}

/**
 * Metadata rail.
 *
 * A row of label/value pairs on a hairline. Used at the foot of most heroes to
 * carry the small factual details a reader wants before scrolling — counts,
 * hours, roast days.
 */
export function HeroMeta({
  items,
  tone = "dark",
  className,
}: {
  items: readonly { label: string; value: string }[];
  tone?: "dark" | "parchment";
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <dl
      className={cn(
        "flex flex-wrap items-center gap-x-10 gap-y-4 border-t py-6",
        tone === "parchment" ? "border-border-dark" : "border-border",
        className,
      )}
    >
      {items.map((entry) => (
        <div key={entry.label} className="flex items-baseline gap-3">
          <dt className="micro text-muted-foreground">{entry.label}</dt>
          <dd
            className={cn(
              "text-sm",
              tone === "parchment" ? "text-ink-espresso" : "text-foreground-soft",
            )}
          >
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The eyebrow + hairline that opens most heroes. */
export function HeroEyebrow({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "parchment";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span
        aria-hidden
        className={cn("h-px w-8", tone === "parchment" ? "bg-accent-deep" : "bg-accent")}
      />
      <span className={cn("eyebrow", tone === "parchment" && "eyebrow-dark")}>
        {children}
      </span>
    </div>
  );
}

/**
 * Scroll cue.
 *
 * A hairline with a travelling segment. Pointer affordance only, so it is hidden
 * on touch where it means nothing.
 */
export function HeroScrollCue({
  label = "Scroll",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("group flex items-center gap-3", className)}>
      <span className="micro text-muted-foreground transition-colors group-hover:text-foreground">
        {label}
      </span>
      <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-border-strong">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[hero-scroll_2.2s_var(--ease-in-out-quart)_infinite] bg-accent" />
      </span>
    </span>
  );
}