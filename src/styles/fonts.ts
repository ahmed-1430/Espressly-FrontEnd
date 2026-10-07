import { Cormorant_Garamond, Inter } from "next/font/google";

/**
 * Espressly typography.
 *
 * Display: Cormorant Garamond, a Garamond revival with sharp, editorial contrast.
 * It reads as fashion and hospitality rather than technology, and it holds up at
 * the very large sizes the hero uses.
 *
 * Body/UI: Inter, chosen for open counters at small sizes and a tall lowercase,
 * which keeps dense menu rows legible.
 */

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

export const fontVariables = `${cormorant.variable} ${inter.variable}`;

/**
 * Typography scale used across the site. Declared once here so headings stay
 * consistent between pages instead of drifting per component.
 */
export const typeScale = {
  hero: "text-[clamp(3.25rem,13vw,11.5rem)]",
  display: "text-[clamp(2.75rem,9vw,7.5rem)]",
  heading: "text-[clamp(2rem,5.2vw,4.25rem)]",
  subheading: "text-[clamp(1.5rem,3vw,2.5rem)]",
  lede: "text-[clamp(1.0625rem,1.35vw,1.25rem)]",
  body: "text-[0.9375rem] sm:text-base",
} as const;