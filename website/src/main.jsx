import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { InquiryProvider } from './context/InquiryContext'
import { LanguageProvider } from './context/LanguageContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <InquiryProvider>
        <App />
      </InquiryProvider>
    </LanguageProvider>
  </StrictMode>,
)
