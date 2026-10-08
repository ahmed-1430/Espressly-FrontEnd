import { Container } from "@/components/layout/container";
import { Reveal } from "@/components/motion/reveal";

const team = [
  {
    name: "Dev Anand",
    role: "Founder",
    since: "2019",
    note: "Opened the first twelve square metres with one lever machine and a sheet of card for a sign. Still works the bar on Saturdays.",
  },
  {
    name: "Marisol Reyes",
    role: "Head Barista",
    since: "2020",
    note: "Wrote the recipe card every drink on our menu is built from, and most of the blend notes on the beans we sell.",
  },
  {
    name: "Tomas Beck",
    role: "Roaster",
    since: "2024",
    note: "Runs the twelve-kilo drum in the back room, Tuesdays and Fridays, starting at five in the morning.",
  },
  {
    name: "Priya Raman",
    role: "Kitchen",
    since: "2022",
    note: "Laminates the pastry each morning before the first pour. Has opinions about butter, all of which are correct.",
  },
] as const;

/**
 * Team roster.
 *
 * Deliberately typographic rather than a grid of headshots. We do not have
 * photographs of the people who work here, and putting stock images of unrelated
 * scenes beside their names would misrepresent them. The names, roles and dates
 * carry the section instead.
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
            Everyone here pulls on bar. Nobody works a register while somebody else
            does the hard part.
          </p>
        </div>

        <Reveal
          stagger={0.08}
          margin="-6% 0px -6% 0px"
          className="mt-14 grid gap-x-14 gap-y-0 lg:mt-20 lg:grid-cols-2"
        >
          {team.map((person) => (
            <article
              key={person.name}
              className="group flex flex-col gap-5 border-t border-border py-9 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <div className="sm:w-56 sm:shrink-0">
                <h3 className="font-display text-[1.75rem] leading-tight tracking-display">
                  {person.name}
                </h3>
                <p className="micro mt-2 text-accent">{person.role}</p>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <p className="text-pretty leading-relaxed text-muted-foreground">
                  {person.note}
                </p>
                <p className="micro shrink-0 text-muted-foreground/70 sm:pt-1">
                  Since {person.since}
                </p>
              </div>
            </article>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}