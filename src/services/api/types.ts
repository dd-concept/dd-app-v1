
// Common types used across API services

// Telegram Web App user interface
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// User profile from API
export interface UserProfile {
  telegram_username: string;
  rank: number;
  total_orders: number;
}

// Product-related interfaces
export interface StockItem {
  sku: string;
  item_name: string;
  color_code: string;
  brand?: string;
  price_rub: number;
  sizes: SizeAvailability[];
  photos?: ItemPhoto[];
}

export interface SizeAvailability {
  size: string;
  count: number; // Number of items available in this size
}

export interface ItemPhoto {
  photo_url: string;
  photo_category: "front" | "side" | "packaging" | "other";
}

// Order-related interfaces
export interface Order {
  order_id: number;
  order_date: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  items: OrderItem[];
}

export interface OrderItem {
  sku: string;
  item_name: string;
  color_code: string;
  size: string;
  price_rub: number;
}
