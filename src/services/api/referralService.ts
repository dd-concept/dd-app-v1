import { toast } from 'sonner';
import { API_BASE_URL, createFetchOptions } from './config';
import { ReferralInfo, CreateReferralResponse, ReferralStats } from './types';
import { getTelegramUser } from './userService';

// Define referral service API base
const REFERRAL_API_PATH = `${API_BASE_URL}/referrals`;

/**
 * Get or create referral code for current user
 * @returns A promise that resolves to the referral information
 */
export const getUserReferralInfo = async (retryAttempt = 0): Promise<ReferralInfo | null> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      toast.error('User data not available');
      return null;
    }
    
    console.log(`Getting referral info for Telegram ID: ${user.id}`);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('GET');
    
    const response = await fetch((`${REFERRAL_API_PATH}/info/${user.id}`), options);
    clearTimeout();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      
      // If 404, it means the user doesn't have a referral code yet, so we create one
      if (response.status === 404) {
        console.log('No referral code found, creating one...');
        const newReferral = await createReferralCode();
        if (newReferral) {
          return newReferral;
        } else if (retryAttempt === 0) {
          // Retry once more to get the newly created referral
          console.log('Retrying to get referral info after creation...');
          return getUserReferralInfo(1);
        }
      }
      
      // Only show error toast if we've already retried or it's not a 404
      if (retryAttempt > 0 || response.status !== 404) {
        toast.error('Failed to fetch referral information');
      }
      return null;
    }
    
    // Parse response
    const responseText = await response.text();
    const referralInfo: ReferralInfo = JSON.parse(responseText);
    
    console.log('Referral info fetched:', referralInfo);
    return referralInfo;
  } catch (error) {
    console.error('Error fetching referral info:', error);
    if (retryAttempt === 0) {
      console.log('Retrying to get referral info after error...');
      return getUserReferralInfo(1);
    }
    toast.error('Failed to fetch referral information');
    return null;
  }
};

/**
 * Create a new referral code for current user
 * @returns A promise that resolves to the referral information
 */
export const createReferralCode = async (): Promise<ReferralInfo | null> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      toast.error('User data not available');
      return null;
    }
    
    console.log(`Creating referral code for Telegram ID: ${user.id}`);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('POST', { telegram_id: user.id });
    
    const response = await fetch(`${REFERRAL_API_PATH}/create`, options);
    clearTimeout();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      toast.error('Failed to create referral code');
      return null;
    }
    
    // Parse response - per the API docs, response is the referral info directly, not wrapped
    const responseText = await response.text();
    const referralInfo: ReferralInfo = JSON.parse(responseText);
    
    console.log('Referral code created:', referralInfo);
    return referralInfo;
  } catch (error) {
    console.error('Error creating referral code:', error);
    toast.error('Failed to create referral code');
    return null;
  }
};

/**
 * Get referral statistics for current user
 * @returns A promise that resolves to the referral statistics
 */
export const getReferralStats = async (): Promise<ReferralStats | null> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      toast.error('User data not available');
      return null;
    }
    
    console.log(`Getting referral stats for Telegram ID: ${user.id}`);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('GET');
    
    const response = await fetch(`${REFERRAL_API_PATH}/stats/${user.id}`, options);
    clearTimeout();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      toast.error('Failed to fetch referral statistics');
      return null;
    }
    
    // Parse response
    const responseText = await response.text();
    const stats: ReferralStats = JSON.parse(responseText);
    
    console.log('Referral stats fetched:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    toast.error('Failed to fetch referral statistics');
    return null;
  }
};

/**
 * Share referral link via Telegram
 * @param referralInfo The referral information
 * @returns A promise that resolves to true if successful
 */
export const shareReferralLink = async (referralInfo: ReferralInfo): Promise<boolean> => {
  try {
    // Check if the browser supports the Web Share API
    if (navigator.share) {
      await navigator.share({
        title: 'Join me on DD Store',
        text: 'Use my referral link to join DD Store',
        url: referralInfo.telegram_deep_link,
      });
      toast.success('Referral link shared successfully');
      return true;
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(referralInfo.telegram_deep_link);
      toast.success('Referral link copied to clipboard');
      return true;
    }
  } catch (error) {
    console.error('Error sharing referral link:', error);
    
    // Try clipboard fallback if sharing fails
    try {
      await navigator.clipboard.writeText(referralInfo.telegram_deep_link);
      toast.success('Referral link copied to clipboard');
      return true;
    } catch (clipboardError) {
      toast.error('Failed to share referral link');
      return false;
    }
  }
};

/**
 * Register a referral when a user joins through a referral link
 * @param referralCode The referral code from the URL
 * @returns A promise that resolves to true if successful
 */
export const registerReferral = async (referralCode: string): Promise<boolean> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      // Don't show toast here as this might be called on initial page load
      return false;
    }
    
    console.log(`Registering referral for user ${user.id} with code ${referralCode}`);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('POST', {
      telegram_id: user.id,
      referral_code: referralCode
    });
    
    const response = await fetch(`${REFERRAL_API_PATH}/register`, options);
    clearTimeout();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      return false;
    }
    
    // Parse response
    const responseText = await response.text();
    const result = JSON.parse(responseText);
    
    console.log('Referral registration result:', result);
    return result.success;
  } catch (error) {
    console.error('Error registering referral:', error);
    return false;
  }
};

/**
 * Check if the current user has been referred by someone
 * @returns A promise that resolves to true if the user has been referred
 */
export const checkIfUserWasReferred = async (): Promise<boolean> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      return false;
    }
    
    console.log(`Checking if user ${user.id} was referred`);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('GET');
    
    const response = await fetch(`${REFERRAL_API_PATH}/was-referred/${user.id}`, options);
    clearTimeout();
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      return false;
    }
    
    // Parse response
    const responseText = await response.text();
    const result = JSON.parse(responseText);
    
    console.log('User referral check result:', result);
    return result.was_referred || false;
  } catch (error) {
    console.error('Error checking if user was referred:', error);
    return false;
  }
}; 