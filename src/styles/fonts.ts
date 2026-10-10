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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});

export const fontVariables = `${cormorant.variable} ${inter.variable}`;