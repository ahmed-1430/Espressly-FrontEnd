import { addressLines, location, openingHours, siteConfig } from "@/config/site";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { RevealImage } from "@/components/motion/reveal-image";
import { formatCoordinates } from "@/lib/cn";

/**
 * Visit section.
 *
 * Practical information set as an editorial block rather than a contact card:
 * address, hours in full, phone, and a framed photograph of the storefront.
 */
export function VisitEspressly() {
  return (
    <section
      aria-labelledby="visit-title"
      className="noise relative overflow-hidden bg-background py-24 sm:py-28 lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
      />

      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Visit</span>
            </div>
            <h2
              id="visit-title"
              className="mt-7 text-[clamp(2.25rem,6vw,4.75rem)] tracking-display"
            >
              The door
              <br />
              is on Queen Street
            </h2>

            <Reveal className="mt-10 flex flex-col gap-10">
              <address className="not-italic">
                <p className="micro text-muted-foreground">Address</p>
                <p className="mt-3 font-display text-2xl leading-snug tracking-display">
                  {addressLines[0]}
                  <br />
                  <span className="text-foreground-soft">{addressLines[1]}</span>
                </p>
                <a
                  href={location.mapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-sweep mt-4 inline-block text-sm text-accent-bright"
                >
                  {location.postalCode} — Get directions
                </a>
              </address>

              <div>
                <p className="micro text-muted-foreground">Hours</p>
                <dl className="mt-4 max-w-sm">
                  {openingHours.map((entry) => (
                    <div
                      key={entry.day}
                      className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0"
                    >
                      <dt className="text-sm text-foreground-soft">{entry.day}</dt>
                      <dd className="micro text-muted-foreground">{entry.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <p className="micro text-muted-foreground">Contact</p>
                <div className="mt-4 flex flex-col gap-1.5">
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="link-sweep w-fit text-sm text-foreground-soft hover:text-foreground"
                  >
                    {siteConfig.email}
                  </a>
                  <a
                    href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
                    className="link-sweep w-fit text-sm text-foreground-soft hover:text-foreground"
                  >
                    {siteConfig.phoneDisplay}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <RevealImage
              src="/images/space-facade.jpg"
              alt="A cafe interior with black menu boards above the counter and people at the till."
              width={1800}
              height={1400}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="aspect-4/3 w-full lg:aspect-16/11"
              parallax={8}
            />

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="micro text-muted-foreground">
                {formatCoordinates(
                  location.coordinates.latitude,
                  location.coordinates.longitude,
                )}{" "}
                — {location.name}
              </p>

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/contact" variant="primary" arrow>
                  Get in touch
                </ButtonLink>
                <ButtonLink href="/gallery" variant="outline">
                  See the room
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}