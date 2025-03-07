
import { toast } from 'sonner';

const API_BASE_URL = 'http://185.154.12.121:8000/api';

// Updated interfaces to match real API
export interface StockItem {
  sku: string;
  item_name: string;
  color_code: string;
  sizes: SizeAvailability[];
}

export interface SizeAvailability {
  size: string;
  count: number; // Number of items available in this size
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

// Mock data for fallback when API is unavailable
const MOCK_STOCK: StockItem[] = [
  {
    "sku": "SHOE-001",
    "item_name": "Nike Air Max",
    "color_code": "BLACK",
    "sizes": [
      {
        "size": "40",
        "count": 1
      }
    ]
  },
  {
    "sku": "SHOE-002",
    "item_name": "Nike Air Max",
    "color_code": "WHITE",
    "sizes": [
      {
        "size": "41",
        "count": 1
      }
    ]
  },
  {
    "sku": "SHOE-003",
    "item_name": "Adidas Boost",
    "color_code": "BLACK",
    "sizes": [
      {
        "size": "42",
        "count": 1
      }
    ]
  },
  {
    "sku": "TSHIRT-001",
    "item_name": "Basic T-Shirt",
    "color_code": "WHITE",
    "sizes": [
      {
        "size": "S",
        "count": 5
      },
      {
        "size": "M",
        "count": 7
      },
      {
        "size": "L",
        "count": 3
      }
    ]
  },
  {
    "sku": "JACKET-001",
    "item_name": "Leather Jacket",
    "color_code": "BROWN",
    "sizes": [
      {
        "size": "M",
        "count": 2
      },
      {
        "size": "L",
        "count": 4
      },
      {
        "size": "XL",
        "count": 1
      }
    ]
  }
];

const MOCK_ORDERS: Order[] = [
  {
    order_id: 1001,
    order_date: '2023-06-15',
    total_amount: 7899,
    status: 'paid',
    items: [
      { sku: 'TSHIRT-001', item_name: 'Basic T-Shirt', color_code: 'WHITE', size: 'M', price_rub: 2999 },
      { sku: 'SHOE-001', item_name: 'Nike Air Max', color_code: 'BLACK', size: '40', price_rub: 4900 }
    ]
  },
  {
    order_id: 1002,
    order_date: '2023-07-22',
    total_amount: 12550,
    status: 'pending',
    items: [
      { sku: 'JACKET-001', item_name: 'Leather Jacket', color_code: 'BROWN', size: 'L', price_rub: 12550 }
    ]
  }
];

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
        rank: 3,
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
