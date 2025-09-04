import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
    title: "Hash.ly - Modern URL Shortener",
    description: "Transform long URLs into clean, shareable links with QR codes and analytics",
    keywords: "url shortener, link shortener, qr, qr code, analytics, hash.ly",
    authors: [{ name: "Bhavya Kandhari" }],
    openGraph: {
        title: "Hash.ly - Modern URL Shortener",
        description: "Transform long URLs into clean, shareable links",
        type: "website",
        url: "https://hash-ly.vercel.app",
    },
    twitter: {
        card: "summary_large_image",
        title: "Hash.ly - Modern URL Shortener",
        description: "Transform long URLs into clean, shareable links",
    },
    robots: {
        index: true,
        follow: true,
    },
    viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    preload: true,
    fallback: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'sans-serif',
    ],
    variable: '--font-inter',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <head>
                <link rel="preconnect" href="https://vercel.live" />
                <link rel="dns-prefetch" href="https://vercel.live" />
                
                <link rel="preconnect" href="https://vitals.vercel-insights.com" />
                <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
            </head>
            <body className={`${inter.className} antialiased`}>
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}