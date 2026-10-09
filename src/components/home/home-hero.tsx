"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, motionPresets, prefersReducedMotion } from "@/lib/gsap";
import { location, siteConfig } from "@/config/site";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { SplitLines } from "@/components/motion/split-lines";
import { Magnetic } from "@/components/motion/magnetic";
import { formatCoordinates } from "@/lib/cn";

/**
 * Home hero.
 *
 * A full-viewport photograph with the wordmark, an editorial headline set in two
 * masked lines, and a single call to action. GSAP drives three things: the intro
 * timeline on load, a slow scale on the background image, and a scrubbed parallax
 * on the content as the hero scrolls away.
 */
export function HomeHero() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: motionPresets.ease.out, duration: motionPresets.duration.slow },
      });

      timeline
        .from("[data-hero-media]", { scale: 1.14, duration: 2.4 })
        .from("[data-hero-scrim]", { opacity: 1, duration: 1.6 }, 0)
        .from("[data-hero-meta]", { opacity: 0, y: 16, duration: 0.9, stagger: 0.09 }, 0.55)
        .from(
          "[data-hero-cta]",
          { opacity: 0, y: 22, duration: 0.9, stagger: 0.1 },
          0.85,
        )
        .from("[data-hero-rule]", { scaleX: 0, duration: 1.3 }, 0.7)
        .from("[data-hero-scroll]", { opacity: 0, duration: 0.8 }, 1.3);

      // Scrubbed depth: the photograph drifts slower than the content.
      gsap.to("[data-hero-media]", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to("[data-hero-content]", {
        yPercent: 22,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (root?.contains(trigger.trigger as Element)) trigger.kill();
      });
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="noise relative flex min-h-[100svh] items-end overflow-hidden pb-12 pt-28 sm:pb-16 lg:min-h-dvh lg:pb-20"
      aria-label="Espressly — specialty coffee, crafted with intention"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hero-primary.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          // This one genuinely is full-bleed, so 100vw is correct here. The cap
          // keeps very wide displays from requesting an unbounded derivative.
          sizes="100vw"
          data-hero-media
          // Focal point sits right of centre so the cup clears the headline, which
          // occupies the left half of the frame at every breakpoint.
          className="will-change-transform object-cover object-[68%_center] sm:object-[60%_center]"
        />
        {/*
          Three scrims, each with one job. The vertical one carries text
          legibility, the top one guarantees the navigation and logo have contrast
          against whatever the photograph is doing behind them, and the warm radial
          one keeps the espresso tone rather than washing the image grey.
        */}
        <div
          data-hero-scrim
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background-sunken via-background-sunken/45 to-background-sunken/70"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-background-sunken/85 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_100%,rgba(184,118,58,0.16),transparent_60%)]"
        />
      </div>

      <Container className="relative z-10 w-full">
        <div data-hero-content className="max-w-4xl">
          <div
            data-hero-meta
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground"
          >
            <span className="micro text-accent-bright">Est. {siteConfig.founded}</span>
            <span aria-hidden className="h-px w-6 bg-border-strong" />
            <span className="micro">{location.district}</span>
          </div>

          <h1 className="mt-8 text-[clamp(2.75rem,11.5vw,9.5rem)] tracking-display">
            <SplitLines
              as="span"
              lines={["Specialty coffee,", "crafted with", "intention."]}
              delay={0.35}
              stagger={0.1}
            />
          </h1>

          <div
            data-hero-rule
            aria-hidden
            className="hairline-draw mt-10 h-px w-full max-w-md bg-border-strong"
          />

          <p
            data-hero-meta
            className="mt-8 max-w-md text-pretty text-[clamp(1rem,1.4vw,1.1875rem)] leading-relaxed text-foreground-soft"
          >
            One blend, roasted weekly, pulled to order on a three-group lever. We
            would rather make four coffees properly than forty approximately.
          </p>
        </div>

        {/*
          The action row sits outside the `max-w-4xl` measure that holds the
          headline. Inside it, `justify-between` only had 896px to work with and
          the buttons crowded the paragraph; spanning the full container and
          anchoring right sets them opposite the type instead, which is the
          arrangement the rest of the page uses.
        */}
        <div
          data-hero-cta
          className="mt-10 flex flex-wrap items-center gap-4 lg:mt-12 lg:justify-end"
        >
          <Magnetic>
            <ButtonLink href="/menu" size="lg" variant="primary" arrow>
              See the menu
            </ButtonLink>
          </Magnetic>
          <ButtonLink href="/shop" size="lg" variant="outline">
            Shop beans
          </ButtonLink>
        </div>

        <div
          data-hero-scroll
          className="mt-14 flex items-end justify-between gap-6 border-t border-border pt-6"
        >
          <p className="micro text-muted-foreground">
            Open today {siteConfig.phoneDisplay}
          </p>
          <p className="micro text-muted-foreground sm:hidden">
            {formatCoordinates(location.coordinates.latitude, location.coordinates.longitude)}
          </p>
          {/*
            The scroll cue is a pointer affordance. Touch devices get the
            coordinates instead, which is the detail worth carrying on a phone.
          */}
          <a
            href="#featured"
            className="group hidden items-center gap-3 text-muted-foreground transition-colors hover:text-foreground sm:flex"
            aria-label="Scroll to featured coffee"
          >
            <span className="micro">Scroll</span>
            <span
              aria-hidden
              className="relative block h-10 w-px overflow-hidden bg-border-strong"
            >
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[hero-scroll_2.2s_var(--ease-in-out-quart)_infinite] bg-accent" />
            </span>
          </a>
        </div>
      </Container>
    </section>
  );
}