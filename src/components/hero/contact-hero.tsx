"use client";

import { useRef } from "react";
import { HeroEyebrow, HeroMedia } from "./hero-atoms";
import { HeroEntrance, HeroExit } from "./hero-motion";
import { addressLines, location, openingHours, siteConfig } from "@/config/site";

/**
 * CONTACT hero — "the information is the hero".
 *
 * There is no lede paragraph here. Address, telephone, today's hours and the
 * coordinates are the content, set as a directory block beside a tall
 * atmospheric frame — the way a printed menu cover lists its details. Nothing on
 * this page defers the practical information to a section further down.
 */
export function ContactHero() {
  const rootRef = useRef<HTMLElement>(null);

  const today = openingHours[2]; // Wednesday

  return (
    <section
      ref={rootRef}
      aria-labelledby="contact-hero-title"
      className="noise relative overflow-hidden border-b border-border bg-background pt-28 lg:pt-36"
    >
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="relative mx-auto w-full max-w-[110rem] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/*
            `h-full` + `justify-between` so the coordinate rail settles at the
            foot of the column. The frame beside it is portrait and therefore
            much taller than the directory block; left alone that leaves a band
            of dead space under the text.
          */}
          <div className="flex h-full flex-col lg:col-span-5">
            <HeroEyebrow data-hero-stage="eyebrow">Get in touch</HeroEyebrow>

            <h1
              id="contact-hero-title"
              className="mt-7 font-display text-[clamp(3.25rem,11vw,8.5rem)] leading-[0.86] tracking-display"
            >
              <span className="block overflow-hidden">
                <span data-hero-stage="title" className="block">
                  Contact
                </span>
              </span>
            </h1>

            <div
              data-hero-stage="rule"
              aria-hidden
              className="mt-9 h-px w-full max-w-xs bg-linear-to-r from-accent to-transparent"
            />

            {/* Directory block — the hero's actual content. */}
            <dl
              data-hero-stage="copy"
              className="mt-9 grid max-w-md gap-7 sm:grid-cols-2"
            >
              <div className="sm:col-span-2">
                <dt className="micro text-muted-foreground">Address</dt>
                <dd className="mt-2 not-italic">
                  <address className="font-display text-xl leading-snug tracking-display not-italic">
                    {addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </dd>
                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-sweep mt-3 inline-block text-sm text-accent-bright"
                >
                  Open in Maps ↗
                </a>
              </div>

              <div>
                <dt className="micro text-muted-foreground">Today</dt>
                <dd className="mt-2 text-sm text-foreground-soft">
                  {today.day.slice(0, 3)}
                  <br />
                  <span className="tabular-nums">{today.hours}</span>
                </dd>
              </div>

              <div>
                <dt className="micro text-muted-foreground">Direct</dt>
                <dd className="mt-2 flex flex-col gap-1 text-sm text-foreground-soft">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="link-sweep w-fit"
                  >
                    {siteConfig.email}
                  </a>
                  <a
                    href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                    className="link-sweep w-fit tabular-nums"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>

            {/* Coordinate rail, settled at the foot of the column. */}
            <p
              data-hero-stage="meta"
              className="micro mt-12 border-t border-border pt-6 text-muted-foreground lg:mt-auto"
            >
              {location.coordinates.latitude.toFixed(4)}° N —{" "}
              {Math.abs(location.coordinates.longitude).toFixed(4)}° W —{" "}
              {location.name}
            </p>
          </div>

          {/* Tall atmospheric frame, inset from the right edge. */}
          <div className="relative lg:col-span-6 lg:col-start-7">
            <HeroMedia
              src="/images/space-window.jpg"
              alt="A window-side table with a notebook, printed matter and a half-finished coffee."
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              parallax={7}
              delay={0.15}
              className="aspect-4/5 w-full sm:aspect-16/10 lg:aspect-4/5"
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-background-sunken/50 to-transparent"
              />
            </HeroMedia>
          </div>
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{
          stages: ["eyebrow", "title", "rule", "copy", "meta"],
          stagger: 0.1,
          duration: 1.1,
        }}
      />
      <HeroExit
        rootRef={rootRef}
        targets={[{ selector: '[data-hero-stage="title"]', yPercent: -18, opacity: 0.2 }]}
      />
    </section>
  );
}