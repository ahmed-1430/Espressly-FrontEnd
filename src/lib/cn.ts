import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
});

/** Prices are authored as numbers and formatted once, here. */
export function formatPrice(value: number) {
  return currency.format(value);
}

/** Formats a coordinate pair as a compact, label-like string. */
export function formatCoordinates(latitude: number, longitude: number) {
  const ns = latitude >= 0 ? "N" : "S";
  const ew = longitude >= 0 ? "E" : "W";
  return `${Math.abs(latitude).toFixed(4)}°${ns} ${Math.abs(longitude).toFixed(4)}°${ew}`;
}