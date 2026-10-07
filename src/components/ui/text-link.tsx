import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Text link with a line that wipes in from the left on hover. Used for inline
 * editorial references; for standalone CTAs use ButtonLink instead.
 */
export function TextLink({
  href,
  children,
  className,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "parchment";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link relative inline-flex items-center gap-2 pb-1 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300",
        tone === "parchment"
          ? "text-ink-espresso hover:text-accent-deep"
          : "text-foreground hover:text-accent-bright",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px origin-left scale-x-[0.25] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/link:scale-x-100",
          tone === "parchment" ? "bg-accent-deep" : "bg-accent",
        )}
      />
      {children}
      <svg
        aria-hidden
        viewBox="0 0 24 12"
        fill="none"
        className="h-2.5 w-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/link:translate-x-1"
      >
        <path
          d="M0 6h21m0 0-5-5m5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </Link>
  );
}