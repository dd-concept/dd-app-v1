import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TelegramProvider } from './contexts/TelegramContext'
import { setTelegramColors, requestTelegramTheme } from './utils/telegramUtils'
import { toast } from 'sonner'

// Declare global toast property
declare global {
  interface Window {
    toast: typeof toast;
  }
}

// Apply theme immediately before rendering
requestTelegramTheme();
setTelegramColors();

// Listen for Telegram events after page loads
window.addEventListener('load', () => {
  // Sync colors with Telegram theme
  setTelegramColors();
  
  // Request current theme from Telegram
  setTimeout(() => {
    requestTelegramTheme();
  }, 1000);
});

// Make toast globally available
window.toast = toast;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TelegramProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </TelegramProvider>
);
