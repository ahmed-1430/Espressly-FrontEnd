import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { TextLink } from "@/components/ui/text-link";

const values = [
  {
    index: "01",
    title: "The same coffee every day",
    body: "Consistency is a discipline, not a slogan. We weigh every dose, log every dial setting, and taste the first and the twentieth shot of the day. If they are not identical, we fix it before we open.",
    commitment: "Dial settings logged daily",
  },
  {
    index: "02",
    title: "Rest is a real variable",
    body: "Coffee needs days after roasting, not hours. We roast on site so the bag can say what actually happened, and we will talk you out of a bag that has been on a shelf too long.",
    commitment: "Roasted Tue & Fri, on site",
  },
  {
    index: "03",
    title: "Price is not a personality",
    body: "Nothing here costs more because it is trendy. No flavoured syrups, no single-origin theatrics, no 250 ml of foam. The costs we do charge for are labour, rent and green beans.",
    commitment: "One blend, no variants",
  },
  {
    index: "04",
    title: "Make it for everyone",
    body: "Oat and soy on any espresso, decaf that tastes like coffee, a room you can sit in for four hours. If a detail makes the room harder to be in, we change the detail.",
    commitment: "Step-free entrance",
  },
] as const;

/**
 * Values.
 *
 * A commitments list on parchment: each value paired with a concrete, checkable
 * practice rather than an adjective. This is the section that has to be specific
 * to be worth reading.
 */
export function AboutValues() {
  return (
    <section
      aria-labelledby="values-heading"
      className="relative overflow-hidden bg-surface-parchment text-ink-espresso"
    >
      <Container className="py-24 sm:py-28 lg:py-36">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent-deep" />
              <span className="eyebrow eyebrow-dark">Values</span>
            </div>
            <h2
              id="values-heading"
              className="mt-7 text-[clamp(2rem,5vw,3.75rem)] tracking-display"
            >
              Four commitments
              <br />
              we can be held to
            </h2>
          </div>

          <p className="max-w-sm text-pretty leading-relaxed text-ink-espresso-soft">
            Values are only useful when they are specific enough to fail. These
            four can be checked by anyone who works a shift here.
          </p>
        </div>

        <Reveal
          stagger={0.09}
          margin="-6% 0px -6% 0px"
          className="mt-16 flex flex-col lg:mt-20"
        >
          {values.map((value) => (
            <article
              key={value.index}
              className="group grid gap-4 border-t border-border-dark py-9 transition-colors duration-500 hover:border-accent-deep sm:gap-8 lg:grid-cols-12 lg:py-11"
            >
              <p className="micro pt-1.5 text-accent-deep lg:col-span-1">
                {value.index}
              </p>

              <h3 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight tracking-display lg:col-span-6">
                {value.title}
              </h3>

              <p className="text-pretty leading-relaxed text-ink-espresso-soft lg:col-span-5">
                {value.body}
              </p>

              {/*
                The commitment badge takes a row of its own rather than a share of
                the twelve. Sharing tracks squeezed "Roasted Tue & Fri, on site"
                into a 91px column at tablet width, which wrapped the stamp onto
                five lines; on its own row it reads as the stamped footnote it is
                meant to be.
              */}
              <p className="lg:col-span-12 lg:mt-1">
                <span className="micro inline-flex items-center gap-2 border border-border-dark px-3 py-2 text-accent-deep">
                  {value.commitment}
                </span>
              </p>
            </article>
          ))}
        </Reveal>

        <Reveal className="mt-14 flex flex-col gap-6 border-t border-border-dark pt-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-pretty leading-relaxed text-ink-espresso-soft">
            If we ever fail one of these, tell us. We would rather hear it from you
            than work around it.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <TextLink href="/contact" tone="parchment">
              Get in touch
            </TextLink>
            <TextLink href="/gallery" tone="parchment">
              See the room
            </TextLink>
          </div>
        </Reveal>
      </Container>

      <Container className="relative pb-16 lg:pb-24">
        <div className="border-t border-border-dark pt-12">
          <ButtonLink href="/menu" variant="quiet" arrow>
            Read the menu
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}