
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRandomAvatarEmoji } from '../utils/emojiUtils';
import { getTelegramUser } from '../services/api';
import { checkUserProfile, UserProfile, TelegramUser } from '../services/api';
import { toast } from 'sonner';

interface UserContextType {
  username: string;
  telegramUser: TelegramUser | null;
  profile: UserProfile | null;
  avatarEmoji: string;
  loading: boolean;
  setUsername: (username: string) => void;
  setAvatarEmoji: (emoji: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [username, setUsername] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarEmoji, setAvatarEmoji] = useState(getRandomAvatarEmoji());
  const [loading, setLoading] = useState(true);

  // Initialize with Telegram user data or defaults
  useEffect(() => {
    const initUser = async () => {
      try {
        setLoading(true);
        
        // Try to get Telegram user data
        const tgUser = getTelegramUser();
        console.log('Telegram user data:', tgUser);
        
        if (tgUser && tgUser.username) {
          setTelegramUser(tgUser);
          setUsername(tgUser.username);
          
          // Fetch user profile from API
          try {
            const userProfile = await checkUserProfile(tgUser.username, tgUser.id);
            setProfile(userProfile);
            console.log('User profile loaded:', userProfile);
          } catch (error: any) {
            console.error('Error fetching user profile:', error);
            toast.error(`Could not fetch user profile: ${error.message}`);
          }
        } else {
          // Default values for development/testing
          console.log('No Telegram username available, using default');
          setUsername('telegramUser');
          toast.info('Using demo user data - no Telegram user available');
        }
      } catch (error: any) {
        console.error('Error initializing user:', error);
        toast.error(`Error initializing user: ${error.message}`);
        setUsername('telegramUser');
      } finally {
        setLoading(false);
      }
    };
    
    initUser();
  }, []);

  return (
    <UserContext.Provider value={{
      username,
      telegramUser,
      profile,
      avatarEmoji,
      loading,
      setUsername,
      setAvatarEmoji
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
