"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Reveal-once that cannot strand content.
 *
 * `useInView` from Motion is the obvious choice and was what this used first, but
 * it fails in a way that only shows up under fast scrolling: the observer is
 * registered on mount, and `once` disconnects it on the first hit. If a frame is
 * mounted while the page is already scrolled past it, it never intersects and
 * never fires, so the panel stays drawn over the photograph permanently. That is
 * not a cosmetic artefact — it hid all eighteen gallery frames under the
 * scripted scroll, and would hide them for anyone who scrolls faster than
 * hydration.
 *
 * Three guarantees instead:
 *   1. Anything already within (or above) the viewport at registration reveals
 *      immediately, so back-navigation and deep links never strand a frame.
 *   2. A timeout releases the reveal regardless, so a missed observer callback
 *      can never leave the subject permanently covered.
 *   3. `once` only disconnects after a genuine intersection.
 */
function useRevealOnce(
  ref: React.RefObject<HTMLElement | null>,
  { once = true, enabled = true }: { once?: boolean; enabled?: boolean },
) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (!enabled || seen) return;
    const node = ref.current;
    if (!node) {
      setSeen(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    // Above the fold counts as seen: the reader has already been offered it.
    if (rect.top < window.innerHeight * 0.88) {
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setSeen(true);
        if (once) observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    observer.observe(node);

    // Safety net, matching SplitLines: never leave a subject behind a curtain.
    const timeout = window.setTimeout(() => {
      setSeen(true);
      observer.disconnect();
    }, 6000);

    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [enabled, once, ref, seen]);

  return seen || !enabled;
}

/**
 * Curtain reveal.
 *
 * The image is uncovered by a set of vertical panels that sweep away in
 * sequence from the centre outward, the way a stage curtain parts, rather than by
 * a single flat wipe. The panels are the mask: each one is a motion.div scaled
 * down on its own axis, and the image beneath is always fully painted, so there
 * is no clip-path to recompute and nothing to rasterise late.
 *
 * Motion rather than GSAP: this is a one-shot component-level entrance with no
 * scroll coupling, so it does not need the ticker or a ScrollTrigger context.
 *
 * Triggered by `useRevealOnce` above rather than Motion's `useInView`, for the
 * stranding reason documented there. The reveal fires once, on entry, with a
 * bottom margin tuned to "just before it is fully on screen" — matching how the
 * rest of the page reveals.
 */
export function CurtainReveal({
  children,
  className,
  /** Number of curtain panels. More panels read as finer cloth. */
  panels = 5,
  duration = 1.05,
  delay = 0,
  /** Seconds between panels opening. */
  stagger = 0.07,
  /** Axis the curtains part along. */
  direction = "vertical",
  /**
   * Edge each panel collapses toward. Defaults to the centre, which is what makes
   * a multi-panel curtain part outward from the middle. Set `bottom` (or `top`)
   * with a single panel to get a plain edge wipe instead of an iris.
   */
  origin = "center",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  panels?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  direction?: "vertical" | "horizontal";
  origin?: "center" | "top" | "bottom" | "left" | "right";
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useRevealOnce(ref, { once, enabled: !reduce });

  return (
    <div ref={ref} className={className} data-curtain={panels}>
      <motion.div
        className="relative h-full w-full"
        data-curtain-body=""
        initial={false}
        animate={
          reduce
            ? undefined
            : inView
              ? { scale: 1, opacity: 1 }
              : { scale: 1.06, opacity: 0 }
        }
        transition={{ duration: duration * 1.1, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {children}
      </motion.div>

      {/* The curtains themselves. aria-hidden and pointer-events-none: they carry
          no meaning and must never intercept a click on the photograph. */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: panels }, (_, index) => {
            // Distance from the centre, so the curtain opens outward from the
            // middle rather than all panels lifting together like a blind.
            const centre = (panels - 1) / 2;
            const order = Math.abs(index - centre);

            return (
              <motion.div
                key={index}
                data-curtain-panel=""
                className="absolute bg-background"
                initial={{ scaleY: 1, scaleX: 1 }}
                animate={inView ? { scaleY: 0, scaleX: 0 } : { scaleY: 1, scaleX: 1 }}
                style={
                  direction === "vertical"
                    ? {
                        left: `${(index / panels) * 100}%`,
                        width: `${100 / panels}%`,
                        top: 0,
                        bottom: 0,
                        transformOrigin: origin,
                      }
                    : {
                        top: `${(index / panels) * 100}%`,
                        height: `${100 / panels}%`,
                        left: 0,
                        right: 0,
                        transformOrigin: origin,
                      }
                }
                transition={{
                  duration,
                  delay: delay + order * stagger,
                  ease: [0.76, 0, 0.24, 1],
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
