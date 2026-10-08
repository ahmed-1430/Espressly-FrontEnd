import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const siteUrl = process.env.SITE_URL ?? siteConfig.url;

/**
 * Sitemap.
 *
 * The six public routes, with the home page given the highest priority and the
 * shop and menu pages the longest change interval, since their content updates
 * on a roast cycle rather than daily.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-01-15");

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/menu`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}