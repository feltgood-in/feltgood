'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInquiry } from '../../../context/InquiryContext';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../../../cloudinary';
import { useLanguage } from '../../../context/LanguageContext';


function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
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
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500 tracking-widest">{language === 'es' ? 'CARGANDO...' : 'LOADING...'}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{language === 'es' ? 'Producto no encontrado' : 'Product not found'}</h2>
        <Link href="/" className="inline-block mt-8 px-6 py-3 bg-[#1e4635] text-white rounded-md hover:bg-[#163527] transition-colors">
          {language === 'es' ? 'Volver al Inicio' : 'Return Home'}
        </Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ minHeight: '70vh' }}>

      <div className="container">
        
        <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px' }}>
          <button 
            onClick={() => router.back()} 
            style={{ color: 'var(--color-primary)', textDecoration: 'none', background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {language === 'es' ? 'Volver' : 'Back'}
          </button> 
          <span style={{ margin: '0 0.5rem' }}>/</span> 
          <span>{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          {/* Images Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '450px', margin: '0 auto', width: '100%' }}>
            <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
               <AdvancedImage 
                  cldImg={cld.image(product.images[0]).resize(fill().width(600).height(600)).format('auto').quality('auto')} 
                  plugins={[lazyload(), placeholder({mode: 'blur'})]}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  className="img-zoom-hover"
                />
            </div>
            {product.images[1] && (
              <div style={{ borderRadius: '8px', overflow: 'hidden', background: '#f5f5f5' }}>
                 <AdvancedImage 
                    cldImg={cld.image(product.images[1]).resize(fill().width(600).height(600)).format('auto').quality('auto')} 
                    plugins={[lazyload(), placeholder({mode: 'blur'})]}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    className="img-zoom-hover"
                  />
              </div>
            )}
          </div>

          {/* Details & Pricing Section */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ display: 'inline-block', padding: '0.2rem 0.8rem', background: 'var(--color-primary)', color: 'white', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '20px' }}>
                {language === 'es' ? 'Mayorista' : 'Wholesale'}
              </span>
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)', fontSize: '2.5rem', margin: '0 0 0.5rem 0', lineHeight: 1.2 }}>
              {language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#666', margin: '0 0 1.5rem 0' }}>
              {language === 'es' && product.subtitleSpanish ? product.subtitleSpanish : product.subtitle}
            </p>
            
            <div style={{ fontSize: '1rem', color: '#444', lineHeight: 1.6, marginBottom: '2rem' }}>
              <p>{language === 'es' && product.descriptionSpanish ? product.descriptionSpanish : product.description}</p>
            </div>

            <div style={{ background: '#faf9f6', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid #ddd', color: 'var(--color-primary)', fontSize: '1.2rem' }}>
                {language === 'es' ? 'Especificaciones' : 'Specifications'}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(language === 'es' && product.specsSpanish?.length > 0 ? product.specsSpanish : (product.specs || [])).map((spec, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.9rem', color: '#555' }}>
                    <span style={{ color: 'var(--color-primary)', marginRight: '0.5rem', fontWeight: 'bold' }}>•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
              {existingItem && (
                <div style={{ background: '#eaf4e5', color: '#2a5a22', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  ✓ {language === 'es' ? `Ya tiene ${existingItem.quantity} de este artículo en su lista. ¡Puede añadir más!` : `You already have ${existingItem.quantity} of this item in your inquiry list. You can add more!`}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="qty" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {language === 'es' ? 'Cantidad (1-10000):' : 'Quantity (1-10000):'}
                </label>
                <input 
                  type="number" 
                  id="qty" 
                  min="1" 
                  max="10000" 
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ width: '120px', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', outline: 'none' }}
                />
              </div>
              
              <button 
                onClick={handleAddToList} 
                className="btn btn-primary"
                style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              >
                {language === 'es' ? 'Añadir a la Lista de Consultas' : 'Add to Inquiry List'}
              </button>
              
              {showSuccess && (
                <div style={{ marginTop: '1rem', color: 'var(--color-secondary)', fontWeight: 'bold', textAlign: 'center' }}>
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
