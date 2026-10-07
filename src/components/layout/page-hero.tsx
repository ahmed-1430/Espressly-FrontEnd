import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

/**
 * Editorial monogram. Built from the logo's cup mark rather than a glyph, so the
 * page furniture carries the same mark as the header.
 */
export function Monogram({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <Image
      src="/brand/icon-192.png"
      alt=""
      width={192}
      height={192}
      className={cn("rounded-full object-cover", sizes[size], className)}
    />
  );
}

/**
 * Page masthead used by every inner route.
 *
 * Deliberately consistent: same eyebrow, same hairline, same heading scale. Only
 * the note line and the image change, so the pages feel like one publication.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  meta,
  children,
  align = "split",
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  image?: string;
  imageAlt?: string;
  /** Small metadata shown along the bottom edge, e.g. counts and hours. */
  meta?: readonly { label: string; value: string }[];
  children?: ReactNode;
  align?: "split" | "center";
  tone?: "dark" | "parchment";
}) {
  const isParchment = tone === "parchment";

  return (
    <header
      className={cn(
        "relative overflow-hidden border-b",
        isParchment ? "border-border-dark bg-surface-parchment" : "border-border bg-background",
      )}
    >
      <div className="mx-auto w-full max-w-[110rem] px-5 pt-28 sm:px-8 sm:pt-32 lg:px-12 lg:pt-40">
        <div
          className={cn(
            "grid gap-10 pb-14 sm:pb-16 lg:pb-20",
            align === "split" && image ? "lg:grid-cols-12 lg:items-end lg:gap-14" : "",
          )}
        >
          <div className={cn(align === "split" ? "lg:col-span-7" : "max-w-4xl")}>
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className={cn("h-px w-8", isParchment ? "bg-accent-deep" : "bg-accent")}
              />
              <span className={cn("eyebrow", isParchment && "eyebrow-dark")}>{eyebrow}</span>
            </div>

            <h1
              className={cn(
                "mt-7 text-[clamp(3rem,11vw,9rem)] tracking-display",
                isParchment ? "text-ink-espresso" : "text-foreground",
                align === "center" && "max-w-none",
              )}
            >
              {title}
            </h1>

            {lede ? (
              <p
                className={cn(
                  "mt-7 max-w-xl text-pretty text-[clamp(1rem,1.35vw,1.1875rem)] leading-relaxed",
                  isParchment ? "text-ink-espresso-soft" : "text-muted-foreground",
                )}
              >
                {lede}
              </p>
            ) : null}

            {children ? <div className="mt-9">{children}</div> : null}
          </div>

          {align === "split" && image ? (
            <figure className="relative lg:col-span-5">
              <div className="relative aspect-4/5 w-full overflow-hidden sm:aspect-16/10 lg:aspect-4/5">
                <Image
                  src={image}
                  alt={imageAlt ?? ""}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-background-sunken/55 via-transparent to-transparent"
                />
              </div>
              {imageAlt ? (
                <figcaption
                  className={cn(
                    "micro mt-3",
                    isParchment ? "text-ink-espresso-soft" : "text-muted-foreground",
                  )}
                >
                  {imageAlt}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </div>

        {meta?.length ? (
          <dl
            className={cn(
              "flex flex-wrap items-center gap-x-10 gap-y-4 border-t py-6",
              isParchment ? "border-border-dark" : "border-border",
            )}
          >
            {meta.map((entry) => (
              <div key={entry.label} className="flex items-baseline gap-3">
                <dt className="micro text-muted-foreground">{entry.label}</dt>
                <dd
                  className={cn(
                    "text-sm",
                    isParchment ? "text-ink-espresso" : "text-foreground-soft",
                  )}
                >
                  {entry.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </header>
  );
}