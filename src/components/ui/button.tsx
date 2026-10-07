import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden font-medium tracking-[0.14em] uppercase transition-[color,background-color,border-color,transform] duration-300 ease-[var(--ease-out-quart)] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Solid copper. The single loudest call to action on the site, used once per view.
  primary: "bg-accent text-accent-foreground hover:bg-accent-bright",
  // Hairline outline that fills from the bottom on hover.
  outline:
    "border border-border-strong text-foreground hover:border-accent hover:text-accent-bright",
  // Text-only with an underline that draws in from the left.
  ghost: "px-0 text-foreground-soft hover:text-foreground",
  // For use on parchment sections.
  quiet: "border border-border-dark-strong text-ink-espresso hover:border-accent-deep hover:text-accent-deep",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-5 text-[0.6875rem]",
  md: "h-12 px-7 text-xs",
  lg: "h-14 px-9 text-xs",
};

/**
 * The underline sweep shared by outline and ghost variants. Uses a pseudo-element
 * scale rather than animating width so it stays on the compositor.
 */
function sweep(variant: Variant) {
  if (variant === "primary") return null;
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:scale-x-100",
        variant === "quiet" ? "bg-accent-deep" : "bg-accent",
      )}
    />
  );
}

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Renders a trailing arrow that slides on hover. */
  arrow?: boolean;
};

function Content({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span className="relative z-10">{children}</span>
      {arrow ? (
        <svg
          aria-hidden
          viewBox="0 0 24 12"
          fill="none"
          className="relative z-10 h-3 w-6 shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1.5"
        >
          <path
            d="M0 6h21m0 0-5-5m5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </>
  );
}

export function ButtonLink({
  children,
  variant = "primary",
  size = "md",
  className,
  arrow = false,
  href,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <Content arrow={arrow}>{children}</Content>
      {sweep(variant)}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  arrow = false,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      <Content arrow={arrow}>{children}</Content>
      {sweep(variant)}
    </button>
  );
}