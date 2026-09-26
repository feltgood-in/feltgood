import React from 'react';
import HomeClient from './HomeClient';

export default async function Page() {
  let homeData = null;
  let prodData = { products: [], categories: [] };
  
  try {
    if (!process.env.API_URL && process.env.VERCEL) {
      console.warn('Skipping homepage fetch on Vercel build because API_URL is not set.');
    } else {
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      const [homeRes, prodRes] = await Promise.all([
        fetch(`${apiUrl}/api/homepage`, { next: { revalidate: 60 } }),
        fetch(`${apiUrl}/api/products`, { next: { revalidate: 60 } })
      ]);
      
      if (homeRes.ok) {
        homeData = await homeRes.json();
      }
      if (prodRes.ok) {
        prodData = await prodRes.json();
      }
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
