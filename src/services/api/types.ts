// Common types used across API services

// Telegram Web App user interface
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

// User related interfaces
export interface UserProfile {
  telegram_username: string;
  rank: number;
  total_orders: number;
}

export interface UserExistsRequest {
  telegram_username?: string;
  telegram_user_id?: number;
}

export interface UserExistsResponse {
  exists: boolean;
  status?: string;
  message?: string;
}

export interface UserRankRequest {
  telegram_user_id: number;
}

export interface UserRankResponse {
  loyalty_rank: string | number;
}

// Stock related interfaces
export interface StockResponse {
  items: StockItem[];
}

export interface CategoryResponse {
  categories: Category[];
}

export interface Category {
  id: number;
  name: string;
}

export interface StockItem {
  sku: string;
  item_name: string;
  brand?: string;
  description?: string;
  category?: string;
  color_code: string;
  photos?: ItemPhoto[];
  price_rub: string | number;
  sizes: SizeAvailability[];
}

export interface SizeAvailability {
  size: string;
  quantity: number;
}

export interface ItemPhoto {
  photo_url: string;
  photo_category: "front" | "side" | "packaging" | "other";
}

// Cart-related interfaces
export interface CartItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
  sale_price?: number;
  sku: string;
  image?: string;
  color?: string;
}

// Order-related interfaces
export interface OrdersRequest {
  telegram_user_id: number;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface OrderItem {
  sku: string;
  item_name: string;
  size: string;
  price_cny: string | null;
  price_rub: string | null;
  sale_price: string | null;
  quantity: number;
}

export interface OrderPromocode {
  promocode_text: string;
  discount_fixed: number | null;
  discount_percent: string | null;
}

export interface Order {
  order_id: number;
  created_at: string;
  items: OrderItem[];
  prepay_amount: string;
  status: string;
  promocode: OrderPromocode | null;
  subtotal: string;
  final_price: string;
  discount_amount: string;
  dd_coins_used: string;
}

// Client information interfaces
export interface ClientInfo {
  telegram_id: number;
  phone_number?: string;
  email?: string;
  address?: string;
}

export interface ClientInfoResponse {
  telegram_id: number;
  phone_number?: string;
  email?: string;
  address?: string;
}

export interface UpdateClientInfoRequest {
  telegram_id: number;
  phone_number?: string;
  email?: string;
  address?: string;
}

export interface UpdateClientInfoResponse {
  success: boolean;
  message?: string;
}

// New Order Endpoints Interfaces
export interface OrderStockRequest {
  telegram_user_id: number;
  items: StockOrderItem[];
}

export interface StockOrderItem {
  sku: string;
  size: string;
  quantity: number;
}

export interface OrderStockResponse {
  success: boolean;
  order_id?: number;
  message?: string;
  errors?: string[];
}

export interface PreorderRequest {
  telegram_user_id: number;
  item: {
    dewu_url: string;
    size?: string;
    price_cny?: number;
    category_type: string;
    delivery_type: string;
  };
}

export interface PreorderResponse {
  success: boolean;
  order_id?: number;
  message?: string;
  errors?: string[];
}

// Referral system interfaces
export interface ReferralInfo {
  code: string;
  telegram_deep_link: string;
  total_referrals: number;
}

export interface CreateReferralResponse {
  success: boolean;
  referral_info?: ReferralInfo;
  message?: string;
}

export interface ReferralStats {
  total_referrals: number;
  referred_users: ReferralUser[];
}

export interface ReferralUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  joined_at: string;
}

export interface RegisterReferralRequest {
  telegram_id: number;
  referral_code: string;
}

export interface RegisterReferralResponse {
  success: boolean;
  message?: string;
}

// DD Coins related interfaces
export interface DDCoinsResponse {
  balance: number;
}

// Delivery rates interfaces
export interface DeliveryRate {
  delivery_type: string;
  price_rub: number;
}

export interface DeliveryRatesResponse {
  delivery_rates: DeliveryRate[];
}
