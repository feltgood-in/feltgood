import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import ItemList from './pages/ItemList';
import Collections from './pages/Collections';
import Search from './pages/Search';
import Admin from './pages/Admin';
import { useInquiry } from './context/InquiryContext';
import { useLanguage } from './context/LanguageContext';
import './App.css';

function Navbar() {
  const { getTotalItems } = useInquiry();
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = React.useState(false);
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };


  return (
    <nav className="navbar">
      <div className="nav-content">
        <button className="mobile-menu-btn hide-on-desktop" onClick={() => setIsMenuOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <Link to="/" className="logo-container">
          <img src="/feltgood.svg" alt="Felt Good Logo" className="logo-icon" />
          <div className="brand-text-wrapper">
            <span className="brand-name">FELT GOOD</span>
            <span className="brand-tagline">
              <span className="heart">♥</span> {language === 'es' ? 'HECHO A MANO CON CORAZÓN' : 'HANDMADE WITH HEART'} <span className="heart">♥</span>
            </span>
          </div>
        </Link>
        <div className="nav-tabs hide-on-mobile">
          {categories.slice(0, 5).map(cat => (
            <Link key={cat.id} to={`/collections?category=${cat.id}`} className={currentCategory === cat.id ? 'active' : ''}>
              {language === 'es' && cat.titleSpanish ? cat.titleSpanish : cat.title}
            </Link>
          ))}
          {categories.length > 5 && (
            <div 
              className="nav-dropdown-container" 
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <span className={`nav-dropdown-trigger ${categories.slice(5).some(cat => cat.id === currentCategory) ? 'active' : ''}`} style={{ cursor: 'pointer', padding: '0.5rem', fontWeight: 500 }}>
                {language === 'es' ? 'Colecciones ▾' : 'Collections ▾'}
              </span>
              {isDropdownOpen && (
                <div className="nav-dropdown-menu">
                  {categories.slice(5).map(cat => (
                    <Link key={cat.id} to={`/collections?category=${cat.id}`} onClick={() => setTimeout(() => setIsDropdownOpen(false), 0)} className={currentCategory === cat.id ? 'active' : ''}>
                      {language === 'es' && cat.titleSpanish ? cat.titleSpanish : cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          <Link to="/contact">{language === 'es' ? 'Contacto' : 'Contact'}</Link>
        </div>
        {isMenuOpen && <div className="mobile-overlay hide-on-desktop" onClick={() => setIsMenuOpen(false)}></div>}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-icon-group" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/search" className="nav-icon-link search-icon-only" style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }} onClick={() => setIsMenuOpen(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </Link>
            <div 
              className="nav-icon-link nav-dropdown-container" 
              style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary)', cursor: 'pointer' }}
              onMouseEnter={() => setIsLangDropdownOpen(true)}
              onMouseLeave={() => setIsLangDropdownOpen(false)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8l6 6"></path>
                <path d="M4 14l6-6 2-3"></path>
                <path d="M2 5h12"></path>
                <path d="M7 2h1"></path>
                <path d="M22 22l-5-10-5 10"></path>
                <path d="M14 18h6"></path>
              </svg>
              {isLangDropdownOpen && (
                <div className="nav-dropdown-menu" style={{ right: '-10px', left: 'auto', minWidth: '120px' }}>
                  <a 
                    onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }} 
                    className={language === 'en' ? 'active' : ''} 
                    style={{ cursor: 'pointer' }}
                  >
                    English
                  </a>
                  <a 
                    onClick={() => { setLanguage('es'); setIsLangDropdownOpen(false); }} 
                    className={language === 'es' ? 'active' : ''} 
                    style={{ cursor: 'pointer' }}
                  >
                    Spanish
                  </a>
                </div>
              )}
            </div>
          </div>
          <Link to="/" className="hide-on-desktop" onClick={() => setIsMenuOpen(false)}>
            {language === 'es' ? 'Inicio' : 'Home'}
          </Link>
          
          <div className="mobile-collections hide-on-desktop">
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} to={`/collections?category=${cat.id}`} onClick={() => setIsMenuOpen(false)} className={currentCategory === cat.id ? 'active' : ''}>
                {language === 'es' && cat.titleSpanish ? cat.titleSpanish : cat.title}
              </Link>
            ))}
            {categories.length > 5 && (
              <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                <div style={{ padding: '0.5rem 0', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {language === 'es' ? 'Más Colecciones' : 'More Collections'}
                </div>
                {categories.slice(5).map(cat => (
                  <Link key={cat.id} to={`/collections?category=${cat.id}`} onClick={() => setIsMenuOpen(false)} className={currentCategory === cat.id ? 'active' : ''}>
                    {language === 'es' && cat.titleSpanish ? cat.titleSpanish : cat.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link to="/contact" className="hide-on-desktop" onClick={() => setIsMenuOpen(false)}>
            {language === 'es' ? 'Contacto' : 'Contact'}
          </Link>
          <Link to="/item-list" className="nav-icon-link" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--color-primary)' }} onClick={() => setIsMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="hide-on-desktop" style={{ marginLeft: '8px' }}>Inquiry List</span>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                left: '12px',
                background: 'var(--color-secondary)',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 'bold'
              }}>
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const { language } = useLanguage();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      <ScrollToTop />
      {/* Shared Navigation */}
      {!isAdmin && <Navbar />}

        {/* Page Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/item-list" element={<ItemList />} />
        </Routes>

        {/* Shared Footer / Contact */}
        {!isAdmin && (
          <footer id="contact" className="footer">
          <div className="container footer-content">
            <div className="footer-brand">
              <Link to="/" className="logo-container" style={{ margin: 0 }}>
                <img src="/feltgood.svg" alt="Felt Good Logo" className="logo-icon" style={{ width: '85px' }} />
                <div className="brand-text-wrapper">
                  <span className="brand-name">FELT GOOD</span>
                  <span className="brand-tagline">
                    <span className="heart">♥</span> {language === 'es' ? 'HECHO A MANO CON CORAZÓN' : 'HANDMADE WITH HEART'} <span className="heart">♥</span>
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="footer-links">
              <h3>{language === 'es' ? 'Enlaces Rápidos' : 'Quick Links'}</h3>
              <ul>
                <li><Link to="/collections">{language === 'es' ? 'Colecciones' : 'Collections'}</Link></li>
                <li><Link to="/item-list">{language === 'es' ? 'Lista de Consultas' : 'Inquiry List'}</Link></li>
                <li><Link to="/contact">{language === 'es' ? 'Contacto' : 'Contact'}</Link></li>
                <li><Link to="/">{language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}</Link></li>
                <li><Link to="/">{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</Link></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h3>{language === 'es' ? 'Consultas' : 'Enquiries'}</h3>
              <p className="contact-detail"><strong>Tel:</strong> +34 688 484 444</p>
              <p className="contact-detail"><strong>Email:</strong> feltgoodbcn@gmail.com</p>
              <Link to="/contact" className="btn" style={{marginTop: '1.5rem'}}>{language === 'es' ? 'Contáctenos' : 'Contact Us'}</Link>
            </div>
          </div>
          </footer>
        )}
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
