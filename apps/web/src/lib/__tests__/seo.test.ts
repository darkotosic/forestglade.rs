import assert from "node:assert/strict";
import test from "node:test";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { absoluteUrl, canonicalSiteUrl, createPageMetadata, publicRoutes } from "@/lib/seo";

test("canonicalSiteUrl normalizes configured origins and rejects unsafe values", () => {
  assert.equal(canonicalSiteUrl("https://www.forestglade.rs/path/"), "https://www.forestglade.rs");
  assert.equal(canonicalSiteUrl("javascript:alert(1)"), "https://forestglade.rs");
  assert.equal(canonicalSiteUrl("not a URL"), "https://forestglade.rs");
  assert.equal(absoluteUrl("/kontakt", "https://forestglade.rs"), "https://forestglade.rs/kontakt");
});

test("createPageMetadata emits a self-canonical Serbian search and social identity", () => {
  const metadata = createPageMetadata({
    title: "Forest Glade test",
    description: "Test opis",
    path: "/projekat",
  });

  assert.equal(metadata.alternates?.canonical, "https://forestglade.rs/projekat");
  assert.deepEqual(metadata.alternates?.languages, {
    "sr-RS": "https://forestglade.rs/projekat",
    "x-default": "https://forestglade.rs/projekat",
  });
  assert.equal(metadata.openGraph?.url, "https://forestglade.rs/projekat");
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: "Forest Glade test",
    description: "Test opis",
  });
});

test("sitemap contains each indexable route exactly once", () => {
  const entries = sitemap();
  const urls = entries.map(({ url }) => url);

  assert.equal(new Set(urls).size, urls.length);
  for (const route of publicRoutes) {
    assert.ok(urls.includes(absoluteUrl(route.path)));
  }
  assert.ok(entries.every(({ url }) => url.startsWith("https://")));
  assert.ok(
    entries.every(({ priority }) => priority !== undefined && priority >= 0 && priority <= 1),
  );
});

test("robots advertises the sitemap and protects non-public routes", () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
  const disallowed = rules.flatMap((rule) => rule.disallow ?? []);

  assert.equal(config.host, canonicalSiteUrl());
  assert.equal(config.sitemap, `${canonicalSiteUrl()}/sitemap.xml`);
  assert.ok(disallowed.includes("/admin/"));
  assert.ok(disallowed.includes("/api/"));
});
