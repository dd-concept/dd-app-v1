
import { toast } from 'sonner';

const API_BASE_URL = 'http://185.154.12.121:8000/api';

export interface Product {
  id: number;
  name: string;
  color: string;
  sizes: string[];
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  date: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  items: OrderItem[];
}

export interface OrderItem {
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
}

export interface UserProfile {
  username: string;
  email: string;
  rank: number;
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

// Fetch products
export const fetchProducts = async (): Promise<Product[]> => {
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

// Fetch user profile
export const fetchUserProfile = async (username: string): Promise<UserProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/client/${username}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Add product to cart
export const addToCart = async (productId: number, size: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, size }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    toast.success('Added to cart');
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};
