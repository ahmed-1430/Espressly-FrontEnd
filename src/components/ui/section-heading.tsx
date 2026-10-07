import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Section heading block. The eyebrow + rule + heading + optional note is the
 * repeated editorial header used across every page, so it lives in one place.
 */
export function SectionHeading({
  eyebrow,
  title,
  note,
  align = "left",
  tone = "dark",
  action,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  note?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "parchment";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        action && "lg:flex-row lg:items-end lg:justify-between lg:gap-12",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <div
          className={cn(
            "flex items-center gap-4",
            align === "center" && "justify-center",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "h-px w-8",
              tone === "parchment" ? "bg-accent-deep" : "bg-accent",
            )}
          />
          <span
            className={cn(
              "eyebrow",
              tone === "parchment" && "eyebrow-dark",
            )}
          >
            {eyebrow}
          </span>
        </div>

        <h2
          className={cn(
            "mt-6 text-[clamp(2rem,5vw,4rem)] tracking-display",
            tone === "parchment" ? "text-ink-espresso" : "text-foreground",
          )}
        >
          {title}
        </h2>

        {note ? (
          <p
            className={cn(
              "mt-5 max-w-xl text-pretty leading-relaxed",
              tone === "parchment"
                ? "text-ink-espresso-soft"
                : "text-muted-foreground",
            )}
          >
            {note}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}