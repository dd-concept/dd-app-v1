import { useState, useEffect } from 'react';
import { checkUserExists } from '@/services/api';
import { getTelegramUser } from '@/services/api/userService';
import { toast } from 'sonner';

interface UseRegistrationOptions {
  onNewUser?: (isNew: boolean) => void;
}

interface ApiResponse {
  status?: string;
  message?: string;
}

/**
 * Add DD coins to the user's account
 * @param userId The user's Telegram ID
 * @param reasonCode The reason code for adding DD coins
 * @returns A promise that resolves when the DD coins have been added
 */
const addDDCoinsWelcomeBonus = async (userId: number): Promise<boolean> => {
  try {
    const response = await fetch('https://v2786182.hosted-by-vdsina.ru/api/v1/users/dd-coins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_user_id: userId,
        reason_code: 'WELCOME'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error adding DD coins: ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log('DD coins added successfully:', data);
    return true;
  } catch (error) {
    console.error('Error adding DD coins:', error);
    return false;
  }
};

/**
 * Show a welcome bonus notification in the center of the screen
 */
const showWelcomeBonusNotification = () => {
  // Delay showing the notification
  setTimeout(() => {
    // Create and append the notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black text-white p-6 rounded-lg shadow-lg z-50 w-80 text-center';
    notification.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="text-yellow-400 text-xl mb-2">🎁 Welcome Bonus!</div>
        <div class="text-lg font-bold mb-2">500 DD Coins Added</div>
        <div class="text-sm">Your welcome bonus has been added to your account.</div>
      </div>
    `;
    document.body.appendChild(notification);

    // Remove the notification after 4 seconds
    setTimeout(() => {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-500');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 4000);
  }, 1500); // Delay showing the notification by 1.5 seconds
};

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
        const checkResponse = await checkUserExists(true); // Return full response
        console.log('User check response:', checkResponse);
        
        // Handle different response statuses
        if (checkResponse && typeof checkResponse === 'object') {
          const response = checkResponse as ApiResponse;
          
          // Handle new user case
          if (response.status === 'created') {
            console.log('New user created');
            setIsNewUser(true);
            
            // Call the onNewUser callback if provided
            if (options?.onNewUser) {
              options.onNewUser(true);
            }
            
            // Add welcome bonus for new users
            const bonusAdded = await addDDCoinsWelcomeBonus(user.id);
            if (bonusAdded) {
              toast.success('Welcome! 500 DD coins have been added to your account as a welcome bonus!', {
                duration: 6000,
                position: 'top-center',
              });
              showWelcomeBonusNotification();
            }
          }
          // Handle updated user case
          else if (response.status === 'updated') {
            console.log('User updated');
            
            // Add welcome bonus for updated users too
            const bonusAdded = await addDDCoinsWelcomeBonus(user.id);
            if (bonusAdded) {
              toast.success('Welcome back! 500 DD coins have been added to your account!', {
                duration: 6000,
                position: 'top-center',
              });
              showWelcomeBonusNotification();
            }
          } else {
            setIsNewUser(false);
          }
        } else if (checkResponse === false) {
          // Handle new user (backward compatibility)
          console.log('New user detected (boolean response)');
          setIsNewUser(true);
          
          // Call the onNewUser callback if provided
          if (options?.onNewUser) {
            options.onNewUser(true);
          }
          
          // Add welcome bonus for new users
          const bonusAdded = await addDDCoinsWelcomeBonus(user.id);
          if (bonusAdded) {
            toast.success('Welcome! 500 DD coins have been added to your account as a welcome bonus!', {
              duration: 6000,
              position: 'top-center',
            });
            showWelcomeBonusNotification();
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