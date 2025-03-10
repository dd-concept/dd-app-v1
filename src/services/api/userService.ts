
import { toast } from 'sonner';
import { API_BASE_URL, TIMEOUTS, handleApiError } from './config';
import { TelegramUser, UserProfile } from './types';

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

// Check/create user profile with fallback
export const checkUserProfile = async (username: string, userId: number): Promise<UserProfile> => {
  try {
    console.log(`Checking profile for ${username}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.PROFILE);
    
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
      if (responseText.startsWith('"') && responseText.endsWith('"') && responseText.includes('{')) {
        // This is a JSON string that's been double-stringified
        const unescaped = responseText.slice(1, -1).replace(/\\"/g, '"');
        data = JSON.parse(unescaped);
      } else {
        // Normal JSON parsing
        data = JSON.parse(responseText);
      }
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (parseError: any) {
      console.error('Error parsing profile JSON:', parseError);
      toast.error(`Error parsing API response: ${parseError.message}`);
      return {
        telegram_username: username,
        rank: 1,
        total_orders: 2
      };
    }
  } catch (error: any) {
    console.error('Error checking profile:', error);
    
    // If it's a network error or timeout, use mock data
    if (error.name === 'AbortError') {
      console.log('Request timeout, using mock profile data');
      toast.error('API request timed out. Using demo data.');
      return {
        telegram_username: username,
        rank: 1,
        total_orders: 2
      };
    }
    
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      console.log('Network error, using mock profile data');
      toast.error('Network error. Using demo data.');
      return {
        telegram_username: username,
        rank: 1,
        total_orders: 2
      };
    }
    
    // Show the exact error message
    toast.error(`Error checking profile: ${error.message}`);
    console.log('Using mock profile data after error');
    return {
      telegram_username: username,
      rank: 1,
      total_orders: 2
    };
  }
};
