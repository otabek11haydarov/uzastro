import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AppProvider from "@/components/AppProvider";
import Shell from "@/components/Shell";
import { LevelUpOverlay, Toasts } from "@/components/Overlays";

const display = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "UzAstro — Koinotni kashf et. Kelajakni yarat.",
  description: "UzAstro — astronomiyani o‘rganish, kunlik vazifalar, jamoalar va AI yordamchi bilan kosmik ta’lim platformasi.",
};

export const viewport: Viewport = {
  themeColor: "#050816",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
          <Toasts />
          <LevelUpOverlay />
        </AppProvider>
      </body>
    </html>
  );
}
