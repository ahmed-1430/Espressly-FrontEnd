"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { galleryFrames } from "@/data/gallery";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * A contact sheet that moves sideways as the page scrolls down.
 *
 * The gallery above and below is a vertical sequence of spreads — one frame at a
 * time, at reading scale. This band is the opposite: the whole set at once, small,
 * travelling. Placing it between the spreads gives the page a change of pace, the
 * way a filmstrip interrupts a sequence of stills.
 *
 * Three decisions worth recording, because each has a cheaper alternative that
 * does not work:
 *
 * Pinning is done on desktop only. A pin holds a section in place while the page
 * scrolls past it, which on a touch device means the reader cannot reach the
 * content below until they have finished a gesture they did not ask for. Below
 * `lg` the track becomes an ordinary horizontal scroller with snap points, which is
 * native, expected, and never traps anyone.
 *
 * The travel distance is measured rather than guessed. `end` is a function of the
 * track's own overflow, so the pin releases exactly when the last frame reaches
 * the right edge. A hardcoded multiple either leaves dead scroll after the last
 * frame or cuts the strip short on a wide display.
 *
 * `invalidateOnRefresh` is on, because the track's width depends on the viewport
 * and on how many frames each media query shows.
 */
export function HorizontalFrames({ count = 12 }: { count?: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const frames = galleryFrames.slice(0, count);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let ctx: { revert(): void } | undefined;

    // Only pin where there is a pointer and room for it. MatchMedia on the
    // ScrollTrigger side keeps the pin from being created at all on narrow
    // viewports, rather than creating it and then reversing it.
    const desktop = window.matchMedia("(min-width: 1024px)");

    const build = () => {
      if (cancelled) return;

      if (!desktop.matches) {
        // Nothing to do: the track is a plain scroller in the markup.
        return;
      }

      const overflow = track.scrollWidth - window.innerWidth;
      if (overflow <= 0) return;

      ctx = gsap.context(() => {
        gsap.to(track, {
          x: -overflow,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // Pin for exactly the length of the horizontal travel, plus a little
            // so the first and last frames are both readable while settled.
            end: () => `+=${overflow + window.innerHeight * 0.4}`,
            pin: true,
            scrub: reduceScrub(),
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Each frame drifts a little slower than the track, so the strip has
        // depth rather than reading as a flat conveyor belt.
        for (const frame of track.querySelectorAll<HTMLElement>("[data-drift]")) {
          gsap.to(frame, {
            xPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${overflow + window.innerHeight * 0.4}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }
      }, section);
    };

    build();
    desktop.addEventListener("change", build);

    return () => {
      cancelled = true;
      desktop.removeEventListener("change", build);
      ctx?.revert();
    };
  }, [count]);

  return (
    <section
      ref={sectionRef}
      aria-label="The set at a glance"
      className="relative overflow-hidden border-y border-border bg-background-sunken pt-16 pb-10 lg:pt-24 lg:pb-12"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 sm:px-8 lg:px-12">
        <div className="flex items-baseline justify-between gap-6 pb-8">
          <h2 className="text-[clamp(1.5rem,3.2vw,2.25rem)] tracking-display">
            The set at a glance
          </h2>
          <p className="micro hidden text-muted-foreground lg:block">
            Scroll to travel — or drag, on smaller screens
          </p>
        </div>
      </div>

      {/*
        The track is a plain horizontal scroller in the markup and only becomes a
        pinned scrubbed element on wide viewports. Scrollable content that is not
        focusable is not reachable by keyboard, so the list carries a label and
        each frame is a link into the viewer below.
      */}
      <ul
        ref={trackRef}
        className={cn(
          // The two viewports need opposite box behaviour.
          //
          // Below `lg` this is a native scroller: the box is the width of the
          // viewport and the browser scrolls the content inside it.
          //
          // From `lg` the content is moved by translating the track itself, which
          // only works if the track's box is as wide as its content. Left at block
          // width the track is 1440px wide with roughly 3989px of frames inside
          // it, so translating the element by the 2549px overflow pushes the whole
          // box off screen and the band renders empty — while every frame is still
          // correctly positioned in the DOM, which is exactly why it is easy to
          // miss. The frames have to be inside the box you are moving.
          "flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:gap-6 sm:px-8 lg:w-max lg:overflow-hidden lg:px-12 [&::-webkit-scrollbar]:hidden",
        )}
      >
        {frames.map((frame, index) => (
          <li
            key={frame.id}
            data-drift
            className={cn(
              "relative shrink-0 snap-start overflow-hidden bg-background-raised",
              // An explicit width, not just an aspect ratio. The frame's only child
              // is an absolutely positioned image, so a flex item with no width of
              // its own has nothing to size against and collapses to zero.
              "w-[62vw] sm:w-[40vw] lg:w-[21vw]",
              // Alternating heights so the strip has a rhythm rather than a
              // uniform conveyor of identical rectangles.
              index % 3 === 1 ? "aspect-4/5 lg:mt-16" : "aspect-3/4 lg:mt-0",
            )}
          >
            <a
              href="#frames"
              aria-label={`${frame.meta} — ${frame.caption}`}
              className="group relative block h-full w-full"
            >
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                // Deliberately not lazy. The browser decides what is "near the
                // viewport" from the layout box, before any transform — so in a
                // track that GSAP translates horizontally, the frames that are
                // visually on screen are still laid out far to the right and are
                // never fetched. The band then scrubs across empty space: the
                // geometry is right and the pictures are simply absent.
                loading="eager"
                sizes="(max-width: 640px) 62vw, (max-width: 1024px) 38vw, 21vw"
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background-sunken/90 to-transparent px-4 pb-3 pt-10"
              >
                <span className="micro block text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} — {frame.meta}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Smooth follow on a pointer device, instant under reduced motion. */
function reduceScrub() {
  return prefersReducedMotion() ? true : 0.6;
}