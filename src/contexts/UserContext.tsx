import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getRandomAvatarEmoji } from '../utils/emojiUtils';
import { checkUserProfile, UserProfile, TelegramUser } from '../services/api';
import { getTelegramUser as getTelegramUserFromAPI } from '../services/api';
import { getTelegramUser as getTelegramUserFromUtils } from '../utils/telegramUtils';
import { toast } from 'sonner';
import { cache } from '../services/api/config';
import { prefetchData, refreshUserData as refreshAllUserData } from '../services/api/optimizedService';

interface UserContextType {
  username: string;
  displayName: string;
  telegramUser: TelegramUser | null;
  profile: UserProfile | null;
  avatarEmoji: string;
  loading: boolean;
  setUsername: (username: string) => void;
  setAvatarEmoji: (emoji: string) => void;
  updateTelegramUser: (user: TelegramUser) => void;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [username, setUsername] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState(getRandomAvatarEmoji());
  const [loading, setLoading] = useState(true);
  const [initAttempted, setInitAttempted] = useState(false);

  // Function to update Telegram user data
  const updateTelegramUser = useCallback((user: TelegramUser) => {
    if (!user) return;
    
    console.log('Updating Telegram user data:', user);
    setTelegramUser(user);
    
    // Update username if it's available
    if (user.username) {
      setUsername(user.username);
    } else {
      // If no username, use ID as fallback
      setUsername(`user_${user.id}`);
    }
    
    // Update display name
    let fullName = user.first_name;
    if (user.last_name) {
      fullName += ` ${user.last_name}`;
    }
    setDisplayName(fullName);
    
    // Store user data in localStorage for recovery
    try {
      localStorage.setItem('telegramUser', JSON.stringify(user));
      // Remove the old key for consistency
      if (localStorage.getItem('telegramUserData')) {
        localStorage.removeItem('telegramUserData');
      }
    } catch (e) {
      console.warn('Failed to store user data in localStorage');
    }
    
    // Start prefetching data in the background
    const usernameToUse = user.username || `user_${user.id}`;
    prefetchData(usernameToUse, user.id)
      .then(() => {
        // Update profile after prefetch
        updateUserProfile(usernameToUse, user.id);
      })
      .catch(error => {
        console.error('Error during prefetch:', error);
        // Still try to update profile even if prefetch fails
        updateUserProfile(usernameToUse, user.id);
      });
  }, []);
  
  // Function to update user profile
  const updateUserProfile = useCallback(async (usernameToUse: string, userId: number) => {
    try {
      console.log('Checking user profile...');
      const userProfile = await checkUserProfile(usernameToUse, userId);
      console.log('User profile loaded');
      setProfile(userProfile);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      
      // Set a default profile
      const defaultProfile = {
        telegram_username: usernameToUse,
        rank: 1,
        total_orders: 0
      };
      console.log('Using default profile');
      setProfile(defaultProfile);
    }
  }, []);

  // Function to refresh user data
  const refreshUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (telegramUser) {
        const usernameToUse = telegramUser.username || `user_${telegramUser.id}`;
        await refreshAllUserData(usernameToUse, telegramUser.id);
        
        // Update profile after refresh
        await updateUserProfile(usernameToUse, telegramUser.id);
      } else {
        toast.error('No user data available for refresh');
      }
    } catch (error: any) {
      console.error('Error refreshing user data:', error);
      toast.error(`Error refreshing data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [telegramUser, updateUserProfile]);

  // Function to log raw Telegram data for debugging
  const logRawTelegramData = useCallback(() => {
    console.log('DEBUG - RAW TELEGRAM DATA:');
    
    // Log window.Telegram if available
    if (window.Telegram) {
      console.log('window.Telegram exists');
      
      if (window.Telegram.WebApp) {
        console.log('window.Telegram.WebApp exists');
        console.log('initData:', window.Telegram.WebApp.initData);
        
        if (window.Telegram.WebApp.initDataUnsafe) {
          console.log('initDataUnsafe contents:', JSON.stringify(window.Telegram.WebApp.initDataUnsafe || {}, null, 2));
          
          // Display raw user object if available
          if (window.Telegram.WebApp.initDataUnsafe.user) {
            const rawUser = window.Telegram.WebApp.initDataUnsafe.user;
            console.log('RAW USER OBJECT:', rawUser);
            return rawUser;
          } else {
            console.log('No user data in initDataUnsafe');
          }
        } else {
          console.log('No initDataUnsafe available');
        }
        
        // Try to parse initData if it exists
        if (window.Telegram.WebApp.initData) {
          try {
            const params = new URLSearchParams(window.Telegram.WebApp.initData);
            console.log('Parsed initData params:', Array.from(params.entries()));
            
            if (params.has('user')) {
              try {
                const userData = JSON.parse(decodeURIComponent(params.get('user') || '{}'));
                console.log('User data parsed from initData:', userData);
                return userData;
              } catch (e) {
                console.error('Error parsing user data from initData:', e);
              }
            } else {
              console.log('No user param in initData');
            }
          } catch (e) {
            console.error('Error parsing initData:', e);
          }
        } else {
          console.log('initData is empty');
        }
      } else {
        console.log('No WebApp in Telegram object');
      }
    } else {
      console.log('No Telegram object in window');
    }
    
    return null;
  }, []);

  // Initialize user data
  useEffect(() => {
    if (initAttempted) return;
    
    const initializeUserData = async () => {
      try {
        setLoading(true);
        setInitAttempted(true);
        
        console.log('Initializing user data...');
        
        // APPROACH 1: Try to get user data from Telegram WebApp
        // This is the recommended approach for Mini Apps
        const telegramUserData = getTelegramUserFromUtils();
        
        if (telegramUserData) {
          console.log('User data retrieved from Telegram WebApp:', telegramUserData);
          updateTelegramUser(telegramUserData);
          setLoading(false);
          return;
        }
        
        // APPROACH 2: Try to get user data from localStorage
        try {
          const storedUser = localStorage.getItem('telegramUser') || localStorage.getItem('telegramUserData');
          if (storedUser) {
            const userData = JSON.parse(storedUser) as TelegramUser;
            console.log('Using stored user data:', userData);
            updateTelegramUser(userData);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Failed to retrieve user data from localStorage');
        }
        
        // APPROACH 3: Try to get user data from API
        try {
          const apiUserData = await getTelegramUserFromAPI();
          if (apiUserData) {
            console.log('User data retrieved from API:', apiUserData);
            updateTelegramUser(apiUserData);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('Error getting user data from API:', apiError);
        }
        
        // If we reach here, we couldn't get user data
        console.log('No user data available, using default values');
        setUsername('guest');
        setDisplayName('Guest User');
        setLoading(false);
      } catch (error) {
        console.error('Error initializing user data:', error);
        setUsername('guest');
        setDisplayName('Guest User');
        setLoading(false);
      }
    };
    
    initializeUserData();
  }, [updateTelegramUser, initAttempted]);

  return (
    <UserContext.Provider value={{
      username,
      displayName,
      telegramUser,
      profile,
      avatarEmoji,
      loading,
      setUsername,
      setAvatarEmoji,
      updateTelegramUser,
      refreshUserData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
