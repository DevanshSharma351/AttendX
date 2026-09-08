import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { applyTheme } from './hooks/useTheme.js';

// Apply the stored theme before first paint to avoid a flash.
try {
  const raw = localStorage.getItem('attendanceData');
  const parsed = raw ? JSON.parse(raw) : null;
  applyTheme(parsed?.settings?.theme ?? 'system');
} catch {
  applyTheme('system');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
