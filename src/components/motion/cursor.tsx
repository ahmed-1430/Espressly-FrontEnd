"use client";

import { useEffect, useRef } from "react";

/**
 * A restrained motion cursor for pointer devices.
 *
 * A small copper dot follows the pointer closely while a slower ring trails
 * behind. Over interactive elements the ring grows; over anything marked
 * `data-cursor="view"` or `"drag"` it also carries a label. Disabled on touch
 * devices and under reduced motion, hidden after a moment of stillness, and
 * always aria-hidden so it never reaches assistive technology.
 *
 * ---------------------------------------------------------------------------
 * Two things this version exists to get right.
 *
 * It renders unconditionally. The previous version returned `null` until an
 * `enabled` state flipped true, but the effect that flipped it bailed on
 * `if (!dotRef.current || !ringRef.current) return` — and those refs are null
 * precisely because nothing was rendered. So it never enabled, and the cursor
 * has never appeared on this site. The markup is always in the document and
 * visibility is driven entirely by CSS off `html[data-cursor]`, which also
 * removes the hydration flash a conditional render would cause.
 *
 * Pointer state never enters React. Every `pointermove` called `setState`, so
 * React was asked to reconcile at pointer frequency. State lives in a ref and is
 * written straight to style, so a move costs two property writes and no
 * reconciliation at all.
 */
type CursorState = "default" | "link" | "view" | "drag" | "text";

const RING_SIZE: Record<CursorState, number> = {
  default: 30,
  link: 46,
  view: 84,
  drag: 60,
  text: 2,
};

const DOT_SIZE: Record<CursorState, number> = {
  default: 4,
  link: 5,
  view: 2,
  drag: 2,
  text: 2,
};

const RING_LABEL: Partial<Record<CursorState, string>> = {
  view: "View",
  drag: "Drag",
};

const EASE = "cubic-bezier(0.16,1,0.3,1)";

export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const fine =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    if (!fine || reduce) return;

    root.dataset.cursor = "on";
    // Suppress the native cursor only where the custom one actually replaces
    // it. Text fields keep their caret — the custom cursor is hidden there, so
    // suppressing the native one would leave a reader with no cursor at all.
    const style = document.createElement("style");
    style.dataset.cursorStyle = "on";
    style.textContent = `
      html[data-cursor='on'] a,
      html[data-cursor='on'] button,
      html[data-cursor='on'] [data-cursor] { cursor: none; }
      html[data-cursor='on'][data-cursor-idle='on'] a,
      html[data-cursor='on'][data-cursor-idle='on'] button { cursor: auto; }
    `;
    document.head.appendChild(style);

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let dotX = pointerX;
    let dotY = pointerY;
    let ringX = pointerX;
    let ringY = pointerY;
    let state: CursorState = "default";
    let pressed = false;

    let frame = requestAnimationFrame(function tick() {
      // Fixed lerp per frame, not per event, so the trail is identical whether
      // the pointer is moving or still — a speed-corrected follow reads as lag
      // on one machine and as snap on another.
      dotX += (pointerX - dotX) * 0.45;
      dotY += (pointerY - dotY) * 0.45;
      ringX += (pointerX - ringX) * 0.16;
      ringY += (pointerY - ringY) * 0.16;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = requestAnimationFrame(tick);
    });

    const applyState = (next: CursorState) => {
      if (next === state) return;
      state = next;

      const size = RING_SIZE[next];
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      // Re-centre by moving the margin with the size, so the ring grows about
      // the pointer rather than drifting down and right as it expands.
      ring.style.marginLeft = `${-size / 2}px`;
      ring.style.marginTop = `${-size / 2}px`;

      const dotSize = DOT_SIZE[next];
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.marginLeft = `${-dotSize / 2}px`;
      dot.style.marginTop = `${-dotSize / 2}px`;

      const label = RING_LABEL[next] ?? "";
      if (labelRef.current) {
        labelRef.current.textContent = label;
        labelRef.current.style.opacity = label ? "1" : "0";
      }
      ring.style.backgroundColor = label ? "rgba(184,118,58,0.14)" : "transparent";

      // A text field means the reader needs a caret, not a ring.
      root.dataset.cursorText = next === "text" ? "on" : "off";
      ring.style.opacity = next === "text" ? "0" : "";
      dot.style.opacity = next === "text" ? "0" : "";
    };

    let idleTimer = 0;
    const wake = () => {
      root.dataset.cursorIdle = "off";
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        root.dataset.cursorIdle = "on";
      }, 2400);
    };

    const resolveState = (target: EventTarget | null): CursorState => {
      const el = target as Element | null;
      if (!el || typeof el.closest !== "function") return "default";

      // Text entry takes precedence: showing a ring over a caret is the clearest
      // way for a custom cursor to make a site feel broken.
      if (el.closest("input, textarea, [contenteditable]")) return "text";

      const hit = el.closest<HTMLElement>("a, button, [data-cursor], select, summary");
      if (!hit) return "default";
      const label = hit.dataset.cursor;
      return label === "view" || label === "drag" || label === "link"
        ? label
        : "link";
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      applyState(resolveState(event.target));
      wake();
    };

    const onDown = (event: PointerEvent) => {
      pressed = true;
      ring.style.setProperty("--cursor-press", "0.86");
      applyState(resolveState(event.target));
      wake();
    };
    const onUp = (event: PointerEvent) => {
      pressed = false;
      ring.style.setProperty("--cursor-press", "1");
      applyState(resolveState(event.target));
    };

    // Leaving the window must hide the cursor, or a stale ring is left parked
    // wherever the pointer last was.
    const onLeave = () => {
      root.dataset.cursorIdle = "on";
    };
    const onEnter = () => {
      root.dataset.cursorIdle = "off";
      wake();
    };
    const onBlur = () => {
      root.dataset.cursorIdle = "on";
    };
    const onScroll = (event: Event) => {
      // Scrolling moves content under a stationary pointer, so the element
      // beneath it changes without any pointermove firing.
      applyState(resolveState(event.target));
    };

    // Establish the opening state, and only then reveal, so the cursor never
    // appears mid-transition with a stale size.
    applyState("default");
    root.dataset.cursorIdle = "off";

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("scroll", onScroll, { capture: true });
      style.remove();
      delete root.dataset.cursor;
      delete root.dataset.cursorIdle;
      delete root.dataset.cursorText;
      // `pressed` is read only inside the handlers; referenced here so the
      // cleanup path documents that no press state outlives the listener.
      void pressed;
    };
  }, []);

  return (
    <>
      {/* Kept in the DOM at all times; opacity is the only thing that varies. */}
      <div
        aria-hidden
        data-cursor-ring=""
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] flex items-center justify-center rounded-full border border-accent/70 opacity-0"
        style={{
          width: 30,
          height: 30,
          marginLeft: -15,
          marginTop: -15,
          transformOrigin: "center",
          willChange: "transform, width, height",
          transition: `width 420ms ${EASE}, height 420ms ${EASE}, opacity 220ms ease, background-color 300ms ease, scale 180ms ${EASE}`,
          scale: "var(--cursor-press, 1)",
        }}
      >
        <span
          ref={labelRef}
          className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-accent-bright"
          style={{ opacity: 0 }}
        />
      </div>

      <div
        aria-hidden
        data-cursor-dot=""
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[121] rounded-full bg-accent-bright opacity-0"
        style={{ width: 4, height: 4, marginLeft: -2, marginTop: -2, willChange: "transform" }}
      />

      {/*
        Visibility is driven from <html> so it can be expressed as CSS without a
        re-render, and so `opacity` on the elements above stays free to carry the
        per-state animation rather than being overwritten by a class.
      */}
      <style>{`
        html[data-cursor='on'] [data-cursor-ring],
        html[data-cursor='on'] [data-cursor-dot] { opacity: 1; }
        html[data-cursor='on'][data-cursor-idle='on'] [data-cursor-ring],
        html[data-cursor='on'][data-cursor-idle='on'] [data-cursor-dot] { opacity: 0; }
        html[data-cursor='on'][data-cursor-text='on'] [data-cursor-ring],
        html[data-cursor='on'][data-cursor-text='on'] [data-cursor-dot] { opacity: 0; }
      `}</style>
    </>
  );
}