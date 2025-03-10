
import { toast } from 'sonner';
import { API_BASE_URL, TIMEOUTS, handleApiError } from './config';
import { StockItem } from './types';
import { MOCK_STOCK } from './mockData';

// Fetch stock items with improved error handling
export const fetchProducts = async (): Promise<StockItem[]> => {
  try {
    console.log('Fetching products from API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PRODUCTS);
    
    const response = await fetch(`${API_BASE_URL}/stock`, {
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
    
    // Get the response text first
    const responseText = await response.text();
    console.log('Raw API response:', responseText);
    
    let data;
    try {
      // Check if the response is already a JSON string enclosed in quotes
      if (responseText.startsWith('"[') && responseText.endsWith(']"')) {
        // This is a JSON string that's been double-stringified
        // First remove the outer quotes and unescape
        const unescaped = responseText.slice(1, -1).replace(/\\"/g, '"');
        data = JSON.parse(unescaped);
        console.log('Parsed from double-stringified JSON:', data);
      } else {
        // Normal JSON parsing
        data = JSON.parse(responseText);
        console.log('Parsed from regular JSON:', data);
      }
      
      // Validate that we have an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data);
        toast.error('Invalid data format received from API');
        return MOCK_STOCK;
      }
      
      return data;
    } catch (parseError: any) {
      console.error('Error parsing JSON:', parseError);
      toast.error(`Error parsing API response: ${parseError.message}`);
      return MOCK_STOCK;
    }
  } catch (error: any) {
    console.error('Error fetching products:', error);
    
    // If it's a network error or timeout, use mock data
    if (error.name === 'AbortError') {
      console.log('Request timeout, using mock product data');
      toast.error('API request timed out. Using demo data.');
      return MOCK_STOCK;
    }
    
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.log('Network error, using mock product data');
      toast.error('Network error. Using demo data.');
      return MOCK_STOCK;
    }
    
    // Show the exact error message
    toast.error(`Error fetching products: ${error.message}`);
    console.log('Using mock product data after error');
    return MOCK_STOCK;
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
  } catch (error: any) {
    toast.error(`Error adding to cart: ${error.message}`);
    return Promise.reject(error);
  }
};
