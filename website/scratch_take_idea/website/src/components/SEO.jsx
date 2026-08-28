import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../context/LanguageContext';

const SEO = ({ title, description, keywords, image, url }) => {
  const { language } = useLanguage();

  const defaultTitle = language === 'es' ? 'Felt Good | Hecho a Mano con Corazón' : 'Felt Good | Handcrafted with Heart';
  const defaultDescription = language === 'es' 
    ? 'Productos premium hechos a mano curados para una vida moderna y colecciones expresivas.'
    : 'Premium handmade products curated for modern living and expressive collections.';
  const defaultKeywords = language === 'es'
    ? 'hecho a mano, fieltro, cerámica, alfarería, artesanal, decoración, estilo de vida'
    : 'handmade, felt, ceramic, pottery, handcrafted, artisanal, home decor, lifestyle';

  const seoTitle = title ? `${title} | Felt Good` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const seoImage = image || 'https://feltgood.in/feltgood.svg'; // Or a full URL to an Open Graph image
  const seoUrl = url ? `https://feltgood.in${url}` : 'https://feltgood.in';

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;
