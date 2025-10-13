import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider } from './ui/Toast'

// ensure a modal root exists at startup
if (typeof document !== 'undefined') {
  let el = document.getElementById('modal-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'modal-root';
    document.body.appendChild(el);
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
  )
}
