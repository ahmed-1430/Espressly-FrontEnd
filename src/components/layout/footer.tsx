import Image from "next/image";
import Link from "next/link";
import {
  addressLines,
  location,
  openingHours,
  siteConfig,
  socialLinks,
} from "@/config/site";
import { footerNavigation } from "@/data/navigation";
import { Container } from "@/components/layout/container";
import { NewsletterForm } from "./newsletter-form";

/**
 * Current year, cached so the static prerender can resolve it.
 *
 * A bare `new Date()` makes the footer dynamic and blocks prerendering every
 * route that includes it. Caching pins the value for the life of the build,
 * which is correct for a copyright line.
 */
async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

/**
 * Site footer.
 *
 * Four columns on desktop, stacked on mobile, with the logo and brand statement
 * given the largest cell. Opening hours are listed in full rather than summarised.
 */
export async function Footer() {
  const year = await getCopyrightYear();

  return (
    <footer className="relative overflow-hidden border-t border-border bg-background-sunken noise">
      <Container className="relative z-10 pb-10 pt-20 sm:pt-24 lg:pb-12 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" aria-label={`${siteConfig.name} — home`} className="inline-block">
              <Image
                src="/brand/espressly-logo-cream.png"
                alt={siteConfig.name}
                width={855}
                height={239}
                className="h-6 w-auto lg:h-7"
              />
            </Link>
            <p className="mt-6 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              {siteConfig.shortDescription}
            </p>
            <p className="micro mt-8 text-muted-foreground/70">
              Est. {siteConfig.founded} — Toronto
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className="micro text-muted-foreground">Explore</h2>
            <ul className="mt-6 space-y-3">
              {footerNavigation.explore.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className="micro text-muted-foreground">Opening Hours</h2>
            <dl className="mt-6 space-y-2">
              {openingHours.map((entry) => (
                <div key={entry.day} className="flex justify-between gap-4 text-sm">
                  <dt className="text-foreground-soft">{entry.day}</dt>
                  <dd className="micro pt-1 text-muted-foreground">{entry.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-3">
            <h2 className="micro text-muted-foreground">Find Us</h2>
            <address className="mt-6 not-italic">
              {addressLines.map((line) => (
                <p key={line} className="text-sm leading-relaxed text-foreground-soft">
                  {line}
                </p>
              ))}
            </address>

            <div className="mt-6 space-y-1.5">
              <a
                href={`mailto:${siteConfig.email}`}
                className="block text-sm text-foreground-soft transition-colors hover:text-accent-bright"
              >
                {siteConfig.email}
              </a>
              <a
                href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                className="block text-sm text-foreground-soft transition-colors hover:text-accent-bright"
              >
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={location.mapsUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-sm text-foreground-soft transition-colors hover:text-accent-bright"
              >
                Get directions
                <svg aria-hidden viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                  <path
                    d="M3 9L9 3m0 0H4.5M9 3v4.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
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
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <NewsletterForm />
            <p className="micro text-muted-foreground lg:text-right">
              © {year} {siteConfig.name} Coffee Co.
              <span className="mx-3 text-border-strong">/</span>
              All rights reserved
            </p>
          </div>
        </div>
      </Container>

      {/*
        The wordmark returns once more as a watermark to close the page. Kept
        cropped and low-contrast: at full width it read as a second logo rather
        than as a closing beat, and pushed the real footer content below the fold.
      */}
      <div aria-hidden className="relative z-0 mt-16 overflow-hidden">
        <Image
          src="/brand/espressly-logo-cream.png"
          alt=""
          width={855}
          height={239}
          className="mx-auto -mb-[6%] w-[130%] max-w-none translate-y-[22%] opacity-[0.055] select-none"
        />
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group relative inline-block text-sm text-foreground-soft transition-colors duration-300 hover:text-foreground"
    >
      {children}
      <span
        aria-hidden
        className="absolute -bottom-0.5 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-400 ease-[var(--ease-out-expo)] group-hover:origin-left group-hover:scale-x-100"
      />
    </Link>
  );
}