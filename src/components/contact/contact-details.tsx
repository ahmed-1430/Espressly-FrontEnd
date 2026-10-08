import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import {
  addressLines,
  location,
  openingHours,
  siteConfig,
  socialLinks,
} from "@/config/site";
import { formatCoordinates } from "@/lib/cn";

/**
 * Contact details panel.
 *
 * Every practical channel in one block, plus an abstract map plate. The map is a
 * stylised SVG rather than an embedded third-party iframe: it avoids shipping a
 * tracker and a cookie banner on the one page that asks a visitor to tell us who
 * they are, and it still links out to real directions.
 */
export function ContactDetails() {
  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="micro text-accent">Visit</p>
        <address className="mt-4 not-italic">
          {addressLines.map((line) => (
            <p key={line} className="font-display text-2xl leading-snug tracking-display">
              {line}
            </p>
          ))}
        </address>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="link-sweep mt-4 inline-block text-sm text-accent-bright"
        >
          Open in Maps ↗
        </a>
      </div>

      <div>
        <p className="micro text-accent">Hours</p>
        <dl className="mt-4">
          {openingHours.map((entry) => (
            <div
              key={entry.day}
              className="flex items-baseline justify-between gap-4 border-b border-border py-2.5"
            >
              <dt className="text-sm text-foreground-soft">{entry.day}</dt>
              <dd className="micro text-muted-foreground">{entry.hours}</dd>
            </div>
          ))}
        </dl>
        <p className="micro mt-4 text-muted-foreground">
          Last pour 30 minutes before close
        </p>
      </div>

      <div>
        <p className="micro text-accent">Direct</p>
        <div className="mt-4 flex flex-col gap-2">
          <a
            href={`mailto:${siteConfig.email}`}
            className="link-sweep w-fit text-base text-foreground-soft hover:text-foreground"
          >
            {siteConfig.email}
          </a>
          <a
            href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}
            className="link-sweep w-fit text-base text-foreground-soft hover:text-foreground"
          >
            {siteConfig.phoneDisplay}
          </a>
        </div>
      </div>

      <div>
        <p className="micro text-accent">Social</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {socialLinks.map((social) => (
            <li key={social.label}>
              <a
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="link-sweep text-sm text-foreground-soft hover:text-foreground"
              >
                {social.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <MapPlate />
    </div>
  );
}

/**
 * Abstract location plate.
 *
 * A drawn street grid with a marker at the café's coordinates. Decorative, so it
 * is hidden from assistive technology; the address and the Maps link above carry
 * the same information in text.
 */
function MapPlate() {
  const { latitude, longitude } = location.coordinates;

  return (
    <div className="relative aspect-4/3 w-full overflow-hidden border border-border bg-background-sunken">
      <svg
        aria-hidden
        viewBox="0 0 400 300"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="400" height="300" fill="#1b1611" />

        {/* Street grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={20 + i * 34}
            x2="400"
            y2={20 + i * 34}
            stroke="rgba(240,233,221,0.07)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={14 + i * 32}
            y1="0"
            x2={14 + i * 32}
            y2="300"
            stroke="rgba(240,233,221,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Two wider streets, the Queen and the parallel */}
        <rect x="0" y="150" width="400" height="22" fill="rgba(240,233,221,0.05)" />
        <rect x="186" y="0" width="20" height="300" fill="rgba(240,233,221,0.045)" />

        {/* Marker */}
        <g transform="translate(196 161)">
          <circle r="30" fill="rgba(184,118,58,0.14)" />
          <circle r="16" fill="none" stroke="rgba(184,118,58,0.5)" strokeWidth="1" />
          <circle r="5.5" fill="#d9994f" />
        </g>

        <text
          x="196"
          y="128"
          textAnchor="middle"
          fill="#f0e9dd"
          fontSize="11"
          letterSpacing="3.2"
          fontFamily="monospace"
        >
          ESPRESSLY
        </text>
        <text
          x="196"
          y="215"
          textAnchor="middle"
          fill="#9c8d7c"
          fontSize="9"
          letterSpacing="2.4"
          fontFamily="monospace"
        >
          QUEEN ST W
        </text>
        <text
          x="16"
          y="288"
          fill="rgba(156,141,124,0.7)"
          fontSize="9"
          letterSpacing="2"
          fontFamily="monospace"
        >
          {formatCoordinates(latitude, longitude)}
        </text>
      </svg>

      <div className="relative -mt-16 border-t border-border bg-background/85 px-5 py-4 backdrop-blur-sm">
        <p className="micro text-muted-foreground">{location.name}</p>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="link-sweep mt-1 inline-block text-sm text-accent-bright"
        >
          Get directions
        </a>
      </div>
    </div>
  );
}

/**
 * A short answer to the questions people actually ask by email.
 */
export function ContactFaq() {
  const faqs = [
    {
      q: "Do you take bookings?",
      a: "Not for tables under six. Above six, or for a private hire of the whole room, email us and we will sort it out in a day.",
    },
    {
      q: "Can I get a standing wholesale order?",
      a: "Yes. Tell us the volume, the delivery day and how you brew. We will send a price list and set up a standing order on the next roast day.",
    },
    {
      q: "Do you sell the beans in the café?",
      a: "Whole bean and pre-ground, roasted Tuesdays and Fridays. Grind to order if you tell us your brewer.",
    },
    {
      q: "Is the shop step-free?",
      a: "Yes. The Queen Street entrance is level, the washroom is on the same floor, and there is a reserved table by the window.",
    },
  ] as const;

  return (
    <section
      aria-labelledby="faq-heading"
      className="relative border-t border-border bg-background-sunken py-24 sm:py-28 lg:py-32"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Before you write</span>
            </div>
            <h2
              id="faq-heading"
              className="mt-7 text-[clamp(2rem,5vw,3.25rem)] tracking-display"
            >
              Asked often
            </h2>
            <p className="mt-6 max-w-sm text-pretty leading-relaxed text-muted-foreground">
              Four things that cover most of our inbox. If yours is not here, ask
              anyway.
            </p>
          </div>

          <div className="lg:col-span-8">
            <Reveal stagger={0.08} className="flex flex-col">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="border-t border-border py-7 last:border-b"
                >
                  <h3 className="font-display text-xl tracking-display sm:text-2xl">
                    {faq.q}
                  </h3>
                  <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        <Reveal className="mt-16">
          <div className="relative aspect-16/9 w-full overflow-hidden border border-border lg:aspect-32/9">
            <Image
              src="/images/space-counter.jpg"
              alt="A warmly lit cafe counter lined with bottles and pendant lights."
              fill
              loading="lazy"
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-background-sunken via-background-sunken/40 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="micro text-accent-bright">Still here</p>
              <p className="mt-3 max-w-lg font-display text-2xl leading-snug tracking-display sm:text-3xl">
                The room is open. Come and ask us in person.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}