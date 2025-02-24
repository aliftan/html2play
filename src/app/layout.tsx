import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HTMLplay Preview - Modern HTML Code Editor",
  description: "Live HTML editor with instant preview, viewport switching, and syntax highlighting. Fast, responsive, and developer-friendly.",
  icons: {
    icon: "https://fav.farm/%F0%9F%A6%84"
  },
  keywords: [
    "html",
    "editor",
    "live preview",
    "code editor",
    "web development",
    "viewport preview",
    "html editor",
    "code preview"
  ],
  authors: [{ name: "alfio" }],
  openGraph: {
    title: "HTMLplay",
    description: "Modern HTML code editor with live preview and mobile viewport switching",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}