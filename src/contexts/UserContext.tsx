import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRandomAvatarEmoji } from '../utils/emojiUtils';
import { getTelegramUser, checkUserProfile, UserProfile, TelegramUser } from '../services/api';
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

  useEffect(() => {
    const initUser = async () => {
      try {
        setLoading(true);
        
        const tgUser = getTelegramUser();
        console.log('Telegram user data:', tgUser);
        
        if (tgUser && tgUser.username) {
          setTelegramUser(tgUser);
          setUsername(tgUser.username);
          
          try {
            const userProfile = await checkUserProfile(tgUser.username, tgUser.id);
            console.log('User profile loaded:', userProfile);
            setProfile(userProfile);
          } catch (error: any) {
            console.error('Error fetching user profile:', error);
            toast.error(`Profile error: ${error.message}`);
          }
        } else {
          console.log('No Telegram username available, using default');
          setUsername('telegramUser');
          toast.info('Using demo user data - no Telegram user available');
        }
      } catch (error: any) {
        console.error('Error initializing user:', error);
        toast.error(`User initialization error: ${error.message}`);
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
