import React from 'react';
import HomeClient from './HomeClient';

export default async function Page() {
  let homeData = null;
  let prodData = { products: [], categories: [] };

  try {
      let apiUrl = 'http://localhost:3000';
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        apiUrl = process.env.NEXT_PUBLIC_SITE_URL;
      } else if (process.env.VERCEL_URL) {
        apiUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.PORT) {
        apiUrl = `http://localhost:${process.env.PORT}`;
      }
      
      const [homeRes, prodRes] = await Promise.all([
        fetch(`${apiUrl}/api/homepage`, { cache: 'no-store' }),
        fetch(`${apiUrl}/api/products`, { cache: 'no-store' })
      ]);

      if (homeRes.ok) {
        homeData = await homeRes.json();
      }
      if (prodRes.ok) {
        prodData = await prodRes.json();
      }
  } catch (err) {
    console.error("Failed to fetch homepage data on server", err);
  }

  return (
    <HomeClient
      initialHomepageData={homeData}
      initialProducts={prodData.products}
      initialCategories={prodData.categories}
    />
  );
}
