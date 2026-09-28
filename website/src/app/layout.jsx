import React from 'react';
import { InquiryProvider } from '../context/InquiryContext';
import { LanguageProvider } from '../context/LanguageContext';

import Footer from '../components/Footer';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';
import './globals.css';
import dbConnect from '../lib/db';
import Category from '../lib/models/Category';

export const revalidate = 60; // Cache for 60 seconds (ISR) for instant loading

export const metadata = {
  metadataBase: new URL('https://feltgood.in'),
  title: {
    default: 'Felt Good | Premium Home Decor & Handicraft Items',
    template: '%s | Felt Good',
  },
  description: 'Shop Felt Good for premium handmade home decor, authentic handicrafts, and artisanal decor items curated for modern living.',
  keywords: ['Home decor', 'handicraft', 'Felt good', 'decor items', 'handmade', 'felt', 'ceramic', 'pottery', 'handcrafted', 'artisanal', 'lifestyle'],
  openGraph: {
    title: 'Felt Good | Premium Home Decor & Handicraft Items',
    description: 'Shop Felt Good for premium handmade home decor, authentic handicrafts, and artisanal decor items curated for modern living.',
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
    title: 'Felt Good | Premium Home Decor & Handicraft Items',
    description: 'Shop Felt Good for premium handmade home decor, authentic handicrafts, and artisanal decor items curated for modern living.',
    images: ['https://feltgood.in/feltgood.svg'],
  },
};

export default async function RootLayout({ children }) {
  let categories = [];
  try {
    await dbConnect();
    const cats = await Category.find().lean();
    categories = JSON.parse(JSON.stringify(cats || []));
  } catch (err) {
    console.error("Failed to fetch categories for layout", err);
  }

  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <InquiryProvider>
            <ClientLayoutWrapper initialCategories={categories}>
              {children}
            </ClientLayoutWrapper>
          </InquiryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
