import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useInquiry } from '../context/InquiryContext';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useLanguage } from '../context/LanguageContext';

function ItemList() {
  const { inquiryItems, removeFromInquiry, getTotalItems, clearInquiry } = useInquiry();
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  return (
    <div className="item-list-page animate-fade-in section container">
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <h1 className="section-title">{language === 'es' ? 'Su Lista de Consultas' : 'Your Inquiry List'}</h1>
        <p className="section-subtitle">{language === 'es' ? 'Revise los artículos seleccionados antes de proceder a contactarnos.' : 'Review your selected items before proceeding to contact us.'}</p>
      </div>

      {inquiryItems.length === 0 ? (
        <div className="empty-state text-center" style={{ padding: '4rem', background: '#fffdfa', borderRadius: '20px', border: '1px solid #E5DED0' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'var(--color-primary)' }}>{language === 'es' ? 'Su lista está vacía actualmente' : 'Your list is currently empty'}</h3>
          <p style={{ opacity: 0.8, marginBottom: '2rem' }}>{language === 'es' ? 'Explore nuestras colecciones para añadir artículos a su consulta mayorista.' : 'Browse our collections to add items to your wholesale inquiry.'}</p>
          <Link to="/" className="btn">{language === 'es' ? 'Volver a Colecciones' : 'Return to Collections'}</Link>
        </div>
      ) : (
        <div className="inquiry-content split-layout">
          
          {/* Left Column: Added Items */}
          <div className="grid">
            {inquiryItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="card">
                <div className={`card-image ${item.color}`}>
                  <AdvancedImage 
                    cldImg={cld.image(item.image).resize(fill().width(300).height(300)).format('auto').quality('auto')} 
                    plugins={[lazyload(), placeholder({mode: 'blur'})]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="card-content">

                  <h3 style={{ fontSize: '1.25rem' }}>{language === 'es' && item.nameSpanish ? item.nameSpanish : item.name}</h3>
                  <p style={{ marginBottom: '1rem' }}>{language === 'es' && item.descriptionSpanish ? item.descriptionSpanish : (item.desc || (language === 'es' ? 'Decoración de fieltro hecha a mano diseñada para estilo estacional.' : 'Handmade felt decor designed for seasonal styling.'))}</p>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E5DED0' }}>
                    <p style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '1rem' }}>
                      {language === 'es' ? 'Cantidad:' : 'Quantity:'} {item.quantity}
                    </p>
                    <button 
                      onClick={() => removeFromInquiry(item.id)}
                      className="btn btn-outline" 
                      style={{ width: '100%', padding: '0.5rem' }}
                    >
                      {language === 'es' ? 'Eliminar' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Dummy items to force auto-fit grid to match 3-column or 4-column layout */}
            {Array.from({ length: inquiryItems.length < 3 ? 3 - inquiryItems.length : 0 }).map((_, i) => (
              <div key={`dummy-${i}`} style={{ visibility: 'hidden' }}></div>
            ))}
          </div>

          {/* Right Column: Summary Card */}
          <div className="inquiry-summary" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'sticky',
            top: '2rem',
            paddingTop: '1rem'
          }}>
            <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid #E5DED0' }}>
              <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>{language === 'es' ? '¿Listo para proceder?' : 'Ready to proceed?'}</h3>
              <p style={{ color: 'var(--color-text)', opacity: 0.8 }}>{language === 'es' ? 'Total de artículos solicitados:' : 'Total items requested:'} <strong style={{ color: 'var(--color-primary)' }}>{getTotalItems()}</strong></p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn" style={{ width: '100%' }}>
              {language === 'es' ? 'Proceder al Formulario de Consulta' : 'Proceed to Inquiry Form'}
            </button>
          </div>

        </div>
      )}

      {/* Inquiry Form Modal */}
      {isModalOpen && createPortal(
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="modal-content" style={{
            background: 'var(--color-bg)',
            padding: '3rem',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text)' }}
            >
              ✕
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '2rem' }}>{language === 'es' ? 'Formulario de Consulta' : 'Inquiry Form'}</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              
              const formData = {
                source: 'item_list',
                name: e.target.name.value,
                email: e.target.email.value,
                mobile: e.target.mobile.value,
                message: e.target.message.value,
                items: inquiryItems
              };

              try {
                const res = await fetch('/api/inquiry', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(formData)
                });
                
                if (res.ok) {
                  clearInquiry();
                  setShowSuccess(true);
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
            }}>
              {showSuccess ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ fontSize: '4rem', color: '#2ebf68', marginBottom: '1rem', lineHeight: 1 }}>✓</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem' }}>{language === 'es' ? 'Mensaje Enviado' : 'Message Sent'}</h3>
                  <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.1rem' }}>{language === 'es' ? 'Nos pondremos en contacto pronto.' : 'We\'ll be in touch soon.'}</p>
                  <button className="btn btn-full" onClick={() => { setShowSuccess(false); setIsModalOpen(false); }} type="button">{language === 'es' ? 'Cerrar' : 'Close'}</button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--color-primary)', color: 'var(--color-bg)', borderRadius: '12px' }}>
                    <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem', color: 'var(--color-bg)' }}>{language === 'es' ? 'Artículos Solicitados' : 'Requested Items'}</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {inquiryItems.map(item => (
                        <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                          <span>{language === 'es' && item.nameSpanish ? item.nameSpanish : item.name}</span>
                          <span>x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <input type="text" name="name" placeholder={language === 'es' ? 'Nombre' : 'Name'} required style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #E5DED0', width: '100%', fontFamily: 'inherit' }} />
                    <input type="email" name="email" placeholder={language === 'es' ? 'Correo Electrónico' : 'Email'} required style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #E5DED0', width: '100%', fontFamily: 'inherit' }} />
                    <input type="tel" name="mobile" placeholder={language === 'es' ? 'Número de Teléfono' : 'Phone Number'} style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #E5DED0', width: '100%', fontFamily: 'inherit' }} />
                    <textarea name="message" placeholder={language === 'es' ? 'Mensaje / Instrucciones Adicionales' : 'Message / Additional Instructions'} required style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #E5DED0', width: '100%', minHeight: '120px', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
                  </div>

                  {errorMsg && <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem', fontWeight: 600, textAlign: 'center' }}>{errorMsg}</div>}

                  <button type="submit" disabled={isSubmitting} className="btn btn-full" style={{ width: '100%' }}>
                    {isSubmitting ? (language === 'es' ? 'Enviando...' : 'Sending...') : (language === 'es' ? 'Enviar Mensaje' : 'Send Message')}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ItemList;
