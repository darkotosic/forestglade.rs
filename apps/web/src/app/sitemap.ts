import type { MetadataRoute } from "next";
import { apartments } from "@/data/apartments";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/projekti",
    "/projekat",
    "/apartmani",
    "/galerija",
    "/lokacija",
    "/virtuelne-setnje",
    "/o-nama",
    "/kontakt",
  ];
  const apartmentPaths = apartments.map((apartment) => `/apartmani/${apartment.slug}`);

  return [...staticPaths, ...apartmentPaths].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
