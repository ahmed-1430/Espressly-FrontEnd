import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { RevealImage } from "@/components/motion/reveal-image";
import { TextLink } from "@/components/ui/text-link";
import { SplitLines } from "@/components/motion/split-lines";

const milestones = [
  {
    year: "2019",
    title: "A single group",
    body: "Two years of home roasting, then a twelve-square-metre lease on Queen Street with one lever machine and no sign.",
  },
  {
    year: "2021",
    title: "The blend we kept",
    body: "After eleven versions we stopped changing the espresso. Everything else on the menu moved; that never did.",
  },
  {
    year: "2024",
    title: "Roasting on site",
    body: "A 12 kg drum in the back room, so the coffee rests the number of days it actually needs.",
  },
] as const;

/**
 * Brand story.
 *
 * An editorial two-column composition rather than a centred text block: the
 * narrative runs down the left, and the timeline sits in the right column over a
 * single tall photograph that breaks the grid.
 */
export function BrandStory() {
  return (
    <section
      aria-labelledby="story-title"
      className="relative overflow-hidden bg-background-sunken py-24 sm:py-28 lg:py-36"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Narrative column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Our Story</span>
            </div>

            <h2
              id="story-title"
              className="mt-7 text-[clamp(2.25rem,6.5vw,5.5rem)] tracking-display"
            >
              <SplitLines
                as="span"
                lines={[
                  "It started with a",
                  "frustrated barista",
                  "and one stubborn bean.",
                ]}
              />
            </h2>

            <div className="mt-10 max-w-xl space-y-6 text-pretty leading-relaxed text-muted-foreground">
              <p>
                Espressly opened in 2019 with a single lever, one blend, and a
                stubborn refusal to serve coffee we would not drink ourselves. That
                has stayed the whole idea.
              </p>
              <p>
                We roast on site now, in a twelve-kilo drum in the back room, so the
                coffee rests the number of days it actually needs rather than the
                number the bag suggests. It is slower, costlier, and the reason the
                cup tastes the same on a Tuesday as it does on a Saturday.
              </p>
              <p>
                The room is quiet by design. There is no music to shout over, no
                counter to queue at, and nobody will hurry you along. Sit as long as
                you like; the table is not going anywhere.
              </p>
            </div>

            <div className="mt-12">
              <Reveal variant="clip">
                <TextLink href="/about">Read the full story</TextLink>
              </Reveal>
            </div>
          </div>

          {/* Timeline + image column */}
          <div className="lg:col-span-5 lg:pl-6">
            <RevealImage
              src="/images/craft-origin.jpg"
              alt="Two hands cupped around a large quantity of freshly roasted coffee beans."
              width={1200}
              height={1500}
              sizes="(max-width: 1024px) 100vw, 38vw"
              className="aspect-4/5 w-full"
              parallax={7}
            />

            <ol className="mt-12 flex flex-col">
              {milestones.map((entry) => (
                <Reveal
                  key={entry.year}
                  variant="fade-up"
                  className="border-t border-border py-7 first:border-t-0 first:pt-0"
                >
                  <li className="flex gap-6 sm:gap-8">
                    <span className="micro shrink-0 pt-1.5 text-accent">
                      {entry.year}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl tracking-display">
                        {entry.title}
                      </h3>
                      <p className="mt-2.5 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                        {entry.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>

        {/* Full-bleed quote: the brand's position, set large and left-aligned. */}
        <Reveal className="mt-24 lg:mt-32">
          <figure className="relative border-y border-border py-16 sm:py-20 lg:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <Image
                src="/images/editorial-still.jpg"
                alt=""
                fill
                sizes="100vw"
                className="object-cover opacity-[0.13] grayscale"
              />
            </div>

            <blockquote className="relative mx-auto max-w-4xl px-2 text-center">
              <p className="font-display text-[clamp(1.75rem,4.6vw,3.75rem)] leading-[1.12] tracking-display text-foreground">
                We are not trying to make the best coffee in the city. We are
                trying to make the same coffee every single morning, which turns
                out to be harder.
              </p>
              <figcaption className="micro mt-10 text-muted-foreground">
                Marisol Reyes — Head Barista
              </figcaption>
            </blockquote>
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Signature experience.
 *
 * Four pillars on a parchment section, breaking the dark rhythm of the page.
 * Numbers are set large and translucent so the block reads as a list rather than
 * a set of feature cards.
 */
export function SignatureExperience() {
  const pillars = [
    {
      index: "01",
      title: "Coffee",
      body: "One blend, roasted weekly on site, pulled on a three-group lever. Consistency is the whole craft.",
      image: "/images/bar-espresso.jpg",
    },
    {
      index: "02",
      title: "Atmosphere",
      body: "Warm timber, low light, no music loud enough to talk over. Built for staying, not passing through.",
      image: "/images/space-seating.jpg",
    },
    {
      index: "03",
      title: "Craft",
      body: "Every dose weighed, every shot checked, every dial logged. The boring part is the point.",
      image: "/images/craft-pour.jpg",
    },
    {
      index: "04",
      title: "Community",
      body: "Regulars get their name on the cup. We learn what you drink and stop asking.",
      image: "/images/space-garden.jpg",
    },
  ] as const;

  return (
    <section
      aria-labelledby="experience-title"
      className="relative overflow-hidden bg-surface-parchment text-ink-espresso"
    >
      <Container className="py-24 sm:py-28 lg:py-36">
        <SectionHeading
          eyebrow="The Experience"
          title={
            <span id="experience-title">
              Four things we
              <br />
              refuse to compromise
            </span>
          }
          note="Everything else is negotiable. These are not."
          tone="parchment"
        />

        <Reveal
          stagger={0.1}
          margin="-6% 0px -6% 0px"
          className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:gap-x-14"
        >
          {pillars.map((pillar) => (
            <article key={pillar.index} className="group">
              <div className="relative aspect-3/2 overflow-hidden bg-coffee-mocha">
                <Image
                  src={pillar.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 46vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink-espresso/45 to-transparent"
                />
              </div>

              <div className="mt-6 flex items-start gap-5">
                <span className="micro pt-2 text-accent-deep">{pillar.index}</span>
                <div>
                  <h3 className="font-display text-3xl tracking-display">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-pretty leading-relaxed text-ink-espresso-soft">
                    {pillar.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </Container>

      {/* Corner coordinate marker: a quiet piece of interface texture. */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-8 bottom-8 hidden micro text-accent-deep/50 lg:block"
      >
        43.6471° N — 79.4006° W
      </span>
    </section>
  );
}

/**
 * Menu preview.
 *
 * Six items pulled from the real menu data so the homepage and the menu page can
 * never drift apart. Rendered as a typographic table, not cards.
 */
export function MenuPreview() {
  const items = [
    { name: "Espresso", note: "Brazil · Ethiopia", price: 4.25 },
    { name: "Brown Butter Latte", note: "House signature", price: 6.75 },
    { name: "Filter — Single Origin", note: "Rotating guest", price: 6.5 },
    { name: "Nitro Cold Brew", note: "Nitrogen charged", price: 7 },
    { name: "Matcha Latte", note: "Ceremonial grade", price: 6.5 },
    { name: "Butter Croissant", note: "Baked twice daily", price: 5.25 },
  ] as const;

  return (
    <section
      aria-labelledby="menu-preview-title"
      className="relative bg-background py-24 sm:py-28 lg:py-36"
    >
      <Container>
        <SectionHeading
          eyebrow="From the menu"
          title={
            <span id="menu-preview-title">
              Eight categories,
              <br />
              one very short list
            </span>
          }
          note="Filter, cold, tea, pastry, breakfast and a seasonal board that changes with the week."
          action={
            <Link
              href="/menu"
              className="group inline-flex items-center gap-3 border border-border-strong px-7 py-4 text-xs font-medium uppercase tracking-[0.16em] text-foreground transition-colors duration-500 hover:border-accent hover:text-accent-bright"
            >
              See the full menu
              <svg
                aria-hidden
                viewBox="0 0 24 12"
                fill="none"
                className="h-2.5 w-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
              >
                <path
                  d="M0 6h21m0 0-5-5m5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </Link>
          }
        />

        <Reveal className="mt-16 lg:mt-20">
          <ul className="grid gap-x-12 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.name}
                className="group flex items-baseline justify-between gap-5 border-t border-border py-6 transition-colors duration-500 hover:border-accent/50"
              >
                <div>
                  <h3 className="font-display text-2xl tracking-display transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
                    {item.name}
                  </h3>
                  <p className="micro mt-2 text-muted-foreground">{item.note}</p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-foreground-soft">
                  {item.price.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Atmosphere preview.
 *
 * A deliberately non-uniform composition: one large portrait, one wide landscape,
 * and two smaller squares at different heights. Authored offsets stop it reading
 * as a generic grid.
 */
export function AtmospherePreview() {
  const frames = [
    {
      src: "/images/space-garden.jpg",
      alt: "A cafe interior filled with hanging plants beneath a glass roof.",
      className: "aspect-4/5 sm:col-span-2 sm:row-span-2 sm:aspect-auto",
      caption: "The long room, midday",
    },
    {
      src: "/images/craft-pour.jpg",
      alt: "Steamed milk poured into a cup, forming a rosetta in the crema.",
      className: "aspect-4/3 sm:aspect-16/10",
      caption: "Rosetta, pulled twice",
    },
    {
      src: "/images/food-viennoiserie.jpg",
      alt: "A dark board of croissants and pastries lit from one side.",
      className: "aspect-4/3 sm:aspect-16/10 lg:translate-y-10",
      caption: "Out of the oven at 06:30",
    },
  ] as const;

  return (
    <section
      aria-labelledby="atmosphere-title"
      className="relative overflow-hidden bg-background-sunken py-24 sm:py-28 lg:py-36"
    >
      <Container>
        <SectionHeading
          eyebrow="Atmosphere"
          title={
            <span id="atmosphere-title">
              What the room
              <br />
              actually feels like
            </span>
          }
          action={
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 border border-border-strong px-7 py-4 text-xs font-medium uppercase tracking-[0.16em] text-foreground transition-colors duration-500 hover:border-accent hover:text-accent-bright"
            >
              Full gallery
              <svg
                aria-hidden
                viewBox="0 0 24 12"
                fill="none"
                className="h-2.5 w-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
              >
                <path
                  d="M0 6h21m0 0-5-5m5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </Link>
          }
        />

        <Reveal
          stagger={0.12}
          margin="-5% 0px -5% 0px"
          className="mt-16 grid gap-4 sm:grid-cols-4 sm:grid-rows-2 lg:mt-20"
        >
          {frames.map((frame) => (
            <figure key={frame.src} className={frame.className}>
              <div className="relative h-full w-full overflow-hidden bg-background-raised">
                <Image
                  src={frame.src}
                  alt={frame.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] hover:scale-[1.04]"
                />
              </div>
              <figcaption className="micro mt-3 text-muted-foreground">
                {frame.caption}
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

/**
 * Shop preview.
 *
 * Four products, presented as a quiet row with a hairline between them rather
 * than a card grid. The first product gets a photograph; the rest are set
 * typographically, which reads as deliberate restraint.
 */
export function ShopPreview() {
  const items = [
    { name: "Signature Blend", detail: "Whole bean · 340 g", price: 22 },
    { name: "Single Origin", detail: "Whole bean · 250 g", price: 26 },
    { name: "Cold Brew Bottle", detail: "Ready to drink · 330 ml", price: 7.5 },
    { name: "Hand Grinder", detail: "48 mm conical burrs", price: 145 },
  ] as const;

  return (
    <section
      aria-labelledby="shop-preview-title"
      className="relative bg-surface-parchment text-ink-espresso"
    >
      <Container className="py-24 sm:py-28 lg:py-36">
        <SectionHeading
          eyebrow="Take it home"
          title={
            <span id="shop-preview-title">
              Beans roasted
              <br />
              on the premises
            </span>
          }
          note="The same coffee we serve, roasted in the back room every Tuesday and Friday."
          tone="parchment"
          action={
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 border border-border-dark-strong px-7 py-4 text-xs font-medium uppercase tracking-[0.16em] text-ink-espresso transition-colors duration-500 hover:border-accent-deep hover:text-accent-deep"
            >
              Visit the shop
              <svg
                aria-hidden
                viewBox="0 0 24 12"
                fill="none"
                className="h-2.5 w-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5"
              >
                <path
                  d="M0 6h21m0 0-5-5m5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </Link>
          }
        />

        <Reveal
          stagger={0.09}
          margin="-6% 0px -6% 0px"
          className="mt-16 grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
        >
          {items.map((item) => (
            <article key={item.name} className="group">
              <div className="relative aspect-4/5 overflow-hidden bg-coffee-mocha">
                <Image
                  src="/images/product-beans.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 24vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                />
              </div>
              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl tracking-display">
                    {item.name}
                  </h3>
                  <span className="shrink-0 text-sm tabular-nums">
                    {item.price.toFixed(2)}
                  </span>
                </div>
                <p className="micro mt-2 text-ink-espresso-soft">{item.detail}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}