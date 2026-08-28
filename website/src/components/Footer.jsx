'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer id="contact" className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link href="/" className="logo-container" style={{ margin: 0 }}>
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
            <li><Link href="/collections">{language === 'es' ? 'Colecciones' : 'Collections'}</Link></li>
            <li><Link href="/item-list">{language === 'es' ? 'Lista de Consultas' : 'Inquiry List'}</Link></li>
            <li><Link href="/contact">{language === 'es' ? 'Contacto' : 'Contact'}</Link></li>
            <li><Link href="/">{language === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions'}</Link></li>
            <li><Link href="/">{language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>{language === 'es' ? 'Consultas' : 'Enquiries'}</h3>
          <p className="contact-detail"><strong>Tel:</strong> +34 688 484 444</p>
          <p className="contact-detail"><strong>Email:</strong> feltgoodbcn@gmail.com</p>
          <Link href="/contact" className="btn" style={{marginTop: '1.5rem'}}>{language === 'es' ? 'Contáctenos' : 'Contact Us'}</Link>
        </div>
      </div>
    </footer>
  );
}
