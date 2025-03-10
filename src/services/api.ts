
import { toast } from 'sonner';

const API_BASE_URL = 'http://185.154.12.121:8000/api';

// Updated interfaces to match real API
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

export interface UserProfile {
  telegram_username: string;
  rank: number;
  total_orders: number;
}

// Telegram Web App user interface
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

// Mock data for fallback when API is unavailable
const MOCK_STOCK: StockItem[] = [
  {
    "sku": "TS001-BLK",
    "item_name": "Basic T-Shirt",
    "color_code": "BLK",
    "brand": "FashionBrand",
    "price_rub": 500.0,
    "sizes": [
      {
        "size": "M",
        "count": 2
      },
      {
        "size": "L",
        "count": 2
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/photos/ts001_front.jpg",
        "photo_category": "front"
      },
      {
        "photo_url": "https://example.com/photos/ts001_side.jpg",
        "photo_category": "side"
      }
    ]
  },
  {
    "sku": "JN002-BLU",
    "item_name": "Slim Jeans",
    "color_code": "BLU",
    "brand": "DenimCo",
    "price_rub": 1200.0,
    "sizes": [
      {
        "size": "32",
        "count": 2
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/photos/jn002_front.jpg",
        "photo_category": "front"
      }
    ]
  },
  {
    "sku": "SW003-RED",
    "item_name": "Wool Sweater",
    "color_code": "RED",
    "brand": "WinterWear",
    "price_rub": 1500.0,
    "sizes": [
      {
        "size": "S",
        "count": 1
      },
      {
        "size": "M",
        "count": 3
      }
    ],
    "photos": [
      {
        "photo_url": "https://example.com/photos/sw003_front.jpg",
        "photo_category": "front"
      }
    ]
  }
];

const MOCK_ORDERS: Order[] = [
  {
    order_id: 1,
    order_date: '2023-02-20T00:00:00',
    total_amount: 1500.0,
    status: 'paid',
    items: [
      { sku: 'SW003-RED', item_name: 'Wool Sweater', color_code: 'RED', size: 'M', price_rub: 1500.0 }
    ]
  },
  {
    order_id: 2,
    order_date: '2023-05-15T00:00:00',
    total_amount: 1700.0,
    status: 'pending',
    items: [
      { sku: 'TS001-BLK', item_name: 'Basic T-Shirt', color_code: 'BLK', size: 'L', price_rub: 500.0 },
      { sku: 'JN002-BLU', item_name: 'Slim Jeans', color_code: 'BLU', size: '32', price_rub: 1200.0 }
    ]
  }
];

// Helper function to get Telegram user data
export const getTelegramUser = (): TelegramUser | null => {
  try {
    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    
    // Fallback for development
    console.log('Telegram WebApp not available, using mock data');
    return {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    };
  } catch (error) {
    console.error('Error getting Telegram user:', error);
    return null;
  }
};

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  let message = 'An error occurred. Please try again.';
  
  if (error.response) {
    // Server responded with an error status code
    const statusCode = error.response.status;
    if (statusCode === 400) {
      message = 'Bad request. Please check your input.';
    } else if (statusCode === 404) {
      message = 'Resource not found.';
    } else if (statusCode === 500) {
      message = 'Server error. Please try again later.';
    }
    
    // Try to extract error detail from response
    try {
      const errorData = error.response.data;
      if (errorData && errorData.detail) {
        message = errorData.detail;
      }
    } catch (e) {
      // Ignore parsing errors
    }
  } else if (error.request) {
    // Request made but no response received
    message = 'No response from server. Using cached data instead.';
  }
  
  if (message.includes('Using cached data')) {
    toast.info(message);
  } else {
    toast.error(message);
  }
  
  return Promise.reject(error);
};

// Fetch stock items with fallback to mock data
export const fetchProducts = async (): Promise<StockItem[]> => {
  try {
    console.log('Fetching products from API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/stock`, {
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching products:', error);
    
    // If it's a network error or timeout, use mock data
    if (error.name === 'AbortError' || error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.log('Using mock product data');
      toast.info('Using demo data - couldn\'t connect to API');
      return MOCK_STOCK;
    }
    
    return handleApiError(error);
  }
};

// Fetch orders by username with fallback to mock data
export const fetchOrders = async (username: string): Promise<Order[]> => {
  try {
    console.log(`Fetching orders for ${username}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/client/${username}/orders`, {
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    
    // If it's a network error or timeout, use mock data
    if (error.name === 'AbortError' || error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.log('Using mock order data');
      toast.info('Using demo data - couldn\'t connect to API');
      return MOCK_ORDERS;
    }
    
    return handleApiError(error);
  }
};

// Check/create user profile with fallback
export const checkUserProfile = async (username: string, userId: number): Promise<UserProfile> => {
  try {
    console.log(`Checking profile for ${username}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/client/check`, {
      method: 'POST',
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, user_id: userId }),
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Error checking profile:', error);
    
    // If it's a network error or timeout, use mock data
    if (error.name === 'AbortError' || error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.log('Using mock profile data');
      toast.info('Using demo data - couldn\'t connect to API');
      return {
        telegram_username: username,
        rank: 1,
        total_orders: 2
      };
    }
    
    return handleApiError(error);
  }
};

// Add product to cart (placeholder - to be implemented with actual API)
export const addToCart = async (sku: string, size: string): Promise<void> => {
  try {
    // Since there's no cart API yet, we're just simulating a successful addition
    console.log('Adding to cart:', sku, size);
    
    // Fake success response
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success('Added to cart');
    return;
  } catch (error) {
    return handleApiError(error);
  }
};
