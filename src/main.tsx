// Ensure window.fetch is writable and robust against browser extensions attempting to intercept it
try {
  if (typeof window !== 'undefined') {
    const orig = window.fetch ? window.fetch.bind(window) : null;
    let current = orig;
    Object.defineProperty(window, 'fetch', {
      get() { return current; },
      set(fn) { current = fn; },
      configurable: true,
      enumerable: true,
    });
  }
} catch {
  // Ignore if already configured
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
