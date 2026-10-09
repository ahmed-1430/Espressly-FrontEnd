"use client";

import Link from "next/link";
import { useRef } from "react";
import { HeroEyebrow, HeroMedia, HeroMeta, HeroScrollCue } from "./hero-atoms";
import { HeroEntrance, HeroExit } from "./hero-motion";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { menuCategories, menuItems } from "@/data/menu";

/**
 * MENU hero — "the editorial stack".
 *
 * Full-bleed espresso photography carrying an oversized MENU that overlaps the
 * frame rather than sitting beside it, with the category list running down the
 * right as a table of contents. The intent is that the page states its own
 * importance in the first viewport: this is the thing the café is for.
 *
 * Choreography runs metadata first and the title last, so the word lands after
 * the room has already been established.
 */
export function MenuHero() {
  const rootRef = useRef<HTMLElement>(null);

  const signatureCount = menuItems.filter((item) => item.signature).length;

  return (
    <section
      ref={rootRef}
      aria-labelledby="menu-hero-title"
      className="noise relative isolate min-h-[92svh] overflow-hidden border-b border-border pt-28 lg:min-h-dvh lg:pt-32"
    >
      {/* Media bleeds behind the type; the scrim only has to hold legibility. */}
      <HeroMedia
        src="/images/craft-machine.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        parallax={10}
        delay={0}
        className="absolute inset-0 -z-10 h-full w-full"
      >
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-background-sunken via-background-sunken/60 to-background-sunken/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-background-sunken/90 via-background-sunken/40 to-transparent"
        />
      </HeroMedia>

      <div className="mx-auto flex w-full max-w-[110rem] flex-col px-5 pb-12 sm:px-8 lg:px-12 lg:pb-16">
        <div className="grid flex-1 items-end gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <HeroEyebrow data-hero-stage="eyebrow" className="mb-8">
              Espressly — Queen Street
            </HeroEyebrow>

            {/*
              The title is split by hand rather than by line detection: the mask
              reveal needs stable line boxes, and the break after "Our" is the
              editorial one anyway.
            */}
            <h1
              id="menu-hero-title"
              className="font-display text-[clamp(4.25rem,17vw,15rem)] leading-[0.82] tracking-display"
            >
              <span className="block overflow-hidden">
                <span data-hero-stage="title" className="block">
                  Our
                </span>
              </span>
              <span
                data-hero-stage="title"
                className="block pl-[0.06em] text-accent-bright italic"
              >
                Menu
              </span>
            </h1>

            <div
              data-hero-stage="rule"
              aria-hidden
              className="mt-10 h-px w-full max-w-md bg-linear-to-r from-accent to-transparent"
            />

            <p
              data-hero-stage="copy"
              className="mt-8 max-w-lg text-pretty text-[clamp(1rem,1.35vw,1.1875rem)] leading-relaxed text-foreground-soft"
            >
              Eight categories, one very short list. Everything here is roasted on
              site and pulled on a three-group lever, and the seasonal board changes
              when the week does.
            </p>

            <div data-hero-stage="actions" className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="#categories" variant="primary" arrow>
                Read the list
              </ButtonLink>
              <Link
                href="/shop"
                className="link-sweep text-xs font-medium uppercase tracking-[0.18em] text-foreground-soft hover:text-foreground"
              >
                Beans to take home
              </Link>
            </div>
          </div>

          {/* Table of contents. Hidden on mobile, where it would just add a scroll. */}
          <nav
            aria-label="Menu categories"
            data-hero-stage="meta"
            className="hidden lg:col-span-4 lg:block"
          >
            <p className="micro mb-5 text-muted-foreground">In this menu</p>
            <ol className="border-t border-border">
              {menuCategories.map((category, index) => (
                <li
                  key={category.id}
                  className="flex items-baseline gap-4 border-b border-border py-2.5"
                >
                  <span className="micro w-6 shrink-0 text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-foreground-soft">
                    {category.label}
                  </span>
                  <span className="ml-auto micro text-muted-foreground">
                    {String(
                      menuItems.filter((item) => item.category === category.id).length,
                    ).padStart(2, "0")}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="mt-14 flex items-end justify-between gap-6">
          <HeroMeta
            items={[
              { label: "Categories", value: String(menuCategories.length).padStart(2, "0") },
              { label: "Items", value: String(menuItems.length).padStart(2, "0") },
              {
                label: "Signatures",
                value: String(signatureCount).padStart(2, "0"),
              },
              { label: "Kitchen until", value: "15:00" },
            ]}
            className={cn("flex-1 border-t-0 pt-0")}
          />
          <a href="#categories" className="hidden shrink-0 sm:block">
            <HeroScrollCue />
          </a>
        </div>
      </div>

      <HeroEntrance
        rootRef={rootRef}
        choreography={{
          stages: ["meta", "eyebrow", "title", "rule", "copy", "actions", "cue"],
          stagger: 0.11,
          duration: 1.1,
        }}
      />
      <HeroExit
        rootRef={rootRef}
        targets={[
          { selector: '[data-hero-stage="title"]', yPercent: -22, opacity: 0.15 },
          { selector: '[data-hero-stage="copy"]', yPercent: -12, opacity: 0.2 },
        ]}
      />
    </section>
  );
}