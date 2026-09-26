import React, { Suspense } from 'react';
import CollectionsClient from './CollectionsClient';
import dbConnect from '../../lib/db';
import Category from '../../lib/models/Category';
import Product from '../../lib/models/Product';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
  let categoriesData = [];
  let productsData = [];

  try {
    await dbConnect();
    
    // Fetch directly from the database
    const [categories, products] = await Promise.all([
      Category.find().lean(),
      Product.find().lean()
    ]);

    // Serialize Mongoose documents into plain JS objects
    categoriesData = JSON.parse(JSON.stringify(categories || []));
    productsData = JSON.parse(JSON.stringify(products || []));

  } catch (err) {
    console.error("Failed to fetch data from DB on server for collections", err);
  }

  return (
    <Suspense fallback={<div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--color-text-light)', letterSpacing: '2px' }}>LOADING...</p>
    </div>}>
      <CollectionsClient 
        initialProducts={productsData} 
        initialCategories={categoriesData} 
      />
    </Suspense>
  );
}
