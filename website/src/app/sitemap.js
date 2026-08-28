export default async function sitemap() {
  const baseUrl = 'https://feltgood.in';

  // Base static routes
  const staticRoutes = [
    '',
    '/collections',
    '/contact',
    '/search',
    '/item-list'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic products to add to sitemap
  let productRoutes = [];
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/products`);
    if (res.ok) {
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        productRoutes = data.products.map((product) => ({
          url: `${baseUrl}/product/${product.id}`,
          lastModified: new Date(), // If products have updatedAt, use that here
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
      }
    }
  } catch (error) {
    console.error('Error generating sitemap for products:', error);
  }

  return [...staticRoutes, ...productRoutes];
}
