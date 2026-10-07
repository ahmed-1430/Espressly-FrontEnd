import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A page section with the vertical rhythm baked in. Every page composes these so
 * spacing stays consistent rather than being re-decided per block.
 */
export function Section({
  children,
  className,
  id,
  tone = "dark",
  spacing = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  /** `dark` on espresso, `parchment` for the light counterpoint sections. */
  tone?: "dark" | "sunken" | "parchment";
  spacing?: "tight" | "default" | "loose";
}) {
  const tones = {
    dark: "bg-background text-foreground",
    sunken: "bg-background-sunken text-foreground",
    parchment: "bg-surface-parchment text-ink-espresso",
  } as const;

  const spacings = {
    tight: "py-16 sm:py-20",
    default: "py-24 sm:py-28 lg:py-36",
    loose: "py-28 sm:py-36 lg:py-48",
  } as const;

  return (
    <section
      id={id}
      className={cn("relative", tones[tone], spacings[spacing], className)}
    >
      {children}
    </section>
  );
}