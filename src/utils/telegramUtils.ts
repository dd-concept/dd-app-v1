
import { TelegramUser } from '@/services/api';

// Define the WebApp interface for Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user: TelegramUser;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

// Get user from Telegram WebApp or return null if not in Telegram
export const getTelegramUser = (): TelegramUser | null => {
  if (window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  return null;
};

// Initialize Telegram WebApp
export const initTelegramWebApp = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    // Notify Telegram that the WebApp is ready
    window.Telegram.WebApp.ready();
    
    // Expand the WebApp to take up the entire screen
    window.Telegram.WebApp.expand();
  }
};

// Close Telegram WebApp
export const closeTelegramWebApp = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.close();
  }
};

// Set up the main button in Telegram WebApp
export const setupMainButton = (
  text: string, 
  color: string = '#3390EC', 
  textColor: string = '#ffffff',
  onClick: () => void
) => {
  if (window.Telegram && window.Telegram.WebApp) {
    const { MainButton } = window.Telegram.WebApp;
    
    MainButton.text = text;
    MainButton.color = color;
    MainButton.textColor = textColor;
    MainButton.onClick(onClick);
    MainButton.show();
  }
};

export const hideMainButton = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.MainButton.hide();
  }
};
