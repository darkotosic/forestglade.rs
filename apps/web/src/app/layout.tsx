import type { Metadata } from "next";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Forest Glade Apart Hotel | Vrdnik", template: "%s | Forest Glade" },
  description:
    "Forest Glade d.o.o razvija premium apart-hotel u Vrdniku sa 31 apartmanom, savremenom arhitekturom i transparentnom prodajnom prezentacijom.",
  applicationName: "Forest Glade",
  authors: [{ name: "Forest Glade d.o.o", url: site.url }],
  creator: "Forest Glade d.o.o",
  publisher: "Forest Glade d.o.o",
  category: "real estate",
  keywords: [
    "Forest Glade",
    "Forest Glade Vrdnik",
    "Forest Glade Apart Hotel",
    "apartmani Vrdnik",
    "apart hotel Fruška Gora",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: "Forest Glade d.o.o",
        alternateName: "Forest Glade",
        url: site.url,
        email: site.email,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: "Forest Glade",
        alternateName: "Forest Glade Apart Hotel",
        inLanguage: "sr-RS",
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "LodgingBusiness",
        "@id": `${site.url}/#apart-hotel`,
        name: "Forest Glade Apart Hotel",
        url: absoluteUrl("/projekat"),
        description: site.description,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Velika Međa bb",
          addressLocality: "Vrdnik",
          addressCountry: "RS",
        },
        parentOrganization: { "@id": `${site.url}/#organization` },
      },
    ],
  };

  return (
    <html lang="sr">
      <body className="min-h-screen antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
