import { useState, useEffect } from 'react';
import type { TelegramUser } from '@/types/telegram.d';

export const useTelegramUser = () => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Get Telegram user data from window.Telegram.WebApp
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (user) {
      setTelegramUser(user);
    }
  }, []);

  return { telegramUser };
}; 