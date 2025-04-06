// Global type definitions for Telegram WebApp

// Define user type
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

// Define theme parameters
export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

// Define back button interface
export interface TelegramBackButton {
  isVisible: boolean;
  onClick: (callback: () => void) => void;
  offClick: (callback?: () => void) => void;
  show: () => void;
  hide: () => void;
}

// Define main button interface
export interface TelegramMainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText: (text: string) => void;
  onClick: (callback: () => void) => void;
  offClick: (callback?: () => void) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showProgress: (leaveActive?: boolean) => void;
  hideProgress: () => void;
  setParams: (params: Record<string, unknown>) => void;
}

// Define WebApp interface
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: string;
    hash?: string;
    query_id?: string;
    start_param?: string;
  };
  sendData: (data: string) => void;
  BackButton: TelegramBackButton;
  MainButton: TelegramMainButton;
  ready: () => void;
  close: () => void;
  expand: () => void;
  postEvent: (eventName: string, data: string) => void;
  // Theme color properties
  backgroundColor?: string;
  textColor?: string;
  headerColor?: string;
  linkColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  secondaryBackgroundColor?: string;
  colorScheme?: 'light' | 'dark';
  themeParams?: TelegramThemeParams;
}

// Define WebviewProxy interface
export interface TelegramWebviewProxy {
  postEvent: (eventName: string, data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
      WebviewProxy?: TelegramWebviewProxy;
    };
    TelegramWebviewProxy?: TelegramWebviewProxy;
  }
}

export {}; 