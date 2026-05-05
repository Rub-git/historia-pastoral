import type { Metadata } from 'next';
import { Inter, Libre_Baskerville } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

export const dynamic = 'force-dynamic';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const libreBaskerville = Libre_Baskerville({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre-baskerville',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'Pastoral History',
  description: 'A Pastoral Care & Spiritual Accompaniment System',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Pastoral History',
    description: 'A Pastoral Care & Spiritual Accompaniment System',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={`${inter.variable} ${libreBaskerville.variable} font-sans min-h-screen bg-warm-50`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}