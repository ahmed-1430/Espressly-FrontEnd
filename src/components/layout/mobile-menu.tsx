"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { navigation } from "@/data/navigation";
import {
  addressLines,
  location,
  openingHours,
  siteConfig,
  socialLinks,
} from "@/config/site";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";
import { useScrollLock } from "@/lib/scroll";

/**
 * Full-screen mobile navigation.
 *
 * Built on Motion rather than CSS transitions because the panel needs true
 * presence: `AnimatePresence` keeps it mounted through its exit, which a class
 * toggle cannot do. Links stagger in on open and reverse out on close, and the
 * exit is driven by the parent so the two never disagree.
 *
 * Accessibility:
 *  - `role="dialog"` + `aria-modal` while open
 *  - focus moves to the close button on open and returns to the trigger on close
 *  - Tab is trapped inside the panel while open
 *  - Escape closes
 *  - scroll is locked with scrollbar-width compensation so nothing shifts
 */
export function MobileMenu({
  open,
  onClose,
  pathname: routePathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const pathname = routePathname;

  useScrollLock(open);

  /* --- open: move focus, trap Tab, handle Escape --- */
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    // After the panel has landed, so the focus ring is not seen travelling up.
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 220);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  /* --- route change closes the panel --- */
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && open) onClose();
    wasOpen.current = open;
  }, [pathname, open, onClose]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mobile-nav"
          className="fixed inset-0 z-[105] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Scrim: tapping outside closes, matching the Escape behaviour. */}
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-background-sunken/70 backdrop-blur-sm"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="noise absolute inset-x-0 top-0 flex h-[100dvh] flex-col overflow-y-auto overscroll-contain bg-background"
            initial={reduce ? { opacity: 0 } : { y: "-100%" }}
            animate={reduce ? { opacity: 1 } : { y: "0%" }}
            exit={reduce ? { opacity: 0 } : { y: "-100%" }}
            transition={
              reduce
                ? { duration: 0.2 }
                : { duration: 0.62, ease: [0.76, 0, 0.24, 1] }
            }
          >
            {/* Hairline that draws across as the panel lands. */}
            <motion.span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-left bg-linear-to-r from-accent to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
            />

            <Container className="flex flex-1 flex-col pb-8 pt-20 sm:pt-24">
              {/* Header row: branding plus an explicit, generously sized close. */}
              <div className="flex items-center justify-between gap-4">
                <Image
                  src="/brand/espressly-logo-cream.png"
                  alt=""
                  width={855}
                  height={239}
                  className="h-5 w-auto"
                />

                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="-mr-3 flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  <span className="sr-only">Close menu</span>
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <nav aria-label="Mobile" className="mt-10 sm:mt-14">
                <ul>
                  {navigation.map((link, index) => {
                    const active = isActive(link.href);
                    return (
                      <motion.li
                        key={link.href}
                        className="overflow-hidden border-b border-border"
                        initial={reduce ? { opacity: 0 } : { y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? { opacity: 0 } : { y: -18, opacity: 0 }}
                        transition={{
                          duration: reduce ? 0.15 : 0.55,
                          ease,
                          delay: reduce
                            ? 0
                            : 0.18 + index * 0.055,
                        }}
                      >
                        <Link
                          href={link.href}
                          onClick={onClose}
                          aria-current={active ? "page" : undefined}
                          className="group flex items-baseline gap-5 py-4 sm:py-5"
                        >
                          <span className="micro w-7 shrink-0 text-accent">
                            {link.index}
                          </span>
                          <span
                            className={cn(
                              "font-display text-[clamp(2rem,10vw,3.25rem)] leading-none tracking-display transition-colors duration-300",
                              active
                                ? "text-accent-bright"
                                : "text-foreground group-hover:text-accent-bright",
                            )}
                          >
                            {link.label}
                          </span>
                          <span
                            aria-hidden
                            className="ml-auto self-center text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          >
                            <ArrowIcon className="h-2.5 w-6" />
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <motion.div
                className="mt-auto flex flex-col gap-8 pt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduce ? 0 : 0.42,
                }}
              >
                <address className="not-italic">
                  <p className="micro mb-3 text-muted-foreground">Visit</p>
                  {addressLines.map((line) => (
                    <p
                      key={line}
                      className="text-sm leading-relaxed text-foreground-soft"
                    >
                      {line}
                    </p>
                  ))}
                  <p className="micro mt-3 text-muted-foreground">
                    {openingHours[0].shortDay} {openingHours[0].hours} —{" "}
                    {openingHours[6].shortDay} {openingHours[6].hours}
                  </p>
                </address>

                <div className="flex flex-col gap-3 border-t border-border pt-6">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="w-fit text-sm text-foreground-soft transition-colors hover:text-accent-bright"
                  >
                    {siteConfig.email}
                  </a>
                  <a
                    href={location.mapsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex w-fit items-center gap-2 text-sm text-foreground-soft transition-colors hover:text-accent-bright"
                  >
                    Directions
                    <svg aria-hidden viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                      <path
                        d="M3 9L9 3m0 0H4.5M9 3v4.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </a>
                </div>

                <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6">
                  {socialLinks.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="micro text-muted-foreground transition-colors hover:text-accent-bright"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </Container>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Close glyph: a hairline cross, drawn rather than filled. */
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.2"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

/** The arrow mark used across the site, kept identical to the desktop set. */
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 12"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.2"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M0 6h21m0 0-5-5m5 5-5 5" />
    </svg>
  );
}