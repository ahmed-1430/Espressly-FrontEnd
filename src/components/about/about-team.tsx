import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";

const team = [
  {
    name: "Dev Anand",
    role: "Founder",
    since: "2019",
    note: "Opened the first twelve square metres. Still works the bar on Saturdays.",
    image: "/images/craft-pour.jpg",
  },
  {
    name: "Marisol Reyes",
    role: "Head Barista",
    since: "2020",
    note: "Built the recipe card every drink is built from. Wrote most of the blend notes.",
    image: "/images/space-window.jpg",
  },
  {
    name: "Tomas Beck",
    role: "Roaster",
    since: "2024",
    note: "Runs the twelve-kilo drum in the back room, Tuesdays and Fridays, from five.",
    image: "/images/craft-origin.jpg",
  },
  {
    name: "Priya Raman",
    role: "Kitchen",
    since: "2022",
    note: "Laminates the pastry each morning. Has opinions about butter, all of them right.",
    image: "/images/food-croissant.jpg",
  },
] as const;

/**
 * Team section.
 *
 * Four people, presented as an editorial list rather than avatar cards. Portraits
 * are photography of the work rather than headshots, which keeps the section
 * honest about what the team actually does.
 */
export function AboutTeam() {
  return (
    <section
      aria-labelledby="team-heading"
      className="relative overflow-hidden border-y border-border bg-background-sunken noise py-24 sm:py-28 lg:py-32"
    >
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <span aria-hidden className="h-px w-8 bg-accent" />
              <span className="eyebrow">The Team</span>
            </div>
            <h2
              id="team-heading"
              className="mt-7 text-[clamp(2rem,5vw,3.75rem)] tracking-display"
            >
              Nine people,
              <br />
              one quiet room
            </h2>
          </div>

          <p className="max-w-sm text-pretty leading-relaxed text-muted-foreground">
            Everyone here pulls on bar. Nobody works a register while someone else
            does the hard part.
          </p>
        </div>

        <Reveal
          stagger={0.1}
          margin="-6% 0px -6% 0px"
          className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8"
        >
          {team.map((person) => (
            <article key={person.name} className="group">
              <div className="relative aspect-3/4 overflow-hidden bg-background-raised">
                <Image
                  src={person.image}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 48vw, 24vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-background-sunken/80 via-transparent to-transparent"
                />
                <span className="micro absolute right-4 bottom-4 text-accent-bright">
                  Since {person.since}
                </span>
              </div>

              <h3 className="mt-5 font-display text-2xl tracking-display">
                {person.name}
              </h3>
              <p className="micro mt-2 text-accent">{person.role}</p>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
                {person.note}
              </p>
            </article>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}