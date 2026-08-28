'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { useLanguage } from '../context/LanguageContext';
import { cld } from '../cloudinary';


function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [homepageData, setHomepageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    Promise.all([
      fetch('/api/homepage').then(res => res.json()),
      fetch('/api/products').then(res => res.json())
    ])
    .then(([homeData, prodData]) => {
      setHomepageData(homeData);
      setProducts(prodData.products || []);
      setCategories(prodData.categories || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const defaultSlides = [
    { id: 1, color: "bg-slate", title: language === 'es' ? "Nuevas Llegadas Artesanales" : "Handcrafted New Arrivals" },
    { id: 2, color: "bg-clay", title: language === 'es' ? "Cerámica Artesanal" : "Artisanal Pottery" },
    { id: 3, color: "bg-stone", title: language === 'es' ? "Textiles Tejidos a Mano" : "Handwoven Textiles" },
    { id: 4, color: "bg-sand", title: language === 'es' ? "Esenciales de Madera" : "Woodcrafted Essentials" }
  ];

  const slides = (homepageData && homepageData.banners) ? homepageData.banners : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (!slides || slides.length === 0) return 0;
        return (prev + 1) % slides.length;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const touchStart = React.useRef(null);
  const touchEnd = React.useRef(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;
  };

  const onTouchMove = (e) => touchEnd.current = e.targetTouches ? e.targetTouches[0].clientX : e.clientX;

  const onTouchEndEvent = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    touchStart.current = null;
    touchEnd.current = null;
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

      {/* Top Banner Carousel */}
      <section 
        className="banner-carousel"
        onDragStart={(e) => e.preventDefault()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEndEvent}
        onMouseDown={onTouchStart}
        onMouseMove={(e) => {
          if (touchStart.current) onTouchMove(e);
        }}
        onMouseUp={onTouchEndEvent}
        onMouseLeave={() => {
          if (touchStart.current) {
            onTouchEndEvent();
          }
        }}
      >
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide) => (
            <div key={slide.id} className={`carousel-slide ${slide.color}`} style={{ padding: 0 }}>
               {slide.image && (
                 <AdvancedImage 
                   cldImg={cld.image(slide.image).format('auto').quality('auto')} 
                   plugins={[lazyload(), placeholder({mode: 'blur'})]}
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 />
               )}
            </div>
          ))}
        </div>
        
        <div className="carousel-dots">
          {slides.map((_, idx) => (
            <button 
              key={idx} 
              className={`dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            ></button>
          ))}
        </div>
      </section>

      {/* Brand Introduction (Moved Hero) */}
      <section className="brand-intro text-center section container handicraft-texture" style={{ borderRadius: '16px', margin: '2rem auto' }}>
        <p className="subtitle animate-fade-in delay-1" style={{color: 'var(--color-primary)'}}>
          {language === 'es' ? 'HECHO A MANO CON PASIÓN' : 'HANDCRAFTED WITH PASSION'}
        </p>
        <h1 className="title animate-fade-in delay-2" style={{fontSize: '4rem', marginBottom: '1.5rem'}}>
          {language === 'es' ? 'Diseñado para la vida.' : 'Designed for life.'}
        </h1>
        <p className="hero-text animate-fade-in delay-3" style={{margin: '0 auto'}}>
          {language === 'es' 
            ? 'Productos premium hechos a mano curados para una vida moderna y colecciones expresivas.' 
            : 'Premium handmade products curated for modern living and expressive collections.'}
        </p>
      </section>

      {/* Promotional Cards Section (Hidden on Mobile) */}
      <section className="promo-cards-section hide-on-mobile" style={{ marginBottom: '6rem', width: '100%', overflow: 'hidden' }}>
        <div className="promo-cards-grid">
          {homepageData && homepageData.promoCards && homepageData.promoCards.map((card, idx) => {
            const gradients = ['bg-gradient-pink', 'bg-gradient-blue', 'bg-gradient-green', 'bg-gradient-yellow', 'bg-gradient-purple', 'bg-gradient-red'];
            return (
              <Link key={card.id} href={card.filter === 'all' ? '/collections' : `/collections?filter=${card.filter}`} className={`promo-card ${gradients[idx % gradients.length]}`} style={{ padding: 0, textDecoration: 'none', position: 'relative' }}>
                {card.image && (
                   <AdvancedImage 
                     cldImg={cld.image(card.image).resize(fill().width(300).height(420)).format('auto').quality('auto')} 
                     plugins={[lazyload(), placeholder({mode: 'blur'})]}
                     style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                   />
                 )}
                 <span className="promo-btn" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   {language === 'es' ? 'Explorar' : 'Explore'}
                 </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="section container">
        {homepageData && categories.map((category) => {
          const featuredIds = homepageData.categoryFeaturedItems?.[category.id] || [];
          if (featuredIds.length === 0) return null; // Hide category if no products selected

          const displayProducts = featuredIds
            .map(id => products.find(p => p.id === id))
            .filter(Boolean); // removes undefined if a product was deleted
            
          // Shuffle the products randomly
          const shuffledProducts = [...displayProducts].sort(() => 0.5 - Math.random());

          return (
            <div key={category.id} className="category-group" style={{ marginBottom: '6rem' }}>
              <h2 className="section-title text-center" style={{ fontSize: '2.5rem' }}>
                {language === 'es' ? (homepageData.categoryTitlesSpanish?.[category.id] || category.titleSpanish || category.title) : (homepageData.categoryTitles?.[category.id] || category.title)}
              </h2>
              <p className="section-subtitle text-center">
                {language === 'es' ? (homepageData.categorySubtitlesSpanish?.[category.id] || category.subtitleSpanish || category.subtitle) : (homepageData.categorySubtitles?.[category.id] || category.subtitle)}
              </p>
              
              <div className="grid mobile-carousel">
                {shuffledProducts.map((product) => {
                  return (
                  <Link href={`/product/${product.id}`} key={product.id} className="card">
                    <div className={`card-image ${product.color || 'bg-sand'}`}>
                      <AdvancedImage 
                        cldImg={cld.image(product.image).resize(fill().width(400).height(400)).format('auto').quality('auto')} 
                        plugins={[lazyload(), placeholder({mode: 'blur'})]}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-content">
                      <h3 style={{ fontSize: '1.25rem' }}>{language === 'es' && product.nameSpanish ? product.nameSpanish : product.name}</h3>
                      <p>{language === 'es' && product.descriptionSpanish ? product.descriptionSpanish : (product.desc || 'Premium handmade decor designed for elegant styling.')}</p>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Promotional Banner */}
      <section className="promo-banner">
        <div className="container promo-content">
          <h2>{language === 'es' ? 'Colecciones Artesanales a Medida' : 'Bespoke Artisanal Collections'}</h2>
          <p>{language === 'es' ? '¿Busca algo único? Descubra nuestras opciones de desarrollo personalizado para programas de marca privada.' : 'Looking for something unique? Discover our custom development options for private-label programmes.'}</p>
          <Link href="/contact" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
            {language === 'es' ? 'Aprender Más' : 'Learn More'}
          </Link>
        </div>
      </section>

      {/* Wholesale & Services */}
      <section id="wholesale" className="section bg-primary">
        <div className="container">
          <div className="wholesale-grid">
            <div className="wholesale-info">
              <h2>{language === 'es' ? 'Hecho para el Comercio Minorista Cuidadoso' : 'Made for Thoughtful Retail'}</h2>
              <p className="mb-2">{language === 'es' ? 'Una colección flexible para boutiques, galerías, mercados artesanales y programas de marca privada.' : 'A flexible collection for boutiques, galleries, artisan markets, and private-label programmes.'}</p>
              <div className="moq-badge">
                <span>{language === 'es' ? 'CANTIDAD MÍNIMA DE PEDIDO' : 'MINIMUM ORDER QUANTITY'}</span>
                <strong>{language === 'es' ? '1.000 unidades' : '1,000 units'}</strong>
              </div>
            </div>
            
            <div className="features-grid">
              <div className="feature">
                <h4>01 / {language === 'es' ? '100% Hecho a Mano' : '100% Handmade'}</h4>
                <p>{language === 'es' ? 'Cada pieza es cortada, formada, cosida y terminada a mano.' : 'Every piece is cut, shaped, stitched and finished by hand.'}</p>
              </div>
              <div className="feature">
                <h4>02 / {language === 'es' ? 'Ecológico' : 'Eco-Friendly'}</h4>
                <p>{language === 'es' ? 'Materiales naturales y tintes auténticos para un acabado auténtico.' : 'Natural materials and authentic dyes for an authentic finish.'}</p>
              </div>
              <div className="feature">
                <h4>03 / {language === 'es' ? 'Listo para Marca Privada' : 'Private Label Ready'}</h4>
                <p>{language === 'es' ? 'Personalice el tamaño, color, diseño, surtido y etiquetado.' : 'Customise size, colour, design, assortment, and labelling.'}</p>
              </div>
              <div className="feature">
                <h4>04 / {language === 'es' ? 'Entrega Eficiente' : 'Efficient Delivery'}</h4>
                <p>{language === 'es' ? 'Cuidadosamente embalado para un envío eficiente y manipulación segura.' : 'Carefully packed for efficient shipping and safe handling.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
