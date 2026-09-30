import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FavoritesSync from "../components/FavoritesSync";
import { themeInitScript } from "../lib/theme";

export const metadata: Metadata = {
  title: "Shopora — A Better Way to Shop",
  description:
    "Discover quality products at great prices with Shopora.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Blocking script: applies the saved/preferred theme to <html>
          before React hydrates, so there's no flash of the wrong
          theme. `beforeInteractive` is Next.js's documented strategy
          for exactly this (theme detection before hydration) — a raw
          <script> tag in JSX triggers a React warning since React
          won't execute a script tag it renders on the client.
          suppressHydrationWarning above stops React from complaining
          that this script changed <html>'s class outside of its
          control.
        */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>

      <body className="flex min-h-screen flex-col">
        <FavoritesSync />
        <Navbar />

        <div className="flex-1">{children}</div>

        <Footer />
      </body>
    </html>
  );
}
