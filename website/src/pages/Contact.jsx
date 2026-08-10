import React, { useState } from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';

function Contact() {
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
    <div className="inquire-page animate-fade-in">
      <div className="container" style={{ maxWidth: '1000px', padding: '4rem 1rem' }}>
        
        <div className="inquire-wrapper">
          {/* Left Decorative Side */}
          <div className="inquire-sidebar">
            <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Let's Create Together</h1>
            <p style={{ marginBottom: '3rem', opacity: 0.9 }}>
              Partner with Felt Good for premium, handmade seasonal decor. We offer tailored wholesale and private-label solutions.
            </p>
              <AdvancedImage 
                cldImg={cld.image('cld-sample-3').resize(fill().width(400).height(400))} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--color-bg)' }}
              />
            <div style={{ marginTop: 'auto', paddingTop: '3rem' }}>
              <p><strong>Tel:</strong> +34 688 484 444</p>
              <p><strong>Email:</strong> feltgoodbcn@gmail.com</p>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="inquire-card">
            {showSuccess ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ fontSize: '4rem', color: '#2ebf68', marginBottom: '1rem', lineHeight: 1 }}>✓</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '1rem' }}>Message Sent</h3>
                <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '1.1rem' }}>Thank you for your wholesale inquiry. Our team will get back to you shortly.</p>
                <button className="btn" onClick={() => setShowSuccess(false)}>Send Another Inquiry</button>
              </div>
            ) : (
              <form className="inquire-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input type="text" id="name" required placeholder="Jane Doe" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input type="email" id="email" required placeholder="jane@retailco.com" />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input type="tel" id="mobile" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="quantity">Expected Quantity *</label>
                    <select id="quantity" required>
                      <option value="" disabled selected>Select volume</option>
                      <option value="5000">5,000 units (Bulk)</option>
                      <option value="10000">10,000+ units (MOQ)</option>
                      <option value="custom">Custom Volume</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Query or Message *</label>
                  <textarea 
                    id="message" 
                    required 
                    rows="5" 
                    placeholder="Tell us about your retail needs, requested products, or any customisation services required..."
                  ></textarea>
                </div>

                {errorMsg && <div style={{ color: 'var(--color-secondary)', marginBottom: '1rem', fontWeight: 600, textAlign: 'center' }}>{errorMsg}</div>}

                <button type="submit" disabled={isSubmitting} className="btn btn-full" style={{ marginTop: '1rem', padding: '1rem' }}>
                  {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
