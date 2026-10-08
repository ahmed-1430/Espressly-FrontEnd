import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="noise relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-6 pt-24 pb-20 text-center sm:pt-28">
      <div
        aria-hidden
        className="grid-lines pointer-events-none absolute inset-0 opacity-40"
      />

      <div className="relative z-10 flex flex-col items-center">
        <p className="micro text-accent">Error 404</p>
        <h1 className="mt-6 text-[clamp(3rem,12vw,8rem)] tracking-display">
          Nothing poured
        </h1>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
          This page is not on the menu. It may have been retired, or the link may
          have been mistyped.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/" variant="primary" arrow>
            Back to Espressly
          </ButtonLink>
          <ButtonLink href="/menu" variant="outline">
            See the menu
          </ButtonLink>
        </div>

        <nav aria-label="Suggested pages" className="mt-14">
          <p className="micro text-muted-foreground">Or try</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { href: "/shop", label: "Shop" },
              { href: "/gallery", label: "Gallery" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-sweep text-sm text-foreground-soft transition-colors hover:text-accent-bright"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="micro mt-16 text-muted-foreground/60">
          {siteConfig.name} — {siteConfig.phoneDisplay}
        </p>
      </div>
    </div>
  );
}