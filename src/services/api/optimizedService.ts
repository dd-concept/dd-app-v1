import { API_BASE_URL, TIMEOUTS, cache, CACHE_CONFIG, createFetchOptions } from './config';
import { checkUserProfile /*, getUserRank*/ } from './userService';
import { fetchOrders } from './orderService';
import { fetchProducts } from './productService';
import { TelegramUser, UserProfile, StockItem, Order } from './types';
import { toast } from 'sonner';

// Interface for the result of fetchInitialData
export interface InitialData {
  profile: UserProfile | null;
  orders: Order[];
  products: StockItem[];
}

/**
 * Fetch multiple API resources in parallel
 * This significantly improves loading performance
 */
export const fetchInitialData = async (userId: number): Promise<InitialData> => {
  console.log('Fetching initial data in parallel...');
  
  try {
    // Start all requests simultaneously
    const results = await Promise.allSettled([
      checkUserProfile(userId),
      fetchOrders(),
      fetchProducts()
    ]);
    
    // Process results
    const profile = results[0].status === 'fulfilled' ? results[0].value : null;
    const orders = results[1].status === 'fulfilled' ? results[1].value : [];
    const products = results[2].status === 'fulfilled' ? results[2].value : [];
    
    // Log success or failures
    if (results[0].status === 'rejected') {
      console.error('Failed to fetch profile:', results[0].reason);
    }
    if (results[1].status === 'rejected') {
      console.error('Failed to fetch orders:', results[1].reason);
    }
    if (results[2].status === 'rejected') {
      console.error('Failed to fetch products:', results[2].reason);
    }
    
    return { profile, orders, products };
  } catch (error) {
    console.error('Error in parallel fetch:', error);
    toast.error('Error loading data. Some features may be limited.');
    
    // Return empty data to prevent app crashes
    return {
      profile: null,
      orders: [],
      products: []
    };
  }
};

/**
 * Prefetch data in the background
 * Call this early in the app lifecycle to warm up the cache
 */
export const prefetchData = async (userId: number): Promise<void> => {
  try {
    // Start prefetching in the background
    fetchInitialData(userId)
      .then(() => console.log('Background prefetch completed'))
      .catch(error => console.error('Background prefetch failed:', error));
      
    // This function returns immediately, not waiting for the prefetch to complete
    return;
  } catch (error) {
    console.error('Error starting prefetch:', error);
  }
};

/**
 * Clear all cached data
 * Use this when you want to force fresh data from the API
 */
export const clearAllCaches = (): void => {
  cache.clear();
  console.log('All API caches cleared');
};

/**
 * Refresh specific data for a user
 */
export const refreshUserData = async (userId: number): Promise<void> => {
  try {
    // Clear relevant caches
    const profileCacheKey = `profile_${userId}`;
    const ordersCacheKey = `orders_${userId}`;
    // const rankCacheKey = `rank_${userId}`;
    
    cache.invalidate(profileCacheKey);
    cache.invalidate(ordersCacheKey);
    // cache.invalidate(rankCacheKey);
    cache.invalidate('products');
    
    // Fetch fresh data
    await fetchInitialData(userId);
    
    toast.success('Data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data:', error);
    toast.error('Failed to refresh data');
  }
}; 