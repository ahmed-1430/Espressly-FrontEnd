import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Horizontal rhythm. `size` controls the gutter and max width together so the
 * composition stays proportional from 320px up to ultrawide.
 */
export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide" | "full";
  as?: "div" | "header" | "footer" | "section" | "nav";
}) {
  const sizes = {
    narrow: "max-w-3xl",
    default: "max-w-[86rem]",
    wide: "max-w-[110rem]",
    full: "max-w-none",
  } as const;

  return (
    <Tag className={cn("mx-auto w-full px-5 sm:px-8 lg:px-12", sizes[size], className)}>
      {children}
    </Tag>
  );
}