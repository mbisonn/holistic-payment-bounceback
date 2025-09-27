
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/contexts/auth/AuthProvider'
import { initGTMErrorPrevention } from './utils/gtmErrorPrevention'

// Initialize GTM error prevention
initGTMErrorPrevention();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
