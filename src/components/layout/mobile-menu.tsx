"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { navigation } from "@/data/navigation";
import { addressLines, location, openingHours, siteConfig } from "@/config/site";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/cn";

/**
 * Full-screen mobile navigation.
 *
 * The panel wipes in from the top using a clip-path, links stagger in behind it,
 * and the page behind is locked with a compensating scrollbar width so nothing
 * shifts. Focus moves into the panel on open, Escape closes it, and closing
 * returns focus to whatever triggered it.
 */
export function MobileMenu({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const currentPath = usePathname();

  // Scroll lock with scrollbar-width compensation.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const focusTimer = window.setTimeout(() => firstLinkRef.current?.focus(), 260);

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
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  // Route changes close the panel.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentPath]);

  return (
    <div
      id="mobile-navigation"
      ref={panelRef}
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-[105] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-background-sunken/70 backdrop-blur-sm transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal={open ? "true" : undefined}
        aria-label="Site navigation"
        className={cn(
          "noise absolute inset-x-0 top-0 flex h-[100dvh] flex-col overflow-y-auto overscroll-contain bg-background transition-[clip-path] duration-700 ease-[var(--ease-in-out-quart)]",
          open ? "clip-path-[inset(0_0_0_0)]" : "clip-path-[inset(0_0_100%_0)]",
        )}
      >
        <Container className="flex flex-1 flex-col pb-10 pt-24 sm:pt-28">
          <nav aria-label="Mobile">
            <ul>
              {navigation.map((link, index) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <li
                    key={link.href}
                    className={cn(
                      "overflow-hidden border-b border-border transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)]",
                      open
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0",
                    )}
                    style={{
                      transitionDelay: open
                        ? `${140 + index * 62}ms`
                        : `${(navigation.length - index) * 40}ms`,
                    }}
                  >
                    <Link
                      href={link.href}
                      ref={index === 0 ? firstLinkRef : undefined}
                      tabIndex={open ? 0 : -1}
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
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={cn(
              "mt-10 flex flex-1 flex-col justify-end gap-8 transition-opacity delay-500 duration-700",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            <address className="not-italic">
              <p className="micro mb-3 text-muted-foreground">Visit</p>
              {addressLines.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-foreground-soft">
                  {line}
                </p>
              ))}
              <p className="mt-3 text-sm text-foreground-soft">
                {openingHours[0].day}–{openingHours[6].day},{" "}
                {openingHours[4].hours.replace(" — ", "–")}
              </p>
            </address>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <a
                href={`mailto:${siteConfig.email}`}
                tabIndex={open ? 0 : -1}
                className="text-sm text-foreground-soft transition-colors hover:text-accent-bright"
              >
                {siteConfig.email}
              </a>
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                tabIndex={open ? 0 : -1}
                className="text-sm text-foreground-soft transition-colors hover:text-accent-bright"
              >
                Directions ↗
              </a>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}