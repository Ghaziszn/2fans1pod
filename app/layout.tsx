import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Sans } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { GarbageTimeProvider } from "@/components/stats/GarbageTime";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/load";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.name,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <GarbageTimeProvider>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <Header />
            <main id="main" className="mx-auto max-w-[1440px] px-[clamp(16px,4vw,40px)] py-8">
              {children}
            </main>
            <Footer />
          </GarbageTimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
