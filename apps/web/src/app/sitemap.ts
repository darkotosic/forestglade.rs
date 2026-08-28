import type { MetadataRoute } from "next";
import { apartments } from "@/data/apartments";
import { absoluteUrl, publicRoutes } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
  }));
  const apartmentPages = apartments.map((apartment) => ({
    url: absoluteUrl(`/apartmani/${apartment.slug}`),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Do not emit a synthetic lastModified value: search engines should only receive
  // modification dates backed by content data, not the deployment/build timestamp.
  return [...pages, ...apartmentPages];
}
