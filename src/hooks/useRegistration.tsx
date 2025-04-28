import { useState, useEffect } from 'react';
import { checkUserExists } from '@/services/api';
import { getTelegramUser } from '@/services/api/userService';
import { UserExistsResponse } from '@/services/api/types';

interface UseRegistrationOptions {
  onNewUser?: (isNew: boolean) => void;
}

/**
 * Hook to handle user registration status and processing
 */
export const useRegistration = (options?: UseRegistrationOptions) => {
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  
  useEffect(() => {
    const checkUserRegistration = async () => {
      if (hasChecked || isChecking) return;
      
      setIsChecking(true);
      
      try {
        // Get the Telegram user
        const user = getTelegramUser();
        if (!user) {
          console.log('No Telegram user available, cannot check registration status');
          setIsChecking(false);
          return;
        }
        
        // Check if user exists in the API
        const checkResponse = await checkUserExists(true);
        console.log('User check response:', checkResponse);
        
        // Handle response object
        if (checkResponse && typeof checkResponse !== 'boolean') {
          const response = checkResponse as UserExistsResponse;
          
          // The is_new_client field tells us if this is a new user
          setIsNewUser(response.is_new_client);
          
          // Call the onNewUser callback if provided and this is a new user
          if (response.is_new_client && options?.onNewUser) {
            options.onNewUser(true);
          }
        } else {
          setIsNewUser(false);
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('Error checking user registration:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkUserRegistration();
  }, [hasChecked, isChecking, options]);
  
  return {
    isNewUser,
    isChecking,
    hasChecked
  };
};

export default useRegistration; 