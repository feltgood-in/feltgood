import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';

function Search() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const { addToInquiry } = useInquiry();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchInput });
  };

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
      alert(`${selectedProduct.name} (Qty: ${quantity}) added to your inquiry list!`);
      setSelectedProduct(null);
    }
  };

  return (
    <>
    <div className="search-page container section animate-fade-in" style={{ paddingBottom: '6rem' }}>
      <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
        <Link to="/">Home</Link> / <span>Search</span>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <input 
          type="text" 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)} 
          placeholder="Search for products..." 
          style={{ flex: 1, padding: '0.8rem 1.2rem', borderRadius: '8px', border: '1px solid #E5DED0', fontSize: '1rem', fontFamily: 'var(--font-sans)' }}
        />
        <button type="submit" className="btn" style={{ padding: '0.8rem 1.5rem' }}>Search</button>
      </form>

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
                {product.image ? (
                  <AdvancedImage 
                    cldImg={cld.image(product.image).resize(fill().width(300).height(300)).format('auto').quality('auto')} 
                    plugins={[lazyload(), placeholder({mode: 'blur'})]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No Image</div>
                )}
              </div>
              <div className="card-content" style={{ padding: '1rem' }}>
                <h3 className="product-title">{product.name}</h3>
                <div className="product-prices">
                  {product.oldPrice > 0 && <span className="price-old">{(!product.currency || product.currency === 'INR') ? '₹' : '$'}{(product.oldPrice || 0).toFixed(2)}</span>}
                  <span className="price-new">{(!product.currency || product.currency === 'INR') ? '₹' : '$'}{(product.price || 0).toFixed(2)}</span>
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

      {selectedProduct && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', margin: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Add to Inquiry</h3>
            <p style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>{selectedProduct.name}</p>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Expected Quantity</label>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5DED0' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => setSelectedProduct(null)}>Cancel</button>
              <button className="btn" style={{ padding: '0.5rem 1.5rem' }} onClick={confirmAddToCart}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Search;
