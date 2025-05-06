import { toast } from 'sonner';
import { API_BASE_URL, createFetchOptions } from './config';
import { UpdateClientInfoRequest, UpdateClientInfoResponse, ClientInfoResponse, ClientInfo } from './types';
import { getTelegramUser } from './userService';

/**
 * Get client information by Telegram ID
 * @param telegramId The Telegram user ID
 * @returns A promise that resolves to the client information
 */
export const getClientInfo = async (telegramId?: number): Promise<ClientInfo | null> => {
  try {
    // Get user data if not provided
    const user = getTelegramUser();
    const safeId = telegramId || (user ? user.id : null);
    
    if (!safeId) {
      console.error('No Telegram user ID available for client info');
      toast.error('User data not available');
      return null;
    }
    
    console.log(`Fetching client info for Telegram ID: ${safeId}`);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('GET');
    
    const response = await fetch(`${API_BASE_URL}/clients/by-telegram/${safeId}`, options);
    clearTimeout();
    
    if (!response.ok) {
      // If user is not found (404), we return null but don't show an error
      if (response.status === 404) {
        console.log('Client info not found (404)');
        return null;
      }
      
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      toast.error('Failed to fetch client information');
      return null;
    }
    
    // Parse response
    const responseText = await response.text();
    const clientInfo: ClientInfoResponse = JSON.parse(responseText);
    
    console.log('Client info fetched:', clientInfo);
    return clientInfo;
  } catch (error) {
    console.error('Error fetching client info:', error);
    toast.error('Failed to fetch client information');
    return null;
  }
};

/**
 * Update client information
 * @param phoneNumber Optional phone number to update
 * @param email Optional email to update
 * @param address Optional address to update
 * @returns A promise that resolves to true if successful
 */
export const updateClientInfo = async (
  phoneNumber?: string,
  email?: string,
  address?: string
): Promise<boolean> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      toast.error('User data not available');
      return false;
    }
    
    console.log(`Updating client info for Telegram ID: ${user.id}`);
    
    // Prepare the request body
    const requestBody: UpdateClientInfoRequest = {
      telegram_id: user.id
    };
    
    // Add optional fields if provided
    if (phoneNumber) requestBody.phone_number = phoneNumber;
    if (email) requestBody.email = email;
    if (address) requestBody.address = address;
    
    console.log('Update client info request:', requestBody);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('POST', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/clients/update-info`, options);
    clearTimeout();
    
    // Just check the status code for success (200-299 range)
    if (response.ok) {
      console.log(`Client info update successful with status: ${response.status}`);
      // toast.success('Client information updated successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      // toast.error('Failed to update client information');
      return false;
    }
  } catch (error) {
    console.error('Error updating client info:', error);
    // toast.error('Failed to update client information');
    return false;
  }
};

/**
 * Check if client has all required information
 * @returns A promise that resolves to true if all required information is present
 */
export const checkClientInformation = async (): Promise<boolean> => {
  try {
    // Get user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No Telegram user data available');
      toast.error('User data not available');
      return false;
    }
    
    // Get client info
    const clientInfo = await getClientInfo(user.id);
    if (!clientInfo) {
      toast.error('Please provide your contact information before creating an order');
      return false;
    }
    
    // Check required fields
    if (!clientInfo.phone_number || !clientInfo.email || !clientInfo.address) {
      toast.error('Please provide your contact information before creating an order');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking client information:', error);
    // toast.error('Failed to check client information');
    return false;
  }
}; 