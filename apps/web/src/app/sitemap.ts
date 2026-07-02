import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/projekti", "/o-nama", "/kontakt"].map((path) => ({ url: `${site.url}${path}`, lastModified: new Date(), changeFrequency: "monthly", priority: path === "/" ? 1 : 0.8 }));
}
