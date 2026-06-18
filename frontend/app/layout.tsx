import type { Metadata } from "next";
import { Chelsea_Market } from "next/font/google";
import "@/styles/globals.css";
import { AppThemeProvider } from "@/components/providers/ThemeProvider";

const chelseaMarket = Chelsea_Market({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-chelsea-market",
});

export const metadata: Metadata = {
  title: "TeenVerse - AI-Powered Youth Mental Health Platform",
  description:
    "Comprehensive platform for assessing and monitoring adolescent mental health risks using advanced AI",
  keywords: [
    "mental health",
    "youth",
    "AI",
    "assessment",
    "risk prediction",
    "teenagers",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={chelseaMarket.variable}>
      <body className={chelseaMarket.className}>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
