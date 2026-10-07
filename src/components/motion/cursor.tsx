"use client";

import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "link" | "view" | "drag";

const RING_SIZE: Record<CursorState, number> = {
  default: 30,
  link: 46,
  view: 82,
  drag: 60,
};

const RING_LABEL: Partial<Record<CursorState, string>> = {
  view: "View",
  drag: "Drag",
};

/**
 * A restrained custom cursor for pointer devices.
 *
 * A small copper dot follows the pointer closely while a slower ring trails
 * behind. Over interactive elements the ring grows; over anything marked
 * `data-cursor="view"` or `"drag"` it also carries a label. The whole thing is
 * disabled on touch devices and under reduced motion, hidden after a few seconds
 * of stillness, and always aria-hidden so it never reaches assistive technology.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("default");

  useEffect(() => {
    const root = document.documentElement;
    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    setEnabled(true);
    root.dataset.cursor = "on";

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let dotX = pointerX;
    let dotY = pointerY;
    let ringX = pointerX;
    let ringY = pointerY;
    let frame = requestAnimationFrame(function tick() {
      dotX += (pointerX - dotX) * 0.45;
      dotY += (pointerY - dotY) * 0.45;
      ringX += (pointerX - ringX) * 0.15;
      ringY += (pointerY - ringY) * 0.15;
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      frame = requestAnimationFrame(tick);
    });

    let idleTimer = 0;
    const wake = () => {
      root.dataset.cursorIdle = "off";
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        root.dataset.cursorIdle = "on";
      }, 2400);
    };

    const resolveState = (target: EventTarget | null): CursorState => {
      const el = (target as Element | null)?.closest<HTMLElement>(
        "a, button, [data-cursor]",
      );
      if (!el) return "default";
      const label = el.dataset.cursor;
      return label === "view" || label === "drag" || label === "link"
        ? label
        : "link";
    };

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      setState(resolveState(event.target));
      wake();
    };

    const onDown = (event: PointerEvent) => setState(resolveState(event.target));
    const onUp = (event: PointerEvent) => setState(resolveState(event.target));
    const onLeave = () => {
      root.dataset.cursorIdle = "on";
    };
    const onEnter = () => {
      root.dataset.cursorIdle = "off";
    };

    wake();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      delete root.dataset.cursor;
      delete root.dataset.cursorIdle;
    };
  }, []);

  if (!enabled) return null;

  const size = RING_SIZE[state];
  const label = RING_LABEL[state];

  return (
    <>
      <style>{`
        html[data-cursor='on'] a,
        html[data-cursor='on'] button,
        html[data-cursor='on'] [data-cursor] { cursor: none; }
        html[data-cursor='on'][data-cursor-idle='on'] a,
        html[data-cursor='on'][data-cursor-idle='on'] button { cursor: auto; }
      `}</style>

      <div
        aria-hidden
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[120] flex items-center justify-center rounded-full border border-accent/70"
        style={{
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          transition:
            "width 420ms cubic-bezier(0.16,1,0.3,1), height 420ms cubic-bezier(0.16,1,0.3,1), opacity 300ms ease, background-color 300ms ease",
          backgroundColor: label ? "rgba(184,118,58,0.14)" : "transparent",
        }}
      >
        <span
          className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-accent-bright transition-opacity duration-300"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label}
        </span>
      </div>

      <div
        aria-hidden
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[121] h-1 w-1 rounded-full bg-accent-bright"
        style={{ marginLeft: -2, marginTop: -2 }}
      />
    </>
  );
}