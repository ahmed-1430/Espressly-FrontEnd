import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { products } from "@/data/products";

/**
 * Wholesale enquiry block.
 *
 * The shop has no cart, so the closing section is what a guest actually needs:
 * how to order large quantities, and where to collect an order already placed.
 */
export function ShopEnquiry() {
  const lead = products[0];

  return (
    <section
      aria-labelledby="shop-enquiry-title"
      className="relative overflow-hidden border-t border-border bg-surface-parchment text-ink-espresso"
    >
      <Container className="py-24 sm:py-28 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent-deep" />
              <span className="eyebrow eyebrow-dark">Ordering</span>
            </div>

            <h2
              id="shop-enquiry-title"
              className="mt-7 text-[clamp(2rem,5vw,3.75rem)] tracking-display"
            >
              No cart, deliberately
            </h2>

            <div className="mt-8 max-w-xl space-y-5 text-pretty leading-relaxed text-ink-espresso-soft">
              <p>
                We have not built a checkout, because we would rather you tell us
                what you brew on and we would rather send the right grind. Beans go
                out within two working days, and everything ships in a compostable
                valve bag.
              </p>
              <p>
                For cafés, offices and restaurants we can set up a standing order
                with a fixed weekly volume and a delivery day that suits your
                delivery run. Tell us the volume and we will send a price list.
              </p>
            </div>

            <Reveal className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/contact" variant="quiet" arrow>
                Start an enquiry
              </ButtonLink>
              <ButtonLink href="/menu" variant="ghost" className="text-ink-espresso">
                Taste it first
              </ButtonLink>
            </Reveal>

            <dl className="mt-14 grid gap-x-10 gap-y-8 border-t border-border-dark pt-10 sm:grid-cols-3">
              {[
                { label: "Dispatch", value: "Within 2 working days" },
                { label: "Shipping", value: "Free over $60" },
                { label: "Grinding", value: "Tell us how you brew" },
              ].map((entry) => (
                <div key={entry.label}>
                  <dt className="micro text-ink-espresso-soft">{entry.label}</dt>
                  <dd className="mt-2 text-pretty leading-snug">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <figure>
              <div className="relative aspect-4/5 overflow-hidden bg-coffee-mocha">
                <Image
                  src={lead.image}
                  alt="Roasted coffee beans filling the frame in a dense macro texture."
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 38vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="micro mt-4 text-ink-espresso-soft">
                {lead.name} — roasted Tuesdays and Fridays
              </figcaption>
            </figure>
          </div>
        </div>
      </Container>
    </section>
  );
}