// Import the context hook instead of duplicating functionality
import { useTelegram as useTelegramContext } from '../contexts/TelegramContext';

/**
 * Hook to access Telegram WebApp functionality
 * This is a wrapper around the TelegramContext for backward compatibility
 */
export function useTelegram() {
  return useTelegramContext();
} 