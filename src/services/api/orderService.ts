
import { toast } from 'sonner';
import { API_BASE_URL, TIMEOUTS } from './config';
import { Order } from './types';
import { MOCK_ORDERS } from './mockData';

// Fetch orders by username with fallback to mock data
export const fetchOrders = async (username: string): Promise<Order[]> => {
  try {
    console.log(`Fetching orders for ${username}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.ORDERS);
    
    const response = await fetch(`${API_BASE_URL}/client/${username}/orders`, {
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorText;
      } catch (e) {
        errorDetail = errorText || `HTTP error ${response.status}`;
      }
      throw new Error(errorDetail);
    }
    
    const data = await response.json();
    console.log('Orders fetched successfully:', data);
    return data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    
    // If it's a network error or timeout, use mock data
    if (error.name === 'AbortError') {
      console.log('Request timeout, using mock order data');
      toast.error('API request timed out. Using demo data.');
      return MOCK_ORDERS;
    }
    
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.log('Network error, using mock order data');
      toast.error('Network error. Using demo data.');
      return MOCK_ORDERS;
    }
    
    // Show the exact error message
    toast.error(`Error fetching orders: ${error.message}`);
    console.log('Using mock order data after error');
    return MOCK_ORDERS;
  }
};
