"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Page transition.
 *
 * The stylesheet used to carry `::view-transition` rules and a comment claiming
 * navigation went through a ViewTransition wrapper. Nothing triggered them: there
 * was no wrapper anywhere, so the rules were dead code describing behaviour the
 * site did not have. This is the real thing.
 *
 * Deliberately enter-only. Animating the exit means intercepting navigation
 * before the router commits, which in the App Router requires either an
 * experimental React API or taking over the click handler for every link in the
 * site. Neither is worth a crossfade; fading the incoming page in reads the same
 * and cannot strand a reader on a page that has begun leaving.
 *
 * The animation is CSS rather than state on purpose. An earlier version held a
 * boolean and reset it in an effect; because the `key` sits on the element this
 * component returns, remounting that element never reset the parent's state, so
 * the transition played on first load and never again. A CSS animation on a keyed
 * element restarts when the element is recreated, because that is what a fresh
 * animation means — there is no state to fall out of sync.
 *
 * Reduced motion is handled globally in globals.css, which clamps every animation
 * to 0.001ms, so nothing here needs to branch on it.
 */
export function PageTransition({
  children,
  className,
  name = "page-enter",
}: {
  children: ReactNode;
  className?: string;
  /** Animation name; see `page-enter` in globals.css. */
  name?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} style={{ animationName: name }} className={className}>
      {children}
    </div>
  );
}