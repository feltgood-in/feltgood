import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdvancedImage } from '@cloudinary/react';
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
    { id: 1, color: "bg-forest", title: "New Festive Additions" },
    { id: 2, color: "bg-crimson", title: "Classic Felt Stockings" },
    { id: 3, color: "bg-sage", title: "Botanical Wreaths" },
    { id: 4, color: "bg-sand", title: "Handmade Ornaments" }
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

  return (
    <>
      {/* Top Banner Carousel */}
      <section className="banner-carousel">
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {slides.map((slide) => (
            <div key={slide.id} className={`carousel-slide ${slide.color}`} style={{ padding: 0 }}>
               {slide.image && (
                 <AdvancedImage 
                   cldImg={cld.image(slide.image)} 
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
      <section className="brand-intro text-center section container">
        <p className="subtitle animate-fade-in delay-1" style={{color: 'var(--color-primary)'}}>HANDMADE WITH HEART</p>
        <h1 className="title animate-fade-in delay-2" style={{fontSize: '4rem', marginBottom: '1.5rem'}}>Softly made. Joyfully kept.</h1>
        <p className="hero-text animate-fade-in delay-3" style={{margin: '0 auto'}}>
          Handmade felt products designed for expressive retail collections, efficient packing, and buyer-led customisation.
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
                     cldImg={cld.image(card.image).resize(fill().width(300).height(420))} 
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
                        cldImg={cld.image(product.image).resize(fill().width(400).height(400))} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="card-content">
                      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.2rem', fontFamily: 'monospace' }}>{product.itemNumber}</div>
                      <h3 style={{ fontSize: '1.25rem' }}>{product.name}</h3>
                      <p>{product.desc || 'Handmade felt decor designed for seasonal styling.'}</p>
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
          <h2>Bespoke Christmas Collections</h2>
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
              <p className="mb-2">A flexible collection for boutiques, department stores, museum shops, festive markets, and private-label programmes.</p>
              <div className="moq-badge">
                <span>MINIMUM ORDER QUANTITY</span>
                <strong>10,000 units</strong>
              </div>
            </div>
            
            <div className="features-grid">
              <div className="feature">
                <h4>01 / 100% Handmade</h4>
                <p>Every piece is cut, shaped, stitched and finished by hand.</p>
              </div>
              <div className="feature">
                <h4>02 / Eco-Friendly</h4>
                <p>Reusable felt format and natural dyes for an authentic finish.</p>
              </div>
              <div className="feature">
                <h4>03 / Private Label Ready</h4>
                <p>Customise size, colour, design, assortment, and labelling.</p>
              </div>
              <div className="feature">
                <h4>04 / Packing Efficiency</h4>
                <p>Compresses for efficient packing and naturally recovers shape.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
