import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { location, openingHours } from "@/config/site";

/**
 * Closing block for the menu page.
 *
 * Practical information a guest needs before ordering: how the kitchen behaves,
 * allergens, and where the room is. Deliberately quieter than the sections above
 * it so the page ends on information rather than another sales pitch.
 */
export function MenuNotes() {
  const notes = [
    {
      index: "01",
      title: "The kitchen",
      body: "Breakfast and savoury items run until 15:00. Pastry is baked at 06:30 and again at 11:00, and it does sell out — on Saturdays usually by two.",
    },
    {
      index: "02",
      title: "Allergens",
      body: "Our bar handles milk, nuts and gluten. Oat and soy milk are available on any espresso drink, and every espresso can be made with those. Tell us and we will change the station gloves.",
    },
    {
      index: "03",
      title: "Sizes",
      body: "Every drink is a single size. We have tried larger and smaller and neither was better. If you want it stronger, we will make it stronger.",
    },
    {
      index: "04",
      title: "Seasonal board",
      body: "Pumpkin, maple, gingerbread and lavender run from October through to the end of March, or until it runs out, which is usually first.",
    },
  ] as const;

  return (
    <section
      aria-labelledby="menu-notes-title"
      className="relative overflow-hidden border-t border-border bg-background-sunken noise py-24 sm:py-28 lg:py-32"
    >
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">Good to know</span>
            </div>
            <h2
              id="menu-notes-title"
              className="mt-7 text-[clamp(2rem,5vw,3.75rem)] tracking-display"
            >
              Before you order
            </h2>
            <p className="mt-6 max-w-sm text-pretty leading-relaxed text-muted-foreground">
              A short list of things people usually ask at the counter, answered
              before you have to.
            </p>

            <div className="relative mt-10 aspect-4/3 w-full overflow-hidden bg-background-raised">
              <Image
                src="/images/food-viennoiserie.jpg"
                alt="A dark wooden board of croissants and pastries lit from one side."
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal stagger={0.09} className="flex flex-col">
              {notes.map((note) => (
                <article
                  key={note.index}
                  className="group flex gap-6 border-t border-border py-8 sm:gap-10"
                >
                  <span className="micro shrink-0 pt-2 text-accent">
                    {note.index}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl tracking-display sm:text-[1.75rem]">
                      {note.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                      {note.body}
                    </p>
                  </div>
                </article>
              ))}
            </Reveal>

            <Reveal className="mt-12 flex flex-col gap-8 border-t border-border pt-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="micro text-muted-foreground">Come in</p>
                <address className="mt-3 not-italic">
                  <p className="text-pretty leading-relaxed text-foreground-soft">
                    {location.street}, {location.district}
                  </p>
                  <p className="micro mt-2 text-muted-foreground">
                    {openingHours[0].shortDay} {openingHours[0].hours} —{" "}
                    {openingHours[6].shortDay} {openingHours[6].hours}
                  </p>
                </address>
              </div>

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/contact" variant="outline" arrow>
                  Plan a visit
                </ButtonLink>
                <ButtonLink href="/shop" variant="ghost">
                  Beans to take home
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}