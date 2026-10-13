"use client";

import { motion, useReducedMotion } from "motion/react";

export function GalleryHero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="gallery-hero-title"
      className="border-b border-border/70 pt-24 sm:pt-28 lg:pt-32"
    >
      <div className="mx-auto flex w-full max-w-[110rem] items-end justify-between gap-6 px-5 pb-7 sm:px-8 sm:pb-9 lg:px-12 lg:pb-10">
        <div>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 flex items-center gap-3"
          >
            <span
              aria-hidden="true"
              className="h-px w-7 bg-accent sm:w-9"
            />

            <span className="eyebrow">Visual journal</span>
          </motion.div>

          <h1
            id="gallery-hero-title"
            className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] tracking-display"
          >
            <motion.span
              className="inline-block"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              Gallery
              <span className="text-accent">.</span>
            </motion.span>
          </h1>
        </div>

        <motion.a
          href="#frames"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.55,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="group mb-1 hidden items-center gap-3 border-b border-border pb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:inline-flex"
        >
          Explore the collection
          <span
            aria-hidden="true"
            className="text-accent transition-transform duration-300 group-hover:translate-x-1"
          >
            ↗
          </span>
        </motion.a>
      </div>
    </section>
  );
}