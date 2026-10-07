"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Image with a clip-path reveal and an optional slow parallax drift.
 *
 * The wrapper is masked from the bottom edge upward; the image inside is scaled
 * slightly and settles, which reads as the frame opening rather than fading in.
 * Both effects are transform/clip-path only, so they stay on the compositor.
 */
export function RevealImage({
  children,
  className,
  imageClassName,
  duration = 1.2,
  delay = 0,
  parallax = 0,
  alt,
  ...props
}: ImageProps & {
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  duration?: number;
  delay?: number;
  /** Percentage of extra vertical travel across the element's scroll range. */
  parallax?: number;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    frame.style.setProperty("--reveal-duration", `${duration}s`);
    frame.style.setProperty("--reveal-delay", `${delay}s`);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      frame.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        frame.classList.add("is-revealed");
        observer.disconnect();
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: 0.05 },
    );
    observer.observe(frame);

    let cleanupParallax = () => {};
    if (parallax > 0) {
      // Imported lazily so the module stays usable during server rendering.
      void import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
        if (!imageRef.current) return;
        const ctx = gsap.context(() => {
          gsap.fromTo(
            imageRef.current,
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
        cleanupParallax = () => {
          ctx.revert();
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === frame) trigger.kill();
          });
        };
      });
    }

    return () => {
      observer.disconnect();
      cleanupParallax();
    };
  }, [duration, delay, parallax]);

  return (
    <div
      ref={frameRef}
      data-reveal="clip"
      className={cn("reveal-pending relative overflow-hidden", className)}
    >
      <div
        ref={imageRef}
        className={cn("absolute inset-0", imageClassName)}
        style={parallax > 0 ? { inset: "-8% 0" } : undefined}
      >
        <Image alt={alt} {...props} className="h-full w-full object-cover" />
      </div>
      {children}
    </div>
  );
}