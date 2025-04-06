import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TelegramProvider } from './contexts/TelegramContext'
import { setTelegramColors, requestTelegramTheme } from './utils/telegramUtils'

// Apply theme immediately before rendering
const applyInitialTheme = () => {
  // Request the theme from Telegram
  requestTelegramTheme();
  
  // Apply Telegram colors based on user's theme
  setTelegramColors();
};

// Apply theme immediately
applyInitialTheme();

// Listen for theme changes and reapply our colors
window.addEventListener('themechange', () => {
  console.log('Theme change detected, adapting to user theme');
  setTelegramColors();
});

createRoot(document.getElementById("root")!).render(
  <TelegramProvider>
    <App />
  </TelegramProvider>
);
