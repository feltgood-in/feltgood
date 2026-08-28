import React from 'react';
import ProductClient from './ProductClient';

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    // In server components, fetch requires absolute URLs.
    if (!process.env.API_URL && process.env.VERCEL) {
      throw new Error('Skipping product metadata fetch on Vercel build because API_URL is not set.');
    }
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/products`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    
    const data = await res.json();
    const product = data.products?.find(p => p.id === id);
    
    if (product) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
      const ogImage = product.images?.[0] 
        ? `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_1200,h_630/${product.images[0]}`
        : 'https://feltgood.in/feltgood.svg';

      return {
        title: `${product.name} | Felt Good`,
        description: product.description,
        openGraph: {
          title: `${product.name} | Felt Good`,
          description: product.description,
          images: [ogImage],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${product.name} | Felt Good`,
          description: product.description,
          images: [ogImage],
        }
      };
    }
  } catch (err) {
    console.error("Error generating metadata for product", err);
  }
  
  return {
    title: 'Product Not Found | Felt Good',
  };
}

export default async function ProductPage({ params }) {
  const { id } = params;
  let product = null;
  
  try {
    if (!process.env.API_URL && process.env.VERCEL) {
      throw new Error('Skipping product JSON-LD fetch on Vercel build because API_URL is not set.');
    }
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/products`);
    if (res.ok) {
      const data = await res.json();
      product = data.products?.find(p => p.id === id);
    }
  } catch (e) {
    console.error("Failed to fetch product for JSON-LD");
  }

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.[0] ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'}/image/upload/${product.images[0]}` : undefined,
    description: product.description,
    sku: product.itemNumber || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Felt Good'
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductClient />
    </>
  );
}
