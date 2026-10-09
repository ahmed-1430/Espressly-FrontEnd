"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/data/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Container } from "@/components/layout/container";
import { MobileMenu } from "./mobile-menu";
import { useScrolled } from "@/hooks/use-scrolled";

/**
 * Site navigation.
 *
 * Transparent over a hero, transitioning to a glass bar once scrolled. The bar
 * retracts on sustained downward scroll and returns on any upward movement, so
 * it never traps the viewport but never gets in the way either.
 *
 * The active-route indicator is a single element that slides between items via
 * Motion's shared-layout animation, rather than each link drawing its own
 * underline — so the mark travels between routes instead of blinking.
 */
export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled(40);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        // Only meaningful past the fold, so the bar never flickers near the top.
        const goingDown = y > last && y > 320;
        setHidden(goingDown && !menuOpen);
        last = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const solid = scrolled || menuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-[transform,background-color,border-color] duration-500 ease-[var(--ease-out-expo)]",
          hidden && !menuOpen && "-translate-y-full",
          solid ? "glass-dark" : "border-b border-transparent bg-transparent",
        )}
      >
        {/*
          A top-down scrim while the bar is still transparent.

          Several heroes open on a bright photograph — the gallery's bulb wall is
          the worst case — and muted nav labels over that are unreadable. The
          gradient is subtle enough to be invisible on the dark heroes and is
          removed entirely once the glass bar takes over.
        */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 bg-linear-to-b from-background-sunken/85 via-background-sunken/35 to-transparent transition-opacity duration-500",
            solid ? "opacity-0" : "opacity-100",
          )}
        />
        <Container className="relative flex h-16 items-center justify-between gap-6 lg:h-[76px]">
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            className="relative z-[110] -m-2 shrink-0 p-2"
          >
            <Image
              src="/brand/espressly-logo-cream.png"
              alt=""
              width={855}
              height={239}
              priority
              className={cn(
                "w-auto transition-[height] duration-500 ease-[var(--ease-out-expo)]",
                solid ? "h-5 lg:h-[22px]" : "h-6 lg:h-[26px]",
              )}
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navigation.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    label={link.label}
                    active={isActive(link.href)}
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/shop"
              className={cn(
                "group relative hidden overflow-hidden border px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] transition-colors duration-500 sm:inline-flex",
                // Over a photograph the border and label need their own backing to
                // stay legible; over the glass bar the transparent treatment is fine.
                solid
                  ? "border-border-strong text-foreground hover:border-accent hover:text-accent-bright"
                  : "border-foreground/25 bg-background-sunken/45 text-foreground backdrop-blur-[6px] hover:border-accent hover:text-accent-bright",
              )}
            >
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
              />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-accent-foreground">
                Shop Beans
              </span>
            </Link>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="-mr-2 flex h-11 w-11 items-center justify-center text-foreground transition-opacity duration-300 lg:hidden"
            >
              <span className="sr-only">Open menu</span>
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          // The panel restores focus itself; this keeps the trigger reachable for
          // the case where the panel unmounted before focus could be returned.
          requestAnimationFrame(() => triggerRef.current?.focus());
        }}
        pathname={pathname}
      />
    </>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative block px-1 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active ? (
        // One shared element, so the mark slides between routes.
        <motion.span
          layoutId="nav-active"
          aria-hidden
          className="absolute inset-x-0 -bottom-0.5 h-px bg-accent"
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 34, mass: 0.7 }
          }
        />
      ) : null}
    </Link>
  );
}

/** Hamburger glyph: two hairlines, matching the close mark's stroke weight. */
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 16"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.2"
      vectorEffect="non-scaling-stroke"
    >
      <path d="M0 4h24M0 12h16" />
    </svg>
  );
}