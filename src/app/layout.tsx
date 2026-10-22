import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'BLFA Learning Lab — Next.js + Headless WordPress with Docker',
  description:
    'A containerized local development architecture demonstrating Next.js App Router, Headless WordPress CMS, WPGraphQL, and Nginx reverse proxy orchestrated by Docker Compose.',
  keywords: [
    'BLFA',
    'Next.js',
    'WordPress',
    'Headless CMS',
    'WPGraphQL',
    'Docker',
    'Docker Compose',
    'Nginx',
    'MySQL',
  ],
  authors: [{ name: 'BLFA Engineering' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Navbar />
        <main id="main-content" style={{ flex: 1 }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
