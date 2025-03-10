
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRandomAvatarEmoji } from '../utils/emojiUtils';
import { getTelegramUser } from '../utils/telegramUtils';
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
        // Try to get Telegram user data
        const tgUser = getTelegramUser();
        
        if (tgUser && tgUser.username) {
          setTelegramUser(tgUser);
          setUsername(tgUser.username);
          
          // Fetch user profile from API
          try {
            const userProfile = await checkUserProfile(tgUser.username, tgUser.id);
            setProfile(userProfile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            toast.error('Could not fetch user profile. Using default data.');
          }
        } else {
          // Default values for development/testing
          setUsername('telegramUser');
        }
      } catch (error) {
        console.error('Error initializing user:', error);
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
