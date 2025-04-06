import { toast } from 'sonner';
import { API_BASE_URL, createFetchOptions } from './config';
import { CartItem } from './types';

/**
 * Check if all items in the cart are available in stock
 * @returns A promise that resolves to true if all items are available
 */
export const checkStockAvailability = async (items: CartItem[]): Promise<boolean> => {
  try {
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('POST', { items });
    
    const response = await fetch(`${API_BASE_URL}/stock/check`, options);
    clearTimeout();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      toast.error('Failed to check stock availability');
      return false;
    }
    
    // Parse response
    const responseText = await response.text();
    const result = JSON.parse(responseText);
    
    if (!result.available) {
      toast.error(result.message || 'Some items are out of stock');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking stock availability:', error);
    toast.error('Failed to check stock availability');
    return false;
  }
}; 