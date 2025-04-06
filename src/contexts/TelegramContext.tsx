import React, { createContext, useContext, ReactNode } from 'react';

// User type for consistency
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

// Define WebApp interface for local use
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
    query_id?: string;
    start_param?: string;
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback?: () => void) => void;
    show: () => void;
    hide: () => void;
    setParams: (params: Record<string, unknown>) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback?: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  themeParams: {
    backgroundColor?: string;
    textColor?: string;
    hintColor?: string;
    linkColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    secondaryBackgroundColor?: string;
    isDark?: boolean;
  };
}

// Define the context interface with proper types
interface TelegramContextType {
  tg: TelegramWebApp | undefined;
  onClose: () => void;
  onToggleButton: () => void;
  initWebApp: () => void;
  getUserData: () => TelegramUser | null;
  user: TelegramUser | undefined;
  queryId: string | undefined;
}

// Create the context
const TelegramContext = createContext<TelegramContextType | null>(null);

// Provider component
export const TelegramProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Get the Telegram WebApp instance
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp as TelegramWebApp | undefined : undefined;

  // Function to close the WebApp
  const onClose = () => {
    if (tg) {
      tg.close();
    }
  };

  // Function to toggle the main button
  const onToggleButton = () => {
    if (tg?.MainButton?.isVisible) {
      tg.MainButton.hide();
    } else if (tg?.MainButton) {
      tg.MainButton.show();
    }
  };

  // Initialize the WebApp
  const initWebApp = () => {
    console.log("Initializing Telegram WebApp with direct access...");
    if (tg) {
      tg.ready();
      console.log("Telegram WebApp initialized successfully");
    } else {
      console.error("Telegram WebApp is not available");
    }
  };

  // Get user data from initDataUnsafe
  const getUserData = (): TelegramUser | null => {
    if (tg?.initDataUnsafe?.user) {
      console.log("User data found in initDataUnsafe:", tg.initDataUnsafe.user);
      
      // Store in localStorage for future use
      try {
        localStorage.setItem('telegramUser', JSON.stringify(tg.initDataUnsafe.user));
      } catch (e) {
        console.error("Error storing user data in localStorage:", e);
      }
      
      return tg.initDataUnsafe.user;
    }
    
    console.log("No user data found in initDataUnsafe");
    
    // Try to get from localStorage as fallback
    try {
      const storedUser = localStorage.getItem('telegramUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser) as TelegramUser;
        console.log("Using stored user data from localStorage:", userData);
        return userData;
      }
    } catch (e) {
      console.error("Error retrieving user data from localStorage:", e);
    }
    
    return null;
  };

  // Create the context value
  const contextValue: TelegramContextType = {
    tg,
    onClose,
    onToggleButton,
    initWebApp,
    getUserData,
    user: tg?.initDataUnsafe?.user,
    queryId: tg?.initDataUnsafe?.query_id,
  };

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};

// Hook to use the Telegram context
export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}; 