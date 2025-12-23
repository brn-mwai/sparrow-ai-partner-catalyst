import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sparrow AI - Practice on AI, Close on Humans',
  description: 'AI-powered sales training platform. Practice calls with realistic AI prospects that push back, raise objections, and give you instant feedback to improve.',
  keywords: ['sales training', 'AI sales coach', 'cold call practice', 'objection handling', 'sales roleplay', 'SDR training'],
  authors: [{ name: 'Sparrow AI Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Sparrow AI - Practice on AI, Close on Humans',
    description: 'AI-powered sales training platform. Practice calls with realistic AI prospects that push back like real buyers.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Sparrow AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sparrow AI - Practice on AI, Close on Humans',
    description: 'AI-powered sales training platform. Practice calls with realistic AI prospects that push back like real buyers.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/bold/style.css"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/fill/style.css"
            crossOrigin="anonymous"
          />
        </head>
        <body>
          {children}
          <Script
            src="https://unpkg.com/@phosphor-icons/web@2.0.3"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
