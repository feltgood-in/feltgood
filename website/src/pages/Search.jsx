import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';

function Search() {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { addToInquiry } = useInquiry();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products || []))
      .catch(err => console.error(err));
  }, []);

  // Filter products by keyword in name or description
  const searchResults = products.filter(product => {
    const keyword = query.toLowerCase();
    return (
      product.name.toLowerCase().includes(keyword) || 
      (product.description && product.description.toLowerCase().includes(keyword))
    );
  });

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToInquiry(product, 1);
    alert(`${product.name} added to your inquiry list!`);
  };

  return (
    <div className="search-page container section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link to="/">Home</Link> / <span>Search</span>
      </div>

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400 }}>
        Search Results for "{query}"
      </h1>
      <p style={{ marginBottom: '3rem', color: 'var(--color-text-light)' }}>
        Found {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'} matching your search.
      </p>

      {searchResults.length > 0 ? (
        <div className="collections-product-grid">
          {searchResults.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="card product-card-filter">
              <div className={`card-image ${product.color}`} style={{ height: '240px', position: 'relative' }}>
                <AdvancedImage 
                  cldImg={cld.image(product.image).resize(fill().width(300).height(300))} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="card-content" style={{ padding: '1rem' }}>
                <h3 className="product-title">{product.name}</h3>
                <div className="product-prices">
                  <span className="price-new">{(!product.currency || product.currency === 'INR') ? '₹' : '$'}{product.price.toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-outline add-to-cart-btn"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  ADD TO INQUIRY
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>No products found</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-light)' }}>We couldn't find anything matching "{query}". Try checking your spelling or use more general terms.</p>
          <Link to="/collections" className="btn btn-outline">Browse Collections</Link>
        </div>
      )}
    </div>
  );
}

export default Search;
