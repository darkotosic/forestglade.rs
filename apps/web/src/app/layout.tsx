import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer, Header } from "@/components/site-shell";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://forestglade.rs"),
  title: { default: "Forest Glade Apart Hotel Vrdnik", template: "%s | Forest Glade" },
  description: "Premium apart-hotel u Vrdniku, Velika Međa bb, sa 31 apartmanom i digitalnim prodajnim centrom.",
  openGraph: { title: "Forest Glade Apart Hotel Vrdnik", description: "31 apartman u premium apart-hotelu u Vrdniku.", locale: "sr_RS", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sr" className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}>
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased"><Header />{children}<Footer /></body>
    </html>
  );
}
