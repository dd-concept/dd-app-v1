
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getRandomAvatarEmoji } from '../utils/emojiUtils';

interface UserContextType {
  username: string;
  email: string;
  avatarEmoji: string;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setAvatarEmoji: (emoji: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Default values - in a real app, these might come from authentication
  const [username, setUsername] = useState('telegramUser');
  const [email, setEmail] = useState('user@telegram.com');
  const [avatarEmoji, setAvatarEmoji] = useState(getRandomAvatarEmoji());

  return (
    <UserContext.Provider value={{
      username,
      email,
      avatarEmoji,
      setUsername,
      setEmail,
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
