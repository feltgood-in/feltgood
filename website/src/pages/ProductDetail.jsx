import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useLanguage } from '../context/LanguageContext';

function ProductDetail() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  
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


  const product = products.find(p => p.id === id);
  const { addToInquiry, inquiryItems } = useInquiry();
  const existingItem = inquiryItems.find(item => item.id === product?.id);
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToList = () => {
    if (quantity >= 1 && quantity <= 10000) {
      addToInquiry(product, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      alert(language === 'es' ? "Por favor ingrese una cantidad entre 1 y 10000" : "Please enter a quantity between 1 and 10000");
    }
  };

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-text-light)', letterSpacing: '2px' }}>{language === 'es' ? 'CARGANDO...' : 'LOADING...'}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section text-center">
        <h2>{language === 'es' ? 'Producto no encontrado' : 'Product not found'}</h2>
        <Link to="/" className="btn" style={{marginTop: '2rem'}}>{language === 'es' ? 'Volver al Inicio' : 'Return Home'}</Link>
      </div>
    );
  }

  return (
    <div className="product-detail animate-fade-in">
      <div className="container">
        
        <div className="breadcrumb">
          <Link to="/">{language === 'es' ? 'Colecciones' : 'Collections'}</Link> / <span>{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</span>
        </div>

        <div className="product-grid">
          {/* Images Section */}
          <div className="product-images">
            <div className={`equal-image ${product.colors[0]}`}>
               <AdvancedImage 
                  cldImg={cld.image(product.images[0]).resize(fill().width(600).height(600)).format('auto').quality('auto')} 
                  plugins={[lazyload(), placeholder({mode: 'blur'})]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className={`equal-image ${product.colors[1]}`}>
               <AdvancedImage 
                  cldImg={cld.image(product.images[1]).resize(fill().width(600).height(600)).format('auto').quality('auto')} 
                  plugins={[lazyload(), placeholder({mode: 'blur'})]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
          </div>

          {/* Details & Pricing Section */}
          <div className="product-info">
            <div className="product-meta">
              <span className="badge">{language === 'es' ? 'Mayorista' : 'Wholesale'}</span>
            </div>
            <h1 className="product-title">{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</h1>
            <p className="product-subtitle">{language === 'es' && product.subtitleSpanish ? product.subtitleSpanish : product.subtitle}</p>
            
            <div className="product-description">
              <p>{language === 'es' && product.descriptionSpanish ? product.descriptionSpanish : product.description}</p>
            </div>

            <div className="product-specs">
              <h3>{language === 'es' ? 'Especificaciones' : 'Specifications'}</h3>
              <ul>
                {product.specs.map((spec, idx) => (
                  <li key={idx}>{spec}</li>
                ))}
              </ul>
            </div>

            {/* Wholesale Pricing Tier Section */}
            <div className="pricing-section">
              <h3>{language === 'es' ? 'Precios al por Mayor' : 'Wholesale Pricing'}</h3>
              <div className="pricing-tiers">
                <div className="tier">
                  <span className="tier-name">{language === 'es' ? 'Tarifa Base' : 'Base Rate'}</span>
                  <span className="tier-price">€{product.pricing.base.toFixed(2)} <span>/ {language === 'es' ? 'unidad' : 'unit'}</span></span>
                </div>
                <div className="tier highlighted">
                  <span className="tier-name">{language === 'es' ? 'Por Mayor (5,000+ unidades)' : 'Bulk (5,000+ units)'}</span>
                  <span className="tier-price">€{product.pricing.tier5k.toFixed(2)} <span>/ {language === 'es' ? 'unidad' : 'unit'}</span></span>
                </div>
                <div className="tier highlighted">
                  <span className="tier-name">{language === 'es' ? 'Por Mayor (10,000+ unidades)' : 'Bulk (10,000+ units)'}</span>
                  <span className="tier-price">€{product.pricing.tier10k.toFixed(2)} <span>/ {language === 'es' ? 'unidad' : 'unit'}</span></span>
                </div>
              </div>
            </div>

            <div className="product-actions" style={{ marginTop: '2rem' }}>
              
              {existingItem && (
                <div style={{
                  backgroundColor: 'rgba(46, 191, 104, 0.1)',
                  color: '#1e4635',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '600'
                }}>
                  <span style={{ fontSize: '1.2rem', color: '#2ebf68' }}>✓</span>
                  {language === 'es' ? `Ya tiene ${existingItem.quantity} de este artículo en su lista. ¡Puede añadir más!` : `You already have ${existingItem.quantity} of this item in your inquiry list. You can add more!`}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="qty" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>{language === 'es' ? 'Cantidad (1-10000):' : 'Quantity (1-10000):'}</label>
                <input 
                  type="number" 
                  id="qty" 
                  min="1" 
                  max="10000" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ 
                    padding: '0.8rem', 
                    borderRadius: '8px', 
                    border: '1px solid #E5DED0', 
                    width: '100%', 
                    maxWidth: '150px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1rem'
                  }} 
                />
              </div>
              <button onClick={handleAddToList} className="btn btn-full">{language === 'es' ? 'Añadir a la Lista de Consultas' : 'Add to Inquiry List'}</button>
              
              {showSuccess && (
                <div style={{ marginTop: '1rem', color: 'var(--color-secondary)', fontWeight: 600, textAlign: 'center' }}>
                  {language === 'es' ? `¡Se añadieron ${quantity} artículos a su lista!` : `Added ${quantity} items to your list!`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
