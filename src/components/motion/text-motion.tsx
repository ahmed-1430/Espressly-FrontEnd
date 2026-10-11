"use client";

import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Typography motion system.
 *
 * One entrance, deliberately kept distinct from every other so a page does not
 * repeat the same gesture twice in a row. Motion reads as hierarchy when the
 * vocabulary is small and varied; it reads as noise when every heading does the
 * same thing.
 *
 *   FlipText   one label replacing another, as if on a split-flap board. For
 *              state that actually changes — the menu's active category, the
 *              shop's product count. Two call sites, and both are values that
 *              genuinely mutate.
 *
 * The brief also asked for staggered word reveals and word-masked entrances.
 * Both were built and both were cut. Every display heading on this site already
 * sets its line breaks explicitly with `<br />` and is animated by `SplitLines`,
 * which is the masked, staggered entrance the brief is reaching for — a
 * word-level split would either destroy that line breaking or need a second
 * heading primitive doing the same job worse. Shipping them for symmetry with a
 * feature list would have been decoration, not design.
 *
 * Every primitive here keeps the text in the DOM and in the accessibility tree.
 * Nothing is split into per-character spans for screen readers: the visual
 * fragments are marked `aria-hidden` and the real string is exposed once, so a
 * screen reader announces a sentence rather than a sequence of words.
 */

/**
 * A label that flips between values.
 *
 * The outgoing label lifts and the incoming one falls in on the same axis, as if
 * the board split and changed. Both are positioned in the same grid cell so the
 * container never changes size — the classic failure of this effect is layout
 * shift when the two labels differ in height.
 */
export function FlipText({
  children,
  /** Change this to trigger the flip. */
  value,
  as: Tag = "span",
  className,
  duration = 0.62,
  direction = "up",
}: {
  children?: ReactNode;
  value: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  /** `up` lifts out and falls in; `down` is the reverse. */
  direction?: "up" | "down";
}) {
  const reduce = useReducedMotion();
  const out = direction === "up" ? "-110%" : "110%";

  return (
    <Tag className={cn("relative inline-grid overflow-hidden align-bottom", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {/*
          `useIsPresent` has to be read inside the AnimatePresence child, not on
          the parent: the retained outgoing element is frozen at the props it had
          when it was removed, so anything computed in the parent can never reach
          it. Reading presence here is what marks exactly the leaving label inert
          while the incoming one is exposed immediately.
        */}
        <FlipLabel
          key={value}
          label={children ?? value}
          reduce={reduce}
          out={out}
          direction={direction}
          duration={duration}
        />
      </AnimatePresence>
    </Tag>
  );
}

/**
 * One label in a flip. Split out so `useIsPresent` reads the presence of this
 * specific element, which is what `FlipText` needs to expose only the incoming
 * label.
 */
function FlipLabel({
  label,
  reduce,
  out,
  direction,
  duration,
}: {
  label: ReactNode;
  reduce: boolean | null;
  out: string;
  direction: "up" | "down";
  duration: number;
}) {
  const isPresent = useIsPresent();

  return (
    <motion.span
      // Only the current label is exposed. Both spans coexist for the length of
      // the flip, and inside an `aria-live` region that would otherwise announce
      // the outgoing and incoming labels as one run-on string.
      aria-hidden={isPresent ? undefined : true}
      initial={reduce ? { opacity: 0 } : { y: out, opacity: 0 }}
      animate={reduce ? { opacity: 1 } : { y: "0%", opacity: 1 }}
      exit={
        reduce
          ? { opacity: 0 }
          : { y: direction === "up" ? "110%" : "-110%", opacity: 0 }
      }
      transition={{
        duration: reduce ? 0.15 : duration,
        ease: [0.76, 0, 0.24, 1],
      }}
      className="col-start-1 row-start-1 block whitespace-nowrap"
    >
      {label}
    </motion.span>
  );
}