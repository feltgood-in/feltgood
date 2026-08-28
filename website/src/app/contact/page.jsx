'use client';
import React, { useState } from 'react';
import { AdvancedImage, lazyload, placeholder } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../../cloudinary';
import { useLanguage } from '../../context/LanguageContext';

export default function Contact() {
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
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 animate-fade-in" style={{ backgroundColor: '#f0eded' }}>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[20px] shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          
          {/* Left Side: Info & Image */}
          <div className="text-white p-10 md:p-12 flex flex-col justify-between w-full md:w-[42%]" style={{ backgroundColor: '#312d2a' }}>
            <div>
              <h1 className="text-4xl sm:text-[2.75rem] font-serif font-bold mb-6 text-white leading-tight">
                {language === 'es' ? 'Creemos Juntos' : 'Let\'s Create'}
                <br />
                {language === 'es' ? '' : 'Together'}
              </h1>
              <p className="text-base opacity-90 leading-relaxed mb-10 text-white font-sans">
                {language === 'es' 
                  ? 'Asóciese con Felt Good para una decoración de temporada hecha a mano y de primera calidad. Ofrecemos soluciones personalizadas al por mayor y de marca privada.'
                  : 'Partner with Felt Good for premium, handmade seasonal decor. We offer tailored wholesale and private-label solutions.'
                }
              </p>
            </div>
            
            <div className="flex justify-center my-8">
              <div className="w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden relative" style={{ border: '2px solid #fffdfa' }}>
                <AdvancedImage 
                  cldImg={cld.image('cld-sample-3').resize(fill().width(400).height(400)).format('auto').quality('auto')} 
                  plugins={[lazyload(), placeholder({mode: 'blur'})]}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-8">
              <p className="text-sm md:text-base mb-1 font-sans"><strong className="font-bold">Tel:</strong> +34 688 484 444</p>
              <p className="text-sm md:text-base font-sans"><strong className="font-bold">Email:</strong> feltgoodbcn@gmail.com</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-10 md:p-14 w-full md:w-[58%] flex flex-col justify-center bg-white">
            {showSuccess ? (
              <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm">
                  ✓
                </div>
                <h3 className="text-3xl font-serif font-bold text-stone-800 mb-4">
                  {language === 'es' ? 'Mensaje Enviado' : 'Message Sent'}
                </h3>
                <p className="text-stone-500 text-lg mb-8 max-w-md mx-auto">
                  {language === 'es' 
                    ? 'Gracias por su consulta de venta al por mayor. Nuestro equipo se pondrá en contacto con usted en breve.' 
                    : 'Thank you for your wholesale inquiry. Our team will get back to you shortly.'}
                </p>
                <button 
                  className="bg-stone-800 hover:bg-stone-900 text-white font-medium py-3 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={() => setShowSuccess(false)}
                >
                  {language === 'es' ? 'Enviar Otra Consulta' : 'Send Another Inquiry'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="w-full">
                    <label htmlFor="name" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 font-sans">
                      {language === 'es' ? 'Nombre Completo *' : 'Full Name *'}
                    </label>
                    <input type="text" id="name" required placeholder="Jane Doe" className="w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white font-sans text-sm text-gray-600 placeholder-gray-400" style={{ borderColor: '#E5DED0' }} />
                  </div>
                  <div className="w-full">
                    <label htmlFor="email" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 font-sans">
                      {language === 'es' ? 'Correo Electrónico *' : 'Email Address *'}
                    </label>
                    <input type="email" id="email" required placeholder="jane@retailco.com" className="w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white font-sans text-sm text-gray-600 placeholder-gray-400" style={{ borderColor: '#E5DED0' }} />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="w-full">
                    <label htmlFor="mobile" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 font-sans">
                      {language === 'es' ? 'Número de Móvil' : 'Mobile Number'}
                    </label>
                    <input type="tel" id="mobile" placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white font-sans text-sm text-gray-600 placeholder-gray-400" style={{ borderColor: '#E5DED0' }} />
                  </div>
                  <div className="w-full">
                    <label htmlFor="quantity" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 font-sans">
                      {language === 'es' ? 'Cantidad Esperada *' : 'Expected Quantity *'}
                    </label>
                    <select id="quantity" required defaultValue="" className="w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white font-sans text-sm text-gray-600" style={{ borderColor: '#E5DED0' }}>
                      <option value="" disabled>{language === 'es' ? 'Seleccionar volumen' : 'Select volume'}</option>
                      <option value="5000">{language === 'es' ? '5.000 unidades (A granel)' : '5,000 units (Bulk)'}</option>
                      <option value="10000">{language === 'es' ? 'Más de 10.000 unidades (MOQ)' : '10,000+ units (MOQ)'}</option>
                      <option value="custom">{language === 'es' ? 'Volumen Personalizado' : 'Custom Volume'}</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 font-sans">
                    {language === 'es' ? 'Consulta o Mensaje *' : 'Query or Message *'}
                  </label>
                  <textarea 
                    id="message" 
                    required 
                    rows="4" 
                    placeholder={language === 'es' ? 'Cuéntenos sobre sus necesidades minoristas...' : 'Tell us about your retail needs, requested products, or any customisation services required...'}
                    className="w-full px-4 py-3 rounded-lg border focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white resize-none font-sans text-sm text-gray-600 placeholder-gray-400"
                    style={{ borderColor: '#E5DED0' }}
                  ></textarea>
                </div>

                {errorMsg && <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm font-medium text-center mb-4">{errorMsg}</div>}

                <button type="submit" disabled={isSubmitting} className="w-full text-white font-bold py-3.5 px-6 rounded-[6px] transition-all duration-300 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-[11px] font-sans" style={{ backgroundColor: '#2d2a29' }}>
                  {isSubmitting ? (language === 'es' ? 'Enviando...' : 'Sending...') : (language === 'es' ? 'Enviar Consulta' : 'Send Inquiry')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
