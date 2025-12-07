import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import PageTransition from "@/components/PageTransition";
import { Analytics } from "@vercel/analytics/react";
import CommandPalette from "@/components/CommandPalette";
import NotificationManager from "@/components/NotificationManager";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { FavoritesProvider } from "@/context/FavoritesContext";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Padel Tracker - Live Tournaments, Rankings & Player Stats",
    template: "%s | Padel Tracker",
  },
  description: "Track live padel tournaments, player rankings, head-to-head stats, and follow your favorite professional padel players. Real-time scores and match updates.",
  keywords: ["padel", "padel tracker", "padel rankings", "padel tournaments", "FIP Tour", "Premier Padel", "padel players", "padel stats", "head to head"],
  authors: [{ name: "Padel Tracker" }],
  creator: "Padel Tracker",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://padel-tracker.vercel.app",
    siteName: "Padel Tracker",
    title: "Padel Tracker - Live Tournaments, Rankings & Player Stats",
    description: "Track live padel tournaments, player rankings, head-to-head stats, and follow your favorite professional padel players.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Padel Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Padel Tracker - Live Tournaments & Rankings",
    description: "Track live padel tournaments, player rankings, and head-to-head stats.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Padel Tracker",
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <FavoritesProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              <CommandPalette />
              <NotificationManager />
              <InstallPrompt />
              <PageTransition>
                {children}
              </PageTransition>
              <BottomNav />
              <Analytics />
            </ThemeProvider>
          </FavoritesProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
