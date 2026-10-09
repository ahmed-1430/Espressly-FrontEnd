"use client";

import { useEffect, useRef } from "react";
import { gsap, motionPresets, prefersReducedMotion } from "@/lib/gsap";

/**
 * Staged hero entrance.
 *
 * A single ordered timeline for the pieces of a hero: media, then metadata,
 * then the title lines, then supporting copy and calls to action. Variants pass
 * different orderings and timings so no two pages arrive the same way.
 *
 * Elements opt in by carrying `data-hero-stage`; the variant names the groups
 * in the sequence it wants. Anything untagged is left alone.
 */
type Stage =
  | "media"
  | "eyebrow"
  | "rule"
  | "title"
  | "copy"
  | "actions"
  | "meta"
  | "cue";

export type HeroChoreography = {
  /** Stage names, in the order they should arrive. */
  readonly stages: readonly Stage[];
  /** Stagger between individual elements within one stage. */
  readonly stagger?: number;
  readonly duration?: number;
};

export function HeroEntrance({
  rootRef,
  choreography,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  choreography: HeroChoreography;
}) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      gsap.set(root.querySelectorAll<HTMLElement>("[data-hero-stage]"), {
        opacity: 1,
        y: 0,
        scale: 1,
      });
      return;
    }

    const { stages, stagger = 0.09, duration = 1.15 } = choreography;

    const ctx = gsap.context(() => {
      // Everything tagged starts hidden, so there is no flash of unstyled
      // content before the timeline is built.
      const tagged = root.querySelectorAll<HTMLElement>("[data-hero-stage]");
      gsap.set(tagged, { opacity: 0, y: 22 });

      const timeline = gsap.timeline({
        defaults: { ease: motionPresets.ease.out, duration },
      });
      timelineRef.current = timeline;

      for (const stage of stages) {
        const elements = root.querySelectorAll<HTMLElement>(
          `[data-hero-stage="${stage}"]`,
        );
        if (!elements.length) continue;

        timeline.to(elements, {
          opacity: 1,
          y: 0,
          duration: stage === "title" ? 1.25 : duration,
          stagger,
        });
      }
    }, root);

    return () => {
      timelineRef.current?.kill();
      ctx.revert();
    };
    // `choreography` is a module-level constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/**
 * Parallax and fade for a hero as the page scrolls away.
 *
 * Separate from the entrance because it must not re-run when the entrance's
 * dependencies change, and because it needs a ScrollTrigger rather than a
 * timeline.
 *
 * Note the explicit `fromTo` rather than `to`: a bare `to` reads whatever the
 * element's opacity is when the tween is created. This effect runs in the same
 * commit as the entrance, which has already set that value to 0 and not yet
 * animated it away — so the exit would capture 0 and pin the title invisible
 * even at the top of the page.
 */
export function HeroExit({
  rootRef,
  targets,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  /** Elements to drift and fade as the hero leaves. */
  targets: { selector: string; yPercent?: number; opacity?: number; scale?: number }[];
}) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      for (const target of targets) {
        const elements = root.querySelectorAll(target.selector);
        if (!elements.length) continue;

        gsap.fromTo(
          elements,
          { yPercent: 0, opacity: 1, scale: 1 },
          {
            yPercent: target.yPercent ?? 0,
            opacity: target.opacity ?? 1,
            scale: target.scale ?? 1,
            ease: "none",
            immediateRender: true,
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, root);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}