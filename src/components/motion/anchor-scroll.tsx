"use client";

import { useEffect } from "react";
import { scrollToId } from "@/lib/scroll";

/**
 * Routes in-page anchors through the smooth-scroll layer.
 *
 * A single delegated listener rather than a wrapper component at each call site.
 * There are anchors in the layout, all five heroes and the home page, and they
 * are written as plain `href="#id"` — which is what they should look like in the
 * markup. Wrapping each one would mean threading a client component through
 * server-rendered heroes for no gain, and a missed wrapper is a broken jump that
 * nothing would catch.
 *
 * Plain anchors are wrong here: they land the target underneath the fixed
 * header and fight the scroll interpolation instead of driving it.
 *
 * The listener runs in the capture phase and calls `stopPropagation`. A hash
 * href on a Next `<Link>` is handled by React at the root container: that
 * handler calls `preventDefault` and performs its own jump to the very top of
 * the viewport. A bubble-phase listener sees `defaultPrevented` already set and
 * would quietly do nothing, leaving the two link flavours behaving differently.
 */
export function AnchorScroll() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      // Respect modified clicks so "open in new tab" still works on an anchor.
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#" || !href.startsWith("#")) return;

      const id = href.slice(1);
      if (!document.getElementById(id)) return;

      event.preventDefault();
      // Stop the event before it reaches React's root listener. A hash href on
      // a Next `<Link>` is intercepted there: its handler calls preventDefault
      // and performs its own jump to the top of the viewport, which both defeats
      // the offset and would win over anything this listener did. Owning the
      // event outright is the only way both link flavours behave the same.
      event.stopPropagation();
      scrollToId(id);

      // Move focus to the destination so keyboard and screen reader users follow
      // the jump. The target is not focusable, so the section is given a
      // temporary tabindex rather than the focus being left behind on the link.
      const target = document.getElementById(id);
      if (target) {
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
          target.addEventListener(
            "blur",
            () => target.removeAttribute("tabindex"),
            { once: true },
          );
        }
        target.focus({ preventScroll: true });
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}