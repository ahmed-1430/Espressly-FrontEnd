import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";
import { SlideReveal } from "@/components/motion/slide-reveal";
import { RevealImage } from "@/components/motion/reveal-image";
import { ButtonLink } from "@/components/ui/button";
import { SplitLines } from "@/components/motion/split-lines";

/**
 * About story.
 *
 * Long-form editorial. The narrative runs in a narrow measure with a wide
 * photograph breaking out of it, so the page has two distinct reading modes
 * rather than one uniform column.
 */
export function AboutStory() {
  return (
    <section
      aria-labelledby="story-heading"
      className="relative bg-background py-24 sm:py-28 lg:py-36"
    >
      <Container>
        <div className="flex items-center gap-4">
          <span aria-hidden className="h-px w-8 bg-accent" />
          <span className="eyebrow">The Story</span>
        </div>

        <h2
          id="story-heading"
          className="mt-7 max-w-5xl text-[clamp(2.25rem,6.5vw,5.25rem)] tracking-display"
        >
          <SplitLines
            as="span"
            lines={[
              "It began with a",
              "lever machine and a",
              "frustration about milk.",
            ]}
          />
        </h2>

        {/* Full-bleed photograph, pulled out of the container measure. */}
        <div className="mt-14 lg:mt-20">
          <RevealImage
            src="/images/space-room.jpg"
            alt="A cafe interior with a green painted ceiling, long timber tables and stools."
            width={1800}
            height={1000}
            // Full-bleed but inside the 110rem container, so it never needs a
            // true-viewport-width derivative.
            sizes="(max-width: 640px) 92vw, (max-width: 1760px) 88vw, 1680px"
            className="aspect-16/9 w-full sm:aspect-21/9"
            parallax={6}
          />
        </div>

        <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16">
          <SlideReveal from="up" className="lg:col-span-7 lg:col-start-2">
            {/* Three paragraphs, down from five. The blend's eleven versions and the
                abandoned second location were good writing that the page does not
                need in order to say what it says. */}
            <div className="space-y-6 text-pretty leading-[1.75] text-muted-foreground">
              <p className="font-display text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-foreground italic">
                In 2019 the space was twelve square metres, the machine was a
                second-hand lever, and the sign outside was a sheet of card with
                the word &ldquo;espresso&rdquo; written on it in marker.
              </p>
              <p>
                After eight years of pulling shots on other people&rsquo;s behalf, we
                wanted to make one coffee and make it the same every morning. Eleven
                versions of the blend later: a dark roast, mostly Brazil, with a
                small Ethiopian component for the fruit.
              </p>
              <p>
                Everything since has been logistics around that decision. We roast on
                site so the coffee rests the days it needs. We never added music, and
                we never added a second blend.
              </p>
            </div>
          </SlideReveal>

          <Reveal className="mt-12 flex flex-wrap gap-4 lg:col-span-7 lg:col-start-2">
            <ButtonLink href="/menu" variant="outline" arrow>
              See what we make
            </ButtonLink>
            <ButtonLink href="/gallery" variant="ghost">
              Look at the room
            </ButtonLink>
          </Reveal>

          {/* Side rail: pull quotes from the people who work here. */}
          <aside className="lg:col-span-3 lg:col-start-10">
            <Reveal stagger={0.1} className="flex flex-col gap-10 lg:sticky lg:top-32">
              {[
                {
                  quote:
                    "The blend took two years. Everything else was easy by comparison.",
                  by: "Marisol Reyes — Head Barista",
                },
                {
                  quote:
                    "A quiet room is not a marketing decision. It is just a quiet room.",
                  by: "Dev Anand — Founder",
                },
              ].map((entry) => (
                <figure key={entry.by}>
                  <blockquote className="border-l border-accent/60 pl-5">
                    <p className="font-display text-xl leading-snug text-foreground italic">
                      {entry.quote}
                    </p>
                  </blockquote>
                  <figcaption className="micro mt-4 pl-6 text-muted-foreground">
                    {entry.by}
                  </figcaption>
                </figure>
              ))}
            </Reveal>
          </aside>
        </div>

        {/* Space section: three architectural details. */}
        <div className="mt-24 lg:mt-36">
          <div className="flex items-end justify-between gap-8 border-b border-border pb-8">
            <h3 className="text-[clamp(1.75rem,4vw,3rem)] tracking-display">
              The room
            </h3>
            <p className="micro hidden text-muted-foreground sm:block">
              Timber, brass, no music
            </p>
          </div>

          <Reveal
            stagger={0.1}
            margin="-6% 0px -6% 0px"
            className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10"
          >
            {[
              {
                image: "/images/space-seating.jpg",
                alt: "A bright cafe interior with rattan chairs, plants and long shared tables.",
                title: "Long table",
                body: "Eleven metres of walnut down the centre of the room. It seats fourteen and it is the first thing to go.",
              },
              {
                image: "/images/space-window.jpg",
                alt: "A wooden table by a window with a notebook, sunglasses and a small coffee.",
                title: "Window seats",
                body: "Four of them, facing out. The best light in the building arrives at about half past ten.",
              },
              {
                image: "/images/space-counter.jpg",
                alt: "A barista behind the counter, with grinders and an espresso machine along the bar.",
                title: "The bar",
                body: "Three groups, a brass counter, and no menu board behind it. Everything is priced on a card you can read standing up.",
              },
            ].map((entry) => (
              <article key={entry.title} className="group">
                <div className="relative aspect-4/5 overflow-hidden bg-background-raised">
                  <Image
                    src={entry.image}
                    alt={entry.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, 32vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                  />
                </div>
                <h4 className="mt-5 font-display text-2xl tracking-display">
                  {entry.title}
                </h4>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {entry.body}
                </p>
              </article>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}