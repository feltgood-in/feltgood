import React, { useState } from 'react';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';

function Contact() {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = {
      source: 'contact',
      name: e.target.name.value,
      email: e.target.email.value,
      mobile: e.target.mobile.value,
      quantity: e.target.quantity.value,
      message: e.target.message.value
    };

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setShowSuccess(true);
        e.target.reset();
        setErrorMsg('');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMsg(errorData.message || "Failed to send inquiry. Please try again later.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title={language === 'es' ? 'Contacto' : 'Contact'} 
        description={language === 'es' ? 'Póngase en contacto con nosotros para consultas al por mayor' : 'Contact us for wholesale inquiries'} 
        url="/contact"
      />
      <div className="inquire-page animate-fade-in">
        <div className="container" style={{ maxWidth: '1000px', padding: '4rem 1rem' }}>
        
        <div className="inquire-wrapper">
          {/* Left Decorative Side */}
          <div className="inquire-sidebar">
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {language === 'es' ? 'Creemos Juntos' : 'Let\'s Create Together'}
            </h1>
            <p className="contact-intro-text" style={{ marginBottom: '3rem', opacity: 0.9 }}>
              {language === 'es' 
                ? 'Asóciese con Felt Good para una decoración de temporada hecha a mano y de primera calidad. Ofrecemos soluciones personalizadas al por mayor y de marca privada.'
                : 'Partner with Felt Good for premium, handmade seasonal decor. We offer tailored wholesale and private-label solutions.'
              }
            </p>
            <div className="hide-on-mobile" style={{ aspectRatio: '1/1', width: '100%', maxWidth: '300px', margin: '0 auto', display: 'flex' }}>
              <AdvancedImage 
                cldImg={cld.image('cld-sample-3').resize(fill().width(400).height(400)).format('auto').quality('auto')} 
                plugins={[lazyload(), placeholder({mode: 'blur'})]}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--color-bg)' }}
              />
            </div>
            <div className="contact-info-container" style={{ marginTop: 'auto', paddingTop: '3rem' }}>
              <p><strong>Tel:</strong> +34 688 484 444</p>
              <p><strong>Email:</strong> feltgoodbcn@gmail.com</p>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="inquire-card">
            {showSuccess ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ fontSize: '4rem', color: '#2ebf68', marginBottom: '1rem', lineHeight: 1 }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem' }}>
                  {language === 'es' ? 'Mensaje Enviado' : 'Message Sent'}
                </h3>
                <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.1rem' }}>
                  {language === 'es' ? 'Gracias por su consulta de venta al por mayor. Nuestro equipo se pondrá en contacto con usted en breve.' : 'Thank you for your wholesale inquiry. Our team will get back to you shortly.'}
                </p>
                <button className="btn" onClick={() => setShowSuccess(false)}>
                  {language === 'es' ? 'Enviar Otra Consulta' : 'Send Another Inquiry'}
                </button>
              </div>
            ) : (
              <form className="inquire-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">{language === 'es' ? 'Nombre Completo *' : 'Full Name *'}</label>
                    <input type="text" id="name" required placeholder="Jane Doe" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">{language === 'es' ? 'Dirección de Correo Electrónico *' : 'Email Address *'}</label>
                    <input type="email" id="email" required placeholder="jane@retailco.com" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mobile">{language === 'es' ? 'Número de Móvil' : 'Mobile Number'}</label>
                    <input type="tel" id="mobile" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="quantity">{language === 'es' ? 'Cantidad Esperada *' : 'Expected Quantity *'}</label>
                    <select id="quantity" required defaultValue="">
                      <option value="" disabled>{language === 'es' ? 'Seleccionar volumen' : 'Select volume'}</option>
                      <option value="5000">{language === 'es' ? '5.000 unidades (A granel)' : '5,000 units (Bulk)'}</option>
                      <option value="10000">{language === 'es' ? 'Más de 10.000 unidades (MOQ)' : '10,000+ units (MOQ)'}</option>
                      <option value="custom">{language === 'es' ? 'Volumen Personalizado' : 'Custom Volume'}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{language === 'es' ? 'Consulta o Mensaje *' : 'Query or Message *'}</label>
                  <textarea 
                    id="message" 
                    required 
                    rows="5" 
                    placeholder={language === 'es' ? 'Cuéntenos sobre sus necesidades minoristas, productos solicitados o cualquier servicio de personalización requerido...' : 'Tell us about your retail needs, requested products, or any customisation services required...'}
                  ></textarea>
                </div>

                {errorMsg && <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem', fontWeight: 600, textAlign: 'center' }}>{errorMsg}</div>}

                <button type="submit" disabled={isSubmitting} className="btn btn-full" style={{ marginTop: '1rem', padding: '1rem' }}>
                  {isSubmitting ? (language === 'es' ? 'Enviando...' : 'Sending...') : (language === 'es' ? 'Enviar Consulta' : 'Send Inquiry')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Contact;
