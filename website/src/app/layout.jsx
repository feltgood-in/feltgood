import React from 'react';
import { InquiryProvider } from '../context/InquiryContext';
import { LanguageProvider } from '../context/LanguageContext';

import Footer from '../components/Footer';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://feltgood.in'),
  title: {
    default: 'Felt Good | Handcrafted with Heart',
    template: '%s | Felt Good',
  },
  description: 'Premium handmade products curated for modern living and expressive collections.',
  keywords: ['handmade', 'felt', 'ceramic', 'pottery', 'handcrafted', 'artisanal', 'home decor', 'lifestyle'],
  openGraph: {
    title: 'Felt Good | Handcrafted with Heart',
    description: 'Premium handmade products curated for modern living and expressive collections.',
    url: 'https://feltgood.in',
    siteName: 'Felt Good',
    images: [
      {
        url: 'https://feltgood.in/feltgood.svg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Felt Good | Handcrafted with Heart',
    description: 'Premium handmade products curated for modern living and expressive collections.',
    images: ['https://feltgood.in/feltgood.svg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <InquiryProvider>
            <ClientLayoutWrapper>
              {children}
            </ClientLayoutWrapper>
          </InquiryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
