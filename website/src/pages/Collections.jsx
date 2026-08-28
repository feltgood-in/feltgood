import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useLanguage } from '../context/LanguageContext';

function Collections() {
  const { addToInquiry } = useInquiry();
  const { language } = useLanguage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get('category') || 'all';
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('4');
  const [sortOrder, setSortOrder] = useState('low-to-high');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState('all');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveSubcategory('all');
  }, [selectedCategory]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);


  // Filter products based on selected category
  let displayedProducts = [];
  let currentCategoryObj = null;
  if (selectedCategory === 'all') {
    displayedProducts = [...products];
  } else {
    currentCategoryObj = categories.find(c => c.id === selectedCategory);
    if (currentCategoryObj) {
      displayedProducts = products.filter(p => p.categoryId === selectedCategory);
    }
  }
  const hasSubcategories = currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0;

  // Apply price filter
  if (minPrice !== '') {
    displayedProducts = displayedProducts.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice !== '') {
    displayedProducts = displayedProducts.filter(p => p.price <= Number(maxPrice));
  }

  // Sort products
  displayedProducts.sort((a, b) => {
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    if (sortOrder === 'low-to-high') return priceA - priceB;
    if (sortOrder === 'high-to-low') return priceB - priceA;
    return 0;
  });

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
    <div className="collections-page container section animate-fade-in">
      
      {/* Top Bar matching image */}
      <div className="collections-top-bar" style={{ padding: '0 4px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
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
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div className="price-inputs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{language === 'es' ? 'Precio:' : 'Price:'}</span>
            <input type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" style={{ width: '60px', padding: '0.4rem', border: '1px solid #E5DED0', borderRadius: '6px' }} />
            <span>-</span>
            <input type="number" placeholder="999" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" style={{ width: '60px', padding: '0.4rem', border: '1px solid #E5DED0', borderRadius: '6px' }} />
          </div>
          <select className="sort-dropdown" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ padding: '0.5rem 2rem 0.5rem 1rem', border: '1px solid #E5DED0', borderRadius: '6px', background: 'white', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '1em' }}>
            <option value="low-to-high">{language === 'es' ? 'Precio, menor a mayor' : 'Price, low to high'}</option>
            <option value="high-to-low">{language === 'es' ? 'Precio, mayor a menor' : 'Price, high to low'}</option>
          </select>
        </div>
      </div>

      {hasSubcategories && (
        <div className="subcategories-nav" style={{ overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: '2rem', paddingBottom: '0.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveSubcategory('all')}
            style={{ border: 'none', cursor: 'pointer', color: activeSubcategory === 'all' ? 'white' : '#333', fontWeight: 'bold', padding: '0.5rem 1rem', background: activeSubcategory === 'all' ? 'var(--color-primary)' : '#f5f5f5', borderRadius: '20px', fontSize: '0.9rem', transition: '0.2s' }}
          >
            {language === 'es' ? 'Todos' : 'All'}
          </button>
          {currentCategoryObj.subcategories.map(subcat => (
            <button 
              key={subcat.id} 
              onClick={() => setActiveSubcategory(subcat.id)} 
              style={{ border: 'none', cursor: 'pointer', color: activeSubcategory === subcat.id ? 'white' : '#333', fontWeight: 'bold', padding: '0.5rem 1rem', background: activeSubcategory === subcat.id ? 'var(--color-primary)' : '#f5f5f5', borderRadius: '20px', fontSize: '0.9rem', transition: '0.2s' }}
            >
              {language === 'es' && subcat.nameSpanish ? subcat.nameSpanish : subcat.name}
            </button>
          ))}
        </div>
      )}

      <div className="collections-layout" style={{ display: 'block' }}>

        {/* Product Grid */}
        {hasSubcategories ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {currentCategoryObj.subcategories
              .filter(subcat => activeSubcategory === 'all' || activeSubcategory === subcat.id)
              .map(subcat => {
              const subcatProducts = displayedProducts.filter(p => p.subcategory === subcat.id);
              if (subcatProducts.length === 0) return null;
              
              return (
                <div key={subcat.id} id={`subcat-${subcat.id}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #E5DED0', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, color: 'var(--color-primary)' }}>
                      {language === 'es' && subcat.nameSpanish ? subcat.nameSpanish : subcat.name}
                    </h2>
                    {activeSubcategory === 'all' && (
                      <button 
                        onClick={() => setActiveSubcategory(subcat.id)}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                      >
                        {language === 'es' ? 'ver todas las artesanías' : 'see all handicrafts'}
                      </button>
                    )}
                  </div>
                  <div 
                    className={activeSubcategory === 'all' ? 'horizontal-scroll-container' : `collections-product-grid grid-${viewMode}`}
                    style={activeSubcategory === 'all' ? { display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '1rem', scrollbarWidth: 'thin' } : {}}
                  >
                    {subcatProducts.map(product => (
                      <Link 
                        to={`/product/${product.id}`} 
                        key={product.id} 
                        className="card product-card-filter"
                        style={activeSubcategory === 'all' ? { width: '280px', flex: '0 0 280px' } : {}}
                      >
                        <div className={`card-image ${product.color}`} style={{ aspectRatio: '1 / 1', height: 'auto', position: 'relative' }}>
                          {product.image ? (
                            <AdvancedImage 
                              cldImg={cld.image(product.image).resize(fill().width(300).height(300)).format('auto').quality('auto')} 
                              plugins={[lazyload(), placeholder({mode: 'blur'})]}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>{language === 'es' ? 'Sin Imagen' : 'No Image'}</div>
                          )}
                          {(language === 'es' && product.badgeTextSpanish ? product.badgeTextSpanish : product.badgeText) && (
                            <div className="discount-badge">
                              {language === 'es' && product.badgeTextSpanish ? product.badgeTextSpanish : product.badgeText}
                            </div>
                          )}
                        </div>
                        <div className="card-content" style={{ padding: '1rem' }}>

                          <h3 className="product-title">{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</h3>
                          <div className="product-prices">
                            {product.oldPrice > 0 && <span className="price-old">€{(product.oldPrice || 0).toFixed(2)}</span>}
                            <span className="price-new">€{(product.price || 0).toFixed(2)}</span>
                          </div>
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
                </div>
              );
            })}
            
            {(() => {
              const uncatProducts = displayedProducts.filter(p => !p.subcategory);
              if (uncatProducts.length > 0) {
                return (
                  <div id="subcat-uncategorized">
                    <h2 style={{ marginBottom: '1.5rem', color: '#666', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Other Items</h2>
                    <div className={`collections-product-grid grid-${viewMode}`}>
                      {uncatProducts.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} className="card product-card-filter">
                          <div className={`card-image ${product.color}`} style={{ aspectRatio: '1 / 1', height: 'auto', position: 'relative' }}>
                            {product.image ? (
                              <AdvancedImage 
                                cldImg={cld.image(product.image).resize(fill().width(300).height(300)).format('auto').quality('auto')} 
                                plugins={[lazyload(), placeholder({mode: 'blur'})]}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>{language === 'es' ? 'Sin Imagen' : 'No Image'}</div>
                            )}
                            {(language === 'es' && product.badgeTextSpanish ? product.badgeTextSpanish : product.badgeText) && (
                              <div className="discount-badge">
                                {language === 'es' && product.badgeTextSpanish ? product.badgeTextSpanish : product.badgeText}
                              </div>
                            )}
                          </div>
                          <div className="card-content" style={{ padding: '1rem' }}>

                            <h3 className="product-title">{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</h3>
                            <div className="product-prices">
                              {product.oldPrice > 0 && <span className="price-old">€{(product.oldPrice || 0).toFixed(2)}</span>}
                              <span className="price-new">€{(product.price || 0).toFixed(2)}</span>
                            </div>
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
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <div className={`collections-product-grid grid-${viewMode}`}>
            {displayedProducts.map(product => (
              <Link to={`/product/${product.id}`} key={product.id} className="card product-card-filter">
                <div className={`card-image ${product.color}`} style={{ aspectRatio: '1 / 1', height: 'auto', position: 'relative' }}>
                  {product.image ? (
                    <AdvancedImage 
                      cldImg={cld.image(product.image).resize(fill().width(300).height(300)).format('auto').quality('auto')} 
                      plugins={[lazyload(), placeholder({mode: 'blur'})]}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>{language === 'es' ? 'Sin Imagen' : 'No Image'}</div>
                  )}
                  {(language === 'es' && product.badgeTextSpanish ? product.badgeTextSpanish : product.badgeText) && (
                    <div className="discount-badge">
                      {language === 'es' && product.badgeTextSpanish ? product.badgeTextSpanish : product.badgeText}
                    </div>
                  )}
                </div>
                <div className="card-content" style={{ padding: '1rem' }}>

                  <h3 className="product-title">{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</h3>
                  <div className="product-prices">
                    {product.oldPrice > 0 && <span className="price-old">€{(product.oldPrice || 0).toFixed(2)}</span>}
                    <span className="price-new">€{(product.price || 0).toFixed(2)}</span>
                  </div>
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
        )}
      </div>
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

export default Collections;
