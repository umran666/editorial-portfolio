import type { Metadata } from "next";
import { Geist, Inter, JetBrains_Mono } from "next/font/google";
import { CodeBlockClient } from "@/components/CodeBlockClient";
import { getSiteConfig } from "@/lib/content";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shaikumran.blog";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getSiteConfig();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${config.siteTitle} — ${config.authorName}`,
      template: `%s | ${config.siteTitle}`,
    },
    description: config.bio,
    authors: [{ name: config.authorName }],
    creator: config.authorName,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: config.siteTitle,
      title: `${config.siteTitle} — ${config.authorName}`,
      description: config.bio,
      images: [
        {
          url: "/images/articles/uniqtoken.svg",
          width: 1200,
          height: 630,
          alt: `${config.siteTitle} — ${config.authorName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.siteTitle} — ${config.authorName}`,
      description: config.bio,
      images: ["/images/articles/uniqtoken.svg"],
    },
    alternates: {
      types: {
        "application/rss+xml": `${siteUrl}/rss.xml`,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-stone-950 text-stone-100 selection:bg-stone-200 selection:text-stone-950 noise-overlay relative overflow-x-hidden">
        <CodeBlockClient />
        {children}
      </body>
    </html>
  );
}
