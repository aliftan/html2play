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
  title: "HTML to Figma - Convert HTML Code to Figma Design",
  description: "Convert your HTML code to Figma-ready design with live preview and viewport switching.",
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ["html", "figma", "converter", "design", "tailwind", "css"],
  authors: [{ name: "alfio" }],
  openGraph: {
    title: "HTML to Figma Converter",
    description: "Convert your HTML code to Figma-ready design with live preview",
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