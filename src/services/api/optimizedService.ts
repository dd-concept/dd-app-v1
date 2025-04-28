import { API_BASE_URL, TIMEOUTS, cache, CACHE_CONFIG, createFetchOptions } from './config';
import { checkUserProfile /*, getUserRank*/ } from './userService';
import { fetchOrders } from './orderService';
import { fetchProducts } from './productService';
import { TelegramUser, UserProfile, StockItem, Order } from './types';
import { toast } from 'sonner';
import { getDDCoinsBalance } from './userService';

// Interface for the result of fetchInitialData
export interface InitialData {
  profile: UserProfile | null;
  orders: Order[];
  products: StockItem[];
  ddCoinsBalance: number;
}

// Cache keys with extended TTL
const EXTENDED_CACHE = {
  DD_COINS: (userId: number) => `dd_coins_${userId}`,
  DD_COINS_TTL: 5 * 60 * 1000, // 5 minutes
};

/**
 * Get DD coins balance from cache or API
 * @param userId User ID to get coins for
 * @returns Cached balance or newly fetched balance
 */
export const getCachedDDCoinsBalance = async (userId: number): Promise<number> => {
  // Check cache first
  const cacheKey = EXTENDED_CACHE.DD_COINS(userId);
  const cachedBalance = cache.get<number>(cacheKey, EXTENDED_CACHE.DD_COINS_TTL);
  
  if (cachedBalance !== null) {
    console.log('Using cached DD coins balance from optimized service:', cachedBalance);
    return cachedBalance;
  }
  
  // Fetch and cache if not found
  try {
    const balance = await getDDCoinsBalance();
    cache.set(cacheKey, balance);
    return balance;
  } catch (error) {
    console.error('Error fetching DD coins in optimized service:', error);
    return 0;
  }
};

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
      fetchProducts(),
      getCachedDDCoinsBalance(userId)
    ]);
    
    // Process results
    const profile = results[0].status === 'fulfilled' ? results[0].value : null;
    const orders = results[1].status === 'fulfilled' ? results[1].value : [];
    const products = results[2].status === 'fulfilled' ? results[2].value : [];
    const ddCoinsBalance = results[3].status === 'fulfilled' ? results[3].value : 0;
    
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
    if (results[3].status === 'rejected') {
      console.error('Failed to fetch DD coins balance:', results[3].reason);
    }
    
    return { profile, orders, products, ddCoinsBalance };
  } catch (error) {
    console.error('Error in parallel fetch:', error);
    toast.error('Error loading data. Some features may be limited.');
    
    // Return empty data to prevent app crashes
    return {
      profile: null,
      orders: [],
      products: [],
      ddCoinsBalance: 0
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
    const ddCoinsCacheKey = EXTENDED_CACHE.DD_COINS(userId);
    
    cache.invalidate(profileCacheKey);
    cache.invalidate(ordersCacheKey);
    cache.invalidate(ddCoinsCacheKey);
    cache.invalidate('products');
    
    // Fetch fresh data
    await fetchInitialData(userId);
    
    toast.success('Data refreshed successfully');
  } catch (error) {
    console.error('Error refreshing data:', error);
    toast.error('Failed to refresh data');
  }
}; 