import { toast } from 'sonner';
import { API_BASE_URL, TIMEOUTS, handleApiError, cache, CACHE_CONFIG, createFetchOptions } from './config';
import { TelegramUser, UserProfile, UserExistsRequest, UserExistsResponse, UserRankRequest, UserRankResponse, DeliveryRate } from './types';
import { getTelegramUser as getTelegramUserFromUtils } from '@/utils/telegramUtils';

// Cache keys
const CACHE_KEYS = {
  PROFILE: (userId: number) => `profile_${userId}`,
  RANK: (userId: number) => `rank_${userId}`,
  DD_COINS: (userId: number) => `dd_coins_${userId}`,
  DELIVERY_RATES: 'delivery_rates'
};

// Helper function to get Telegram user data
export const getTelegramUser = (): TelegramUser | null => {
  try {
    // First try to get user data from telegramUtils (which has better parsing)
    const userFromUtils = getTelegramUserFromUtils();
    if (userFromUtils) {
      console.log('Using Telegram user data from telegramUtils');
      return userFromUtils;
    }
    
    // Check if Telegram WebApp is available
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      
      // Make sure we have a valid user object
      if (user && user.id) {
        return user;
      } else {
        console.warn('Telegram WebApp available but user data is invalid');
      }
    }
    
    // We couldn't get user data - this is a real issue
    console.error('No Telegram user data available');
    return null;
  } catch (error) {
    console.error('Error getting Telegram user:', error);
    return null;
  }
};

// Check if user exists in the system when the app initializes
export const checkUserExists = async (returnFullResponse: boolean = true): Promise<UserExistsResponse | boolean> => {
  try {
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available for existence check');
      return false;
    }
    
    console.log(`Checking if user exists: ID=${user.id}, username=${user.username || 'not set'}`);
    
    // Prepare the request body
    const requestBody: UserExistsRequest = {
      telegram_user_id: user.id
    };
    
    // Add username if available
    if (user.username) {
      requestBody.telegram_username = user.username;
    }
    
    // Make the API call with improved fetch options
    const { options, clearTimeout } = createFetchOptions('POST', requestBody, TIMEOUTS.PROFILE);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/check-exists`, options);
      clearTimeout();
      
      if (!response.ok) {
        // Gracefully handle 404 - consider user doesn't exist
        if (response.status === 404) {
          console.log('User not found (404), considered as non-existent');
          return false;
        }
        
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
      
      // Parse response
      const existsResponse: UserExistsResponse = JSON.parse(responseText);
      console.log('User existence check result:', existsResponse);
      
      // Cache the DD coins balance to make it immediately available to other components
      if (existsResponse.dd_coins_balance !== undefined) {
        const cacheKey = CACHE_KEYS.DD_COINS(user.id);
        cache.set(cacheKey, existsResponse.dd_coins_balance);
      }
      
      // Return full response if requested
      if (returnFullResponse) {
        return existsResponse;
      }
      
      // Otherwise return false for is_new_client = false, true for is_new_client = true
      return existsResponse.is_new_client;
    } catch (error: any) {
      // Log the error but don't show toast for this background check
      console.error('Error checking if user exists:', error);
      return false;
    }
  } catch (error: any) {
    console.error('Error in checkUserExists:', error);
    return false;
  }
};

// Get user rank with caching
/*
export const getUserRank = async (): Promise<number> => {
  try {
    const user = getTelegramUser();
    if (!user || !user.id) {
      console.error('No Telegram user data available for getting rank');
      return 0; // Default rank
    }
    
    console.log(`Getting rank for user ID: ${user.id}`);
    
    // Check cache first
    const cacheKey = CACHE_KEYS.RANK(user.id);
    const cachedRank = cache.get<number>(cacheKey, CACHE_CONFIG.PROFILE_TTL);
    if (cachedRank !== null) {
      console.log('Using cached rank data:', cachedRank);
      return cachedRank;
    }
    
    // Prepare the request
    const requestBody: UserRankRequest = {
      telegram_user_id: user.id
    };
    
    // Make the API call with improved fetch options
    const { options, clearTimeout } = createFetchOptions('POST', requestBody, TIMEOUTS.PROFILE);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/rank`, options);
      clearTimeout();
      
      // If user not found, just return 0 as the default rank
      if (response.status === 404) {
        console.log('User not found in rank API, using default rank 0');
        // Cache the default rank to avoid repeated calls
        cache.set(cacheKey, 0);
        return 0;
      }
      
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
      console.log('Raw rank response:', responseText);
      
      // Parse response
      const rankResponse: UserRankResponse = JSON.parse(responseText);
      console.log('User rank result:', rankResponse);
      
      // Make sure we have loyalty_rank and convert to number
      if (rankResponse.loyalty_rank === undefined) {
        console.error('loyalty_rank not found in response:', rankResponse);
        // Return 0 as default
        cache.set(cacheKey, 0);
        return 0;
      }
      
      // Get the loyalty_rank value 
      // Convert string rank to number if needed
      const rankValue = typeof rankResponse.loyalty_rank === 'string' 
        ? parseInt(rankResponse.loyalty_rank, 10) || 0
        : Number(rankResponse.loyalty_rank) || 0;
      
      console.log('Extracted rank value:', rankValue);
      
      // Cache the rank
      cache.set(cacheKey, rankValue);
      
      return rankValue;
    } catch (error: any) {
      console.error('Error getting user rank:', error);
      
      // Don't show error toast for user not found
      if (!error.message.includes('User not found')) {
        toast.error(`Error getting rank: ${error.message}`);
      }
      
      return 0; // Default rank
    }
  } catch (error: any) {
    console.error('Error in getUserRank:', error);
    
    // Don't show error toast for user not found
    if (!error.message.includes('User not found')) {
      toast.error(`Error: ${error.message}`);
    }
    
    return 0; // Default rank
  }
};
*/

// Legacy function for backward compatibility
export const checkUserProfile = async (userId: number): Promise<UserProfile> => {
  try {
    // Get current user info if userId wasn't provided
    const user = getTelegramUser();
    const safeUserId = userId || (user ? user.id : 0);
    const username = user ? (user.username || `user_${safeUserId}`) : `user_${safeUserId}`;
    
    if (!safeUserId) {
      console.error('No user ID available for profile check');
      throw new Error('User ID required');
    }
    
    // Get user rank via the new API
    // const loyaltyRank = await getUserRank();
    // console.log(`Retrieved loyalty rank for user ${safeUserId}: ${loyaltyRank}`);
    
    // Return a compatible profile object
    return {
      telegram_username: username,
      rank: 0, // Default to 0 since rank is not used
      total_orders: 0 // We don't have this information in the new API
    };
  } catch (error) {
    console.error('Error in legacy checkUserProfile:', error);
    
    // Return a minimal profile to prevent app crashes
    return {
      telegram_username: `user_${userId || 0}`,
      rank: 0,
      total_orders: 0
    };
  }
};

/**
 * Get user's DD coins balance
 * @returns A promise that resolves to the user's DD coins balance
 */
export const getDDCoinsBalance = async (): Promise<number> => {
  try {
    const user = getTelegramUser();
    if (!user || !user.id) {
      console.error('No Telegram user data available for getting DD coins balance');
      return 0; // Default balance
    }
    
    const userId = user.id;
    console.log(`Getting DD coins balance for user ID: ${userId}`);
    
    // Check cache first
    const cacheKey = CACHE_KEYS.DD_COINS(userId);
    const cachedBalance = cache.get<number>(cacheKey, CACHE_CONFIG.PROFILE_TTL);
    if (cachedBalance !== null) {
      console.log('Using cached DD coins balance:', cachedBalance);
      return cachedBalance;
    }
    
    // If not cached, get from user check API
    console.log('No cached DD coins balance, fetching from API...');
    const userResponse = await checkUserExists(true);
    
    if (userResponse && typeof userResponse !== 'boolean') {
      const balance = userResponse.dd_coins_balance;
      console.log('DD coins balance from user check:', balance);
        
        // Cache the balance
        cache.set(cacheKey, balance);
        
        return balance;
      }
      
    return 0; // Default balance if we couldn't get it
  } catch (error: any) {
    console.error('Error getting DD coins balance:', error);
    return 0; // Default balance on error
  }
};

/**
 * Get available delivery rates
 * @returns A promise that resolves to an array of delivery rates
 */
export const getDeliveryRates = async (): Promise<DeliveryRate[]> => {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.DELIVERY_RATES;
    const cachedRates = cache.get<DeliveryRate[]>(cacheKey, CACHE_CONFIG.PROFILE_TTL);
    if (cachedRates !== null) {
      console.log('Using cached delivery rates:', cachedRates);
      return cachedRates;
    }
    
    console.log('Fetching delivery rates from API...');
    
    // Make the API call with improved fetch options
    const { options, clearTimeout } = createFetchOptions('GET', null, TIMEOUTS.PROFILE);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/delivery-rates`, options);
      clearTimeout();
      
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
      console.log('Raw delivery rates response:', responseText);
      
      // Parse response - format is { "delivery_rates": [{ "delivery_type": "...", "price_rub": 0 }, ...] }
      const ratesResponse = JSON.parse(responseText);
      console.log('Delivery rates response:', ratesResponse);
      
      // Extract the rates
      const rates = ratesResponse.delivery_rates || [];
      
      // Cache the rates
      cache.set(cacheKey, rates);
      
      return rates;
    } catch (error: any) {
      console.error('Error getting delivery rates:', error);
      toast.error(`Error getting delivery rates: ${error.message}`);
      return []; // Empty array as default
    }
  } catch (error: any) {
    console.error('Error in getDeliveryRates:', error);
    return []; // Empty array as default
  }
};
