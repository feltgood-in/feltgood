import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [homepageData, setHomepageData] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/homepage')
      .then(res => res.json())
      .then(data => setHomepageData(data))
      .catch(err => console.error(err));

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setCategories(data.categories || []);
      })
      .catch(err => console.error(err));
  }, []);

  const defaultSlides = [
    { id: 1, color: "bg-slate", title: "Handcrafted New Arrivals" },
    { id: 2, color: "bg-clay", title: "Artisanal Pottery" },
    { id: 3, color: "bg-stone", title: "Handwoven Textiles" },
    { id: 4, color: "bg-sand", title: "Woodcrafted Essentials" }
  ];

  const slides = homepageData ? homepageData.banners : defaultSlides;

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

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);

  const onTouchEndEvent = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

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
          if (touchStart) onTouchMove(e);
        }}
        onMouseUp={onTouchEndEvent}
        onMouseLeave={() => {
          if (touchStart) {
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
        <p className="subtitle animate-fade-in delay-1" style={{color: 'var(--color-primary)'}}>HANDCRAFTED WITH PASSION</p>
        <h1 className="title animate-fade-in delay-2" style={{fontSize: '4rem', marginBottom: '1.5rem'}}>Designed for life.</h1>
        <p className="hero-text animate-fade-in delay-3" style={{margin: '0 auto'}}>
          Premium handmade products curated for modern living and expressive collections.
        </p>
      </section>

      {/* Promotional Cards Section (Hidden on Mobile) */}
      <section className="promo-cards-section hide-on-mobile" style={{ marginBottom: '6rem', width: '100%', overflow: 'hidden' }}>
        <div className="promo-cards-grid">
          {homepageData && homepageData.promoCards && homepageData.promoCards.map((card, idx) => {
            const gradients = ['bg-gradient-pink', 'bg-gradient-blue', 'bg-gradient-green', 'bg-gradient-yellow', 'bg-gradient-purple', 'bg-gradient-red'];
            return (
              <Link key={card.id} to={card.filter === 'all' ? '/collections' : `/collections?filter=${card.filter}`} className={`promo-card ${gradients[idx % gradients.length]}`} style={{ padding: 0, textDecoration: 'none', position: 'relative' }}>
                {card.image && (
                   <AdvancedImage 
                     cldImg={cld.image(card.image).resize(fill().width(300).height(420)).format('auto').quality('auto')} 
                     plugins={[lazyload(), placeholder({mode: 'blur'})]}
                     style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                   />
                 )}
                 <span className="promo-btn" style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   Explore
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
              <h2 className="section-title text-center" style={{ fontSize: '2.5rem' }}>{homepageData.categoryTitles?.[category.id] || category.title}</h2>
              <p className="section-subtitle text-center">{category.subtitle}</p>
              
              <div className="grid">
                {shuffledProducts.map((product) => {
                  return (
                  <Link to={`/product/${product.id}`} key={product.id} className="card">
                    <div className={`card-image ${product.color || 'bg-sand'}`}>
                      <AdvancedImage 
                        cldImg={cld.image(product.image).resize(fill().width(400).height(400)).format('auto').quality('auto')} 
                        plugins={[lazyload(), placeholder({mode: 'blur'})]}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-content">
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem', fontFamily: 'monospace' }}>{product.itemNumber}</div>
                      <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
                      <p>{product.desc || 'Premium handmade decor designed for elegant styling.'}</p>
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
          <h2>Bespoke Artisanal Collections</h2>
          <p>Looking for something unique? Discover our custom development options for private-label programmes.</p>
          <Link to="/contact" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Learn More</Link>
        </div>
      </section>

      {/* Wholesale & Services */}
      <section id="wholesale" className="section bg-primary">
        <div className="container">
          <div className="wholesale-grid">
            <div className="wholesale-info">
              <h2>Made for Thoughtful Retail</h2>
              <p className="mb-2">A flexible collection for boutiques, galleries, artisan markets, and private-label programmes.</p>
              <div className="moq-badge">
                <span>MINIMUM ORDER QUANTITY</span>
                <strong>1,000 units</strong>
              </div>
            </div>
            
            <div className="features-grid">
              <div className="feature">
                <h4>01 / 100% Handmade</h4>
                <p>Every piece is cut, shaped, stitched and finished by hand.</p>
              </div>
              <div className="feature">
                <h4>02 / Eco-Friendly</h4>
                <p>Natural materials and authentic dyes for an authentic finish.</p>
              </div>
              <div className="feature">
                <h4>03 / Private Label Ready</h4>
                <p>Customise size, colour, design, assortment, and labelling.</p>
              </div>
              <div className="feature">
                <h4>04 / Efficient Delivery</h4>
                <p>Carefully packed for efficient shipping and safe handling.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
