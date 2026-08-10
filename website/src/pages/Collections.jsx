import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';

function Collections() {
  const { addToInquiry } = useInquiry();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('3');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      })
      .catch(err => console.error(err));
  }, []);

  // Filter products based on selected category
  let displayedProducts = [];
  if (selectedCategory === 'all') {
    displayedProducts = products;
  } else {
    const cat = categories.find(c => c.id === selectedCategory);
    if (cat) {
      displayedProducts = cat.products.map(p => products.find(fullP => fullP.id === p.id));
    }
  }

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Prevent navigating to product detail
    setSelectedProduct(product);
    setQuantity(100); // Default to a reasonable wholesale MOQ
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
    <div className="collections-page container section animate-fade-in">
      
      {/* Top Bar matching image */}
      <div className="collections-top-bar" style={{ padding: '0 4px' }}>
        <div className="view-toggles hide-on-mobile" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={viewMode === '2' ? "var(--color-primary)" : "#ccc"} style={{ cursor: 'pointer', transition: 'fill 0.2s' }} onClick={() => setViewMode('2')}>
            <rect x="2" y="4" width="8" height="16" rx="1"/>
            <rect x="14" y="4" width="8" height="16" rx="1"/>
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={viewMode === '3' ? "var(--color-primary)" : "#ccc"} style={{ cursor: 'pointer', transition: 'fill 0.2s' }} onClick={() => setViewMode('3')}>
            <rect x="2" y="4" width="5.3" height="16" rx="1"/>
            <rect x="9.3" y="4" width="5.3" height="16" rx="1"/>
            <rect x="16.6" y="4" width="5.3" height="16" rx="1"/>
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={viewMode === '4' ? "var(--color-primary)" : "#ccc"} style={{ cursor: 'pointer', transition: 'fill 0.2s' }} onClick={() => setViewMode('4')}>
            <rect x="1" y="4" width="4" height="16" rx="1"/>
            <rect x="7" y="4" width="4" height="16" rx="1"/>
            <rect x="13" y="4" width="4" height="16" rx="1"/>
            <rect x="19" y="4" width="4" height="16" rx="1"/>
          </svg>
        </div>
        <select className="sort-dropdown">
          <option>Price, low to high</option>
          <option>Price, high to low</option>
        </select>
        <button 
          className="hide-on-desktop" 
          onClick={() => setIsMobileFilterOpen(true)}
          style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Filters
        </button>
      </div>

      <div className="collections-layout">
        {/* Sidebar */}
        <aside className="sidebar-filters hide-on-mobile">
          <div className="filter-section">
            <h3 className="filter-title">Product categories</h3>
            <ul className="category-list">
              <li 
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                All Products <span>({products.length})</span>
              </li>
              {categories.map(cat => (
                <li 
                  key={cat.id} 
                  className={selectedCategory === cat.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.title} <span>({cat.products.length})</span>
                </li>
              ))}
            </ul>
          </div>



          <div className="filter-section">
            <h3 className="filter-title">Price</h3>
            <div className="price-slider-mock">
              <div className="slider-track">
                <div className="slider-fill"></div>
                <div className="slider-handle left"></div>
                <div className="slider-handle right"></div>
              </div>
            </div>
            <div className="price-inputs">
              <span>Price:</span>
              <input type="text" placeholder="$ 0" readOnly />
              <span>-</span>
              <input type="text" placeholder="$ 999" readOnly />
            </div>
            <button className="btn btn-outline" style={{padding: '0.4rem 1rem', marginTop: '1rem', fontSize: '0.8rem'}}>FILTER</button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className={`collections-product-grid grid-${viewMode}`}>
          {displayedProducts.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="card product-card-filter">
              <div className={`card-image ${product.color}`} style={{ aspectRatio: '1 / 1', height: 'auto', position: 'relative' }}>
                <AdvancedImage 
                  cldImg={cld.image(product.image).resize(fill().width(300).height(300))} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {product.badgeText && <div className="discount-badge">{product.badgeText}</div>}
              </div>
              <div className="card-content" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem', fontFamily: 'monospace' }}>{product.itemNumber}</div>
                <h3 className="product-title">{product.name}</h3>
                <div className="product-prices">
                  <span className="price-old">{(!product.currency || product.currency === 'INR') ? '₹' : '$'}{(product.price * 2).toFixed(2)}</span>
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
      </div>
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

      {/* Mobile Filter Drawer */}
      <div className={`mobile-filter-drawer ${isMobileFilterOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)' }}>Filters</h3>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsMobileFilterOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div>
          <div className="filter-section">
            <h3 className="filter-title">Product categories</h3>
            <ul className="category-list">
              <li 
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => { setSelectedCategory('all'); setIsMobileFilterOpen(false); }}
              >
                All Products <span>({products.length})</span>
              </li>
              {categories.map(cat => (
                <li 
                  key={cat.id} 
                  className={selectedCategory === cat.id ? 'active' : ''}
                  onClick={() => { setSelectedCategory(cat.id); setIsMobileFilterOpen(false); }}
                >
                  {cat.title} <span>({cat.products.length})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setIsMobileFilterOpen(false)}
        ></div>
      )}
    </>
  );
}

export default Collections;
