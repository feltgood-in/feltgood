import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { InquiryProvider } from './context/InquiryContext'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <InquiryProvider>
          <App />
        </InquiryProvider>
      </LanguageProvider>
    </HelmetProvider>
  </StrictMode>,
)
