
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
    message = 'No response from server. Please check your connection.';
  }
  
  toast.error(message);
  return Promise.reject(error);
};

// Fetch stock items
export const fetchProducts = async (): Promise<StockItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stock`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Fetch orders by username
export const fetchOrders = async (username: string): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${username}/orders`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Check/create user profile
export const checkUserProfile = async (username: string, userId: number): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, user_id: userId }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
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
