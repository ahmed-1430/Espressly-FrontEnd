"use client";

import { useRef } from "react";
import { HeroEyebrow } from "./hero-atoms";
import { HeroEntrance } from "./hero-motion";
import { SplitLines } from "@/components/motion/split-lines";
import { siteConfig } from "@/config/site";

/**
 * CONTACT hero — no photograph at all.
 *
 * This is the one page where a background image has nothing to do. Somebody
 * arriving here wants an address, a phone number and the hours; a dim bar
 * photograph behind an 8.5rem title delayed all three by a full viewport. The
 * previous version was also the only one of the six carrying a decorative grid
 * overlay, which is exactly the kind of detail the rest of the site had moved
 * away from.
 *
 * So this is type and information. The details that used to sit in a section
 * below the fold are here in the masthead, which is where a visitor actually
 * looks for them.
 */
export function ContactHero() {
  const rootRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={rootRef}
      aria-labelledby="contact-hero-title"
      className="relative border-b border-border pt-16 lg:pt-[76px]"
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 pb-12 pt-10 sm:px-8 sm:pb-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <HeroEyebrow>Get in touch</HeroEyebrow>

            <h1
              id="contact-hero-title"
              className="mt-6 font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.88] tracking-display"
            >
              <SplitLines lines={["Come", "in, or", "write"]} duration={1.05} />
            </h1>

            <p
              data-hero-stage="copy"
              className="mt-7 max-w-sm text-pretty leading-relaxed text-foreground-soft"
            >
              The room is open seven days. We answer messages within a day, and
              usually faster.
            </p>

            <div className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
              <a
                href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}
                className="text-[clamp(1.125rem,2vw,1.5rem)] leading-none text-foreground transition-colors hover:text-accent focus-visible:text-accent"
              >
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-[clamp(1.125rem,2vw,1.5rem)] leading-none text-foreground transition-colors hover:text-accent focus-visible:text-accent"
              >
                {siteConfig.email}
              </a>
            </div>
          </div>

          {/*
            Deliberately not the address or the hours: `ContactDetails` renders
            both, plus a map and a directions link, directly below. Repeating them
            here was the same mistake the gallery made — the same information
            shown twice before the reader has scrolled once.
          */}
          <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <h2 className="micro text-muted-foreground">Where</h2>
            <p className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.1] tracking-display">
              Queen Street West, Toronto
            </p>
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              Seven days a week. The room fills by nine; the espresso does not.
            </p>
          </div>
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{ stages: ["copy"], stagger: 0.12, duration: 1.1 }}
      />
    </section>
  );
}