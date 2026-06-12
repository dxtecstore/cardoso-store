import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { CartProvider }     from './context/CartContext'
import { AdminProvider }    from './context/AdminContext'
import { SettingsProvider } from './context/SettingsContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <SettingsProvider>
          <CartProvider>
            <App />
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#141414',
                  color: '#f0ece4',
                  border: '1px solid #1e1e1e',
                  borderRadius: '0',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  maxWidth: '320px',
                },
                success: { iconTheme: { primary: '#c9a84c', secondary: '#080808' } },
                error:   { iconTheme: { primary: '#e05252', secondary: '#fff' } },
              }}
            />
          </CartProvider>
        </SettingsProvider>
      </AdminProvider>
    </BrowserRouter>
  </React.StrictMode>
)
