import type { MetadataRoute } from "next";

const DEFAULT_SITE_URL = "https://forestglade.rs";

export const publicRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/apartmani", changeFrequency: "daily", priority: 0.9 },
  { path: "/projekat", changeFrequency: "monthly", priority: 0.9 },
  { path: "/projekti", changeFrequency: "monthly", priority: 0.8 },
  { path: "/galerija", changeFrequency: "monthly", priority: 0.8 },
  { path: "/lokacija", changeFrequency: "yearly", priority: 0.7 },
  { path: "/virtuelne-setnje", changeFrequency: "monthly", priority: 0.7 },
  { path: "/o-nama", changeFrequency: "yearly", priority: 0.6 },
  { path: "/kontakt", changeFrequency: "yearly", priority: 0.6 },
] as const satisfies ReadonlyArray<{
  path: `/${string}`;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}>;

/** Returns an absolute, canonical origin without a trailing slash or path. */
export function canonicalSiteUrl(configuredUrl = process.env.NEXT_PUBLIC_SITE_URL): string {
  try {
    const url = new URL(configuredUrl || DEFAULT_SITE_URL);
    if (url.protocol !== "https:" && url.protocol !== "http:") return DEFAULT_SITE_URL;
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function absoluteUrl(path: `/${string}`, origin = canonicalSiteUrl()): string {
  return path === "/" ? origin : `${origin}${path}`;
}
