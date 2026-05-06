import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Zinco SW registered: ', registration);
    }).catch(registrationError => {
      console.log('Zinco SW registration failed: ', registrationError);
    });
  });
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>,
  );
} catch (error) {
  console.error("Critical render error:", error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>Critical Error</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `;
}
