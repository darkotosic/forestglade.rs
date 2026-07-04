import type { Metadata } from "next";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Forest Glade Apart Hotel | Vrdnik", template: "%s | Forest Glade" },
  description: "Forest Glade d.o.o razvija premium apart-hotel u Vrdniku sa 31 apartmanom, savremenom arhitekturom i transparentnom prodajnom prezentacijom.",
  openGraph: { title: "Forest Glade Apart Hotel", description: site.description, url: site.url, siteName: "Forest Glade", locale: "sr_RS", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="sr"><body className="min-h-screen antialiased">{children}</body></html>;
}
