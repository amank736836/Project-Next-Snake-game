import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/outfit/latin-400.css";
import "@fontsource/outfit/latin-600.css";
import "@fontsource/outfit/latin-700.css";
import "@fontsource/outfit/latin-800.css";
import "@fontsource/outfit/latin-900.css";
import "./globals.css";

/**
 * Geist ships with the `geist` package and Outfit comes from @fontsource, so
 * typography resolves locally instead of hitting Google Fonts at build time.
 */

export const metadata: Metadata = {
  title: "Nagini · Snake Game",
  description:
    "A neon-infused snake game inspired by Harry Potter — dodge yourself, devour apples, climb the hall of fame.",
  applicationName: "Nagini",
  keywords: ["snake game", "next.js", "arcade", "leaderboard", "nagini"],
  openGraph: {
    title: "Nagini · Snake Game",
    description:
      "A neon-infused snake game inspired by Harry Potter. Slither, devour, grow — then claim the hall of fame.",
    type: "website",
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐍</text></svg>',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06060f" },
    { media: "(prefers-color-scheme: light)", color: "#e9edf7" },
  ],
};

const themeBootstrap = `(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
