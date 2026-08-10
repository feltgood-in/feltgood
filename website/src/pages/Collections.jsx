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

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToInquiry(product, 1);
    alert(`${product.name} added to your inquiry list!`);
  };

  return (
    <div className="collections-page container section animate-fade-in">
      
      {/* Top Bar matching image */}
      <div className="collections-top-bar">
        <div></div>
        <div className="view-toggles hide-on-mobile">
          <span style={{opacity: 0.5, cursor: 'pointer'}}>☷</span>
          <span style={{opacity: 0.5, cursor: 'pointer', margin: '0 10px'}}>⋮⋮</span>
          <span style={{color: 'var(--color-primary)', cursor: 'pointer'}}>⠿</span>
        </div>
        <select className="sort-dropdown">
          <option>Date, new to old</option>
          <option>Price, low to high</option>
          <option>Price, high to low</option>
        </select>
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
        <div className="collections-product-grid">
          {displayedProducts.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="card product-card-filter">
              <div className={`card-image ${product.color}`} style={{ height: '240px', position: 'relative' }}>
                <AdvancedImage 
                  cldImg={cld.image(product.image).resize(fill().width(300).height(300))} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="discount-badge">-50%</div>
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
  );
}

export default Collections;
