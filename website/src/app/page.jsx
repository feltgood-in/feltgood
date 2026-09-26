import React from 'react';
import HomeClient from './HomeClient';
import dbConnect from '../lib/db';
import Homepage from '../lib/models/Homepage';
import Category from '../lib/models/Category';
import Product from '../lib/models/Product';

export const revalidate = 60; // Cache for 60 seconds (ISR) for instant loading

export default async function Page() {
  let homeData = null;
  let prodData = { products: [], categories: [] };

  try {
    await dbConnect();
    
    // Fetch directly from the database instead of doing an HTTP request to ourselves
    const [homeRecord, categories, products] = await Promise.all([
      Homepage.findOne().lean(),
      Category.find().lean(),
      Product.find().lean()
    ]);

    // Serialize Mongoose documents into plain JS objects for the Client Component
    homeData = homeRecord ? JSON.parse(JSON.stringify(homeRecord)) : {};
    prodData = {
      categories: JSON.parse(JSON.stringify(categories || [])),
      products: JSON.parse(JSON.stringify(products || []))
    };

  } catch (err) {
    console.error("Failed to fetch data from DB on server", err);
  }

  return (
    <HomeClient
      initialHomepageData={homeData}
      initialProducts={prodData.products}
      initialCategories={prodData.categories}
    />
  );
}
