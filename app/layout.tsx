import type { Metadata } from "next";
import { Inter, Newsreader, Playfair_Display } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// ─── Sans-serif: UI workhorse — navigation, buttons, body, labels ───────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

// ─── Display: hero headline only — Playfair Display for ENSIAS HUB title ──────
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

// ─── Serif: impact-only — hero titles, h1/h2, big stats (Railway "Signifier") ─
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: 'ENSIAS Hub',
  description: 'Ensias un jour, Ensias pour toujours',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${newsreader.variable} ${playfair.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              theme="dark"
              richColors
              toastOptions={{
                style: {
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
