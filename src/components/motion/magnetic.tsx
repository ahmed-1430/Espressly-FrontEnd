"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Magnetic attraction for primary controls.
 *
 * The element drifts a short distance toward the pointer and the inner content
 * travels slightly further, which creates depth without the elastic overshoot
 * that makes interaction feel cheap. Disabled on touch and reduced motion.
 */
export function Magnetic({
  children,
  strength = 0.32,
  innerStrength = 0.18,
  className,
}: {
  children: ReactNode;
  /** How much of the pointer offset the wrapper takes, 0–1. */
  strength?: number;
  /** Extra travel for the inner content, for the parallax offset. */
  innerStrength?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    if (reduce || coarse) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    const tick = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      wrap.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      inner.style.transform = `translate3d(${(currentX * (innerStrength / strength || 0.6)).toFixed(2)}px, ${(currentY * (innerStrength / strength || 0.6)).toFixed(2)}px, 0)`;

      if (Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05) {
        running = false;
        frame = 0;
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      targetX = x * strength;
      targetY = y * strength;
      start();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      start();
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
      wrap.style.transform = "";
      inner.style.transform = "";
    };
  }, [strength, innerStrength]);

  return (
    <div ref={wrapRef} className={className}>
      <span ref={innerRef} className="inline-flex will-change-transform">
        {children}
      </span>
    </div>
  );
}