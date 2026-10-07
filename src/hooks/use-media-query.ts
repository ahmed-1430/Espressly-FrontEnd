"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to a media query through `useSyncExternalStore`.
 *
 * `matchMedia` is already an external store, so this avoids a state-in-effect
 * cascade: the server snapshot is always `false` and React swaps to the client
 * value on hydration without a mismatch, because the first client render also
 * reads the server snapshot.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the visitor has asked the OS to reduce motion. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}