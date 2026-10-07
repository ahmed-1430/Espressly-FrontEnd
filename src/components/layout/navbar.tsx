"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navigation } from "@/data/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { Container } from "@/components/layout/container";
import { MobileMenu } from "./mobile-menu";
import { useScrolled } from "@/hooks/use-scrolled";

/**
 * Site navigation.
 *
 * Transparent over a hero, then transitioning to a glass bar once scrolled. The
 * bar hides on fast downward scroll and returns immediately on any upward
 * movement, so it never traps the viewport but never gets in the way either.
 */
export function Navbar({ tone = "dark" }: { tone?: "dark" | "parchment" }) {
  const pathname = usePathname();
  const scrolled = useScrolled(40);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        // Only meaningful past the fold, so the bar never flickers near the top.
        const goingDown = y > last && y > 260;
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
  const onParchment = tone === "parchment" && !solid;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[100] transition-[transform,background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-out-expo)]",
          hidden && !menuOpen && "-translate-y-full",
          solid
            ? "glass-dark"
            : "border-b border-transparent bg-transparent",
        )}
        style={{ transitionProperty: "transform, background-color, border-color" }}
      >
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-[76px]">
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            className="group relative z-[110] -m-2 p-2"
          >
            <Image
              src="/brand/espressly-logo-cream.png"
              alt=""
              width={855}
              height={239}
              priority
              className={cn(
                "w-auto transition-[height,opacity] duration-500 ease-[var(--ease-out-expo)]",
                solid ? "h-5 lg:h-[22px] opacity-100" : "h-6 lg:h-[26px] opacity-100",
              )}
            />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {navigation.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    label={link.label}
                    active={isActive(link.href)}
                    onParchment={onParchment}
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className={cn(
                "group relative hidden overflow-hidden border px-6 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] transition-colors duration-500 sm:inline-flex",
                solid || onParchment
                  ? "border-border-strong text-foreground hover:border-accent hover:text-accent-bright"
                  : "border-border-strong/70 text-foreground hover:border-accent hover:text-accent-bright",
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
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="group relative z-[110] -mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[7px] p-2 lg:hidden"
            >
              <span className="sr-only">
                {menuOpen ? "Close menu" : "Open menu"}
              </span>
              <span
                aria-hidden
                className={cn(
                  "h-px w-7 bg-foreground transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  menuOpen && "translate-y-[4px] rotate-45",
                )}
              />
              <span
                aria-hidden
                className={cn(
                  "h-px w-7 bg-foreground transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  menuOpen && "-translate-y-[4px] -rotate-45",
                )}
              />
            </button>
          </div>
        </Container>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
      />
    </>
  );
}

function NavLink({
  href,
  label,
  active,
  onParchment,
}: {
  href: string;
  label: string;
  active: boolean;
  onParchment: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative block py-2 text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300",
        onParchment
          ? active
            ? "text-ink-espresso"
            : "text-ink-espresso-soft hover:text-ink-espresso"
          : active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-500 ease-[var(--ease-out-expo)]",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}