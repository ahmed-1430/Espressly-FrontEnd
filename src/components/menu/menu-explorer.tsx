"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  dietaryLabels,
  menuCategories,
  menuItems,
  type DietaryTag,
  type MenuCategoryId,
  type MenuItem,
} from "@/data/menu";
import { cn } from "@/lib/cn";

/**
 * The menu experience.
 *
 * Filtering is real: the category drives which items are rendered from the data
 * module, and the transition is a two-phase exit/enter so items leave before new
 * ones arrive. That avoids the overlap where both sets are briefly visible and
 * the grid jumps in height.
 *
 * Sticky category navigation on desktop, an edge-bleeding scroll rail on mobile.
 * The rail is `position: sticky` rather than `fixed` so it never detaches from
 * the document flow and never covers the section heading.
 */
export function MenuExplorer() {
  const [active, setActive] = useState<MenuCategoryId>("espresso");
  // `phase` drives the exit/enter transition between categories.
  const [phase, setPhase] = useState<"idle" | "leaving" | "entering">("idle");
  const pendingRef = useRef<MenuCategoryId | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const reduce = useReducedMotion();

  const items = useMemo(
    () => menuItems.filter((item) => item.category === active),
    [active],
  );
  const category =
    menuCategories.find((entry) => entry.id === active) ?? menuCategories[0];

  /**
   * Request a category change.
   *
   * Requests are allowed mid-transition and collapse into a single pending value,
   * so a fast clicker gets the category they landed on rather than being dropped
   * mid-animation.
   */
  function select(next: MenuCategoryId) {
    if (next === active && phase === "idle") return;
    if (next === pendingRef.current) return;
    pendingRef.current = next;
    setPhase("leaving");
  }

  // Two-phase transition: leave the current items, swap the data, then arrive.
  // Kept in an effect so the leaving class is committed before the swap.
  useEffect(() => {
    if (phase === "idle") return;

    if (phase === "leaving") {
      const timer = window.setTimeout(() => {
        const next = pendingRef.current;
        if (!next) {
          setPhase("idle");
          return;
        }
        setActive(next);
        setPhase("entering");
      }, 260);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      pendingRef.current = null;
      setPhase("idle");
    }, 620);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // On first paint, play the enter phase once so the list arrives with the page.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      const timer = window.setTimeout(() => setPhase("entering"), 120);
      return () => window.clearTimeout(timer);
    }
  }, []);

  /*
   * Keep the selected chip visible in the mobile rail.
   *
   * On a narrow screen the categories overflow into a horizontal scroller, so
   * selecting one with the arrow keys would otherwise move focus to a chip that
   * is still off-screen — the ring lands somewhere the reader cannot see.
   *
   * `nearest` keeps the movement minimal and does nothing when the chip is
   * already in view, which is the common case on desktop where the rail does not
   * scroll at all.
   */
  useEffect(() => {
    const chip = tablistRef.current?.querySelector<HTMLElement>(
      `[data-category="${active}"]`,
    );
    if (!chip) return;

    const rail = tablistRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;

    const railBox = rail.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    if (chipBox.left >= railBox.left && chipBox.right <= railBox.right) return;

    rail.scrollTo({
      left: rail.scrollLeft + (chipBox.left - railBox.left) - 16,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active, reduce]);

  function onRegionKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = menuCategories.findIndex((entry) => entry.id === active);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (index + delta + menuCategories.length) % menuCategories.length;
    const next = menuCategories[nextIndex];

    event.preventDefault();
    select(next.id);
    // Keep the newly selected chip focused for keyboard users.
    window.requestAnimationFrame(() => {
      regionRef.current
        ?.querySelector<HTMLButtonElement>(`[data-category="${next.id}"]`)
        ?.focus();
    });
  }

  return (
    <div>
      {/*
        Category navigation.

        Sticky rather than fixed, so it stays part of the document flow and never
        overlaps the section heading. Below `lg` the chips scroll horizontally
        inside a full-bleed rail; from `lg` the rail becomes a static flex row
        with the live count beside it.
      */}
      <div className="sticky top-16 z-40 -mx-5 border-y border-border bg-background/90 backdrop-blur-md sm:-mx-8 lg:top-[76px] lg:mx-0 lg:border-x-0 lg:border-t-0">
        <div className="lg:flex lg:items-center lg:justify-between lg:gap-6">
          <div
            role="tablist"
            aria-label="Menu categories"
            aria-orientation="horizontal"
            onKeyDown={onRegionKeyDown}
            className="mask-fade-x flex snap-x snap-mandatory gap-1 overflow-x-auto px-5 py-3 [scrollbar-width:none] sm:px-8 lg:mask-none lg:min-w-0 lg:flex-1 lg:flex-wrap lg:overflow-visible lg:px-0 lg:py-2 [&::-webkit-scrollbar]:hidden"
            ref={tablistRef}
          >
            {menuCategories.map((entry) => {
              const selected = entry.id === active;
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  data-category={entry.id}
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(entry.id)}
                  className={cn(
                    "group relative shrink-0 snap-start whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-300 lg:px-5",
                    selected
                      ? "text-accent-bright"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {entry.label}
                  {/*
                    One shared element, so the underline travels between
                    categories instead of each chip blinking its own into being.
                  */}
                  {selected ? (
                    <motion.span
                      layoutId="menu-active-category"
                      aria-hidden
                      className="absolute inset-x-3 bottom-1 h-px origin-left bg-accent lg:inset-x-5"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
                      }
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Live count, useful context when browsing a long menu. */}
          <p className="micro hidden shrink-0 border-l border-border px-6 text-muted-foreground lg:block">
            <span className="text-accent">{String(items.length).padStart(2, "0")}</span>{" "}
            items
          </p>
        </div>
      </div>

      {/* --- active category note --- */}
      <div className="flex flex-col gap-3 border-b border-border py-8 lg:flex-row lg:items-baseline lg:justify-between lg:py-10">
        <h2 className="text-[clamp(1.75rem,4vw,3rem)] tracking-display" aria-live="polite">
          {category.label}
        </h2>
        <p className="max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
          {category.note}
        </p>
      </div>

      {/* --- items --- */}
      <div
        className={cn(
          "transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)]",
          phase === "leaving" && "translate-y-2 opacity-0",
          phase === "entering" && "translate-y-0 opacity-100",
        )}
      >
        <ul
          className={cn(
            "divide-y divide-border",
            phase === "entering" &&
              "[&>li]:animate-[menu-in_560ms_var(--ease-out-expo)_both]",
          )}
        >
          {items.map((item, index) => (
            <MenuRow
              key={item.id}
              item={item}
              index={index}
              staggerIndex={index}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * A single menu item.
 *
 * Rows, not cards. The featured item in each category gets the oversized
 * treatment with a photograph; the rest stay typographic so the list scans fast
 * and the page has rhythm rather than a uniform grid.
 */
function MenuRow({
  item,
  index,
  staggerIndex,
}: {
  item: MenuItem;
  index: number;
  staggerIndex: number;
}) {
  const featured = Boolean(item.signature) && index === 0;

  if (featured) {
    return (
      <li
        className="border-b border-border py-10 first:pt-0 lg:py-14"
        style={{ animationDelay: `${Math.min(staggerIndex, 6) * 70}ms` }}
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <div className="group relative aspect-4/3 overflow-hidden bg-background-sunken lg:aspect-4/5">
              <MenuItemImage item={item} priority={false} />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-background-sunken/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
              <span className="absolute bottom-4 left-4">
                <span className="micro border border-accent/40 bg-background/70 px-3 py-1.5 text-accent-bright backdrop-blur-sm">
                  Signature
                </span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-display">
                {item.name}
              </h3>
              <span className="shrink-0 text-lg tabular-nums text-foreground-soft">
                {formatPrice(item.price)}
              </span>
            </div>

            <p className="mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              {item.description}
            </p>

            {item.tasting ? (
              <p className="mt-6 border-l border-accent/50 pl-5 text-pretty text-sm leading-relaxed text-foreground-soft italic">
                {item.tasting}
              </p>
            ) : null}

            <ItemMeta item={item} />
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      className="group border-b border-border"
      style={{ animationDelay: `${Math.min(staggerIndex, 6) * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-6 py-7 sm:gap-10 sm:py-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="font-display text-[clamp(1.375rem,2.6vw,2rem)] leading-tight tracking-display transition-colors duration-400 group-hover:text-accent-bright">
              {item.name}
            </h3>
            {item.signature ? (
              <span className="micro text-accent">Signature</span>
            ) : null}
          </div>

          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <ItemMeta item={item} className="mt-3" />
        </div>

        <div className="flex shrink-0 items-baseline gap-3 pt-1">
          <span className="text-base tabular-nums text-foreground-soft">
            {formatPrice(item.price)}
          </span>
          <span
            aria-hidden
            className="hidden h-px w-6 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100 sm:block"
          />
        </div>
      </div>
    </li>
  );
}

function ItemMeta({ item, className }: { item: MenuItem; className?: string }) {
  const hasMeta =
    Boolean(item.roast) || Boolean(item.dietary?.length) || item.unit !== "set";

  if (!hasMeta) return null;

  return (
    <ul
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground",
        className ?? "mt-5",
      )}
    >
      {item.roast ? (
        <li className="micro">{item.roast} roast</li>
      ) : null}
      {item.unit !== "set" ? (
        <li className="micro">
          {item.unit === "ml" ? `${item.unit}` : item.unit === "g" ? `${item.unit}` : item.unit}
        </li>
      ) : null}
      {item.dietary?.map((tag: DietaryTag) => (
        <li key={tag} className="micro text-accent/80">
          {dietaryLabels[tag]}
        </li>
      ))}
    </ul>
  );
}

/**
 * Item photograph.
 *
 * Items fall back to their category image, so a category always has a visual even
 * before individual drinks are photographed. Alt is empty: the item name and
 * description already carry the meaning, and a repeated stock caption would add
 * noise for screen reader users.
 */
function MenuItemImage({
  item,
  priority,
}: {
  item: MenuItem;
  priority: boolean;
}) {
  const src =
    item.image ?? menuCategories.find((entry) => entry.id === item.category)?.image;
  if (!src) return null;

  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      loading={priority ? undefined : "lazy"}
      sizes="(max-width: 1024px) 100vw, 38vw"
      className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
    />
  );
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}