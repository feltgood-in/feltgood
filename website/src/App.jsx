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
import './App.css';

function Navbar() {
  const { getTotalItems } = useInquiry();
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-content">
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
              <span className="heart">♥</span> HANDMADE WITH HEART <span className="heart">♥</span>
            </span>
          </div>
        </Link>
        {isMenuOpen && <div className="mobile-overlay hide-on-desktop" onClick={() => setIsMenuOpen(false)}></div>}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <form className="search-form" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
          <Link to="/" className="hide-on-desktop" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/collections" onClick={() => setIsMenuOpen(false)}>Collections</Link>
          <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
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
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
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
                    <span className="heart">♥</span> HANDMADE WITH HEART <span className="heart">♥</span>
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="footer-links">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/collections">Collections</Link></li>
                <li><Link to="/item-list">Inquiry List</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/">Terms & Conditions</Link></li>
                <li><Link to="/">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h3>Enquiries</h3>
              <p className="contact-detail"><strong>Tel:</strong> +34 688 484 444</p>
              <p className="contact-detail"><strong>Email:</strong> feltgoodbcn@gmail.com</p>
              <Link to="/contact" className="btn" style={{marginTop: '1.5rem'}}>Contact Us</Link>
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
