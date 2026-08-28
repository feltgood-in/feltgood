'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useInquiry } from '../../context/InquiryContext';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../../cloudinary';
import { useLanguage } from '../../context/LanguageContext';

function SearchContent() {
  const [products, setProducts] = useState([]);
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const { addToInquiry } = useInquiry();
  const { language } = useLanguage();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);


  // Filter products by keyword in name or description
  const searchResults = products.filter(product => {
    const keyword = query.toLowerCase();
    return (
      product.name.toLowerCase().includes(keyword) || 
      (product.description && product.description.toLowerCase().includes(keyword))
    );
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(100);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(product);
    setQuantity(100);
  };

  const confirmAddToCart = () => {
    if (selectedProduct && quantity > 0) {
      addToInquiry(selectedProduct, quantity);
      const addedMsg = language === 'es' 
        ? `${selectedProduct.nameSpanish || selectedProduct.name} (Cant: ${quantity}) añadido a su lista de consultas!`
        : `${selectedProduct.name} (Qty: ${quantity}) added to your inquiry list!`;
      alert(addedMsg);
      setSelectedProduct(null);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-light)', letterSpacing: '2px' }}>{language === 'es' ? 'CARGANDO...' : 'LOADING...'}</p>
      </div>
    );
  }

  return (
    <>
    <div className="search-page container section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link href="/">{language === 'es' ? 'Inicio' : 'Home'}</Link> / <span>{language === 'es' ? 'Buscar' : 'Search'}</span>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <input 
          type="text" 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)} 
          placeholder={language === 'es' ? 'Buscar productos...' : 'Search for products...'} 
          style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid #E5DED0', fontSize: '1rem', fontFamily: 'var(--font-sans)' }}
        />
        <button type="submit" className="btn" style={{ padding: '0.8rem 1.5rem' }}>{language === 'es' ? 'Buscar' : 'Search'}</button>
      </form>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
        {language === 'es' ? `Resultados de Búsqueda para "${query}"` : `Search Results for "${query}"`}
      </h1>
      <p style={{ marginBottom: '3rem', color: 'var(--color-text-light)' }}>
        {language === 'es' 
          ? `Se encontraron ${searchResults.length} ${searchResults.length === 1 ? 'producto' : 'productos'} que coinciden con su búsqueda.`
          : `Found ${searchResults.length} ${searchResults.length === 1 ? 'product' : 'products'} matching your search.`}
      </p>

      {searchResults.length > 0 ? (
        <div className="collections-product-grid">
          {searchResults.map(product => (
            <Link href={`/product/${product.id}`} key={product.id} className="card product-card-filter">
              <div className={`card-image ${product.color}`} style={{ height: '240px', position: 'relative' }}>
                {product.image ? (
                  <img 
                    src={cld.image(product.image).resize(fill().width(300).height(300)).format('auto').quality('auto').toURL()} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>{language === 'es' ? 'Sin Imagen' : 'No Image'}</div>
                )}
              </div>
              <div className="card-content" style={{ padding: '1rem' }}>
                <h3 className="product-title">{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</h3>

                <button 
                  className="btn btn-outline add-to-cart-btn"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  {language === 'es' ? 'AÑADIR A CONSULTA' : 'ADD TO INQUIRY'}
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{language === 'es' ? 'No se encontraron productos' : 'No products found'}</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-light)' }}>
            {language === 'es' ? `No pudimos encontrar nada que coincida con "${query}". Intente revisar su ortografía o use términos más generales.` : `We couldn't find anything matching "${query}". Try checking your spelling or use more general terms.`}
          </p>
          <Link href="/collections" className="btn btn-outline">{language === 'es' ? 'Explorar Colecciones' : 'Browse Collections'}</Link>
        </div>
      )}
    </div>

      {selectedProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>{language === 'es' ? 'Añadir a Consulta' : 'Add to Inquiry'}</h3>
            <p style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{language === 'es' && selectedProduct.nameSpanish ? selectedProduct.nameSpanish : selectedProduct.name}</p>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>{language === 'es' ? 'Cantidad Esperada' : 'Expected Quantity'}</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5DED0' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setSelectedProduct(null)}>{language === 'es' ? 'Cancelar' : 'Cancel'}</button>
              <button className="btn" style={{ padding: '0.5rem 1.5rem' }} onClick={confirmAddToCart}>{language === 'es' ? 'Añadir' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Search() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
