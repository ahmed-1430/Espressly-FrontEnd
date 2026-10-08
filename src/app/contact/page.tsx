import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/layout/container";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactDetails, ContactFaq } from "@/components/contact/contact-details";
import { location, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Address, opening hours, wholesale enquiries and a direct line to the bar at Espressly on ${location.street}. We answer within two working days.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact — ${siteConfig.name}`,
    description: "The door is on Queen Street. Here is when it is open, and how to reach us.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact"
        lede="The door is on Queen Street West. Ask for the counter, not a manager — the person who pulls your coffee is the person who will answer."
        image="/images/space-counter.jpg"
        imageAlt="A warmly lit cafe counter lined with bottles and pendant lights."
        meta={[
          { label: "Reply within", value: "2 working days" },
          { label: "Kitchen until", value: "15:00" },
          { label: "Last pour", value: "Close − 30 min" },
        ]}
      />

      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Form first in the source order: it is the primary action. */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Send a message</span>
            </div>
            <h2 className="mt-7 text-[clamp(2rem,5vw,3.25rem)] tracking-display">
              Write to us
            </h2>
            <p className="mt-5 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              For wholesale, private hire, press, or feedback about a visit. We read
              everything ourselves and answer within two working days.
            </p>

            <div className="mt-12">
              <ContactForm />
            </div>
          </div>

          <aside className="lg:col-span-5 lg:border-l lg:border-border lg:pl-14">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Details</span>
            </div>
            <h2 className="mt-7 text-[clamp(2rem,5vw,3.25rem)] tracking-display">
              Find the door
            </h2>
            <div className="mt-10">
              <ContactDetails />
            </div>
          </aside>
        </div>
      </Container>

      <ContactFaq />
    </>
  );
}