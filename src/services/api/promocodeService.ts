import { API_BASE_URL, createFetchOptions } from './config';
import { getTelegramUser } from './userService';
import { toast } from 'sonner';

export interface Promocode {
  id: number;
  promocode_text: string;
  discount_fixed: number | null;
  discount_percent: string | null;
  usages_global: number;
  usages_per_user: number;
  valid_to_dttm: string;
}

export interface ValidatePromocodeResponse {
  success: boolean;
  message: string;
  promocode: Promocode | null;
}

export interface CreatePromocodeResponse {
  success: boolean;
  message: string;
  promocode: Promocode;
}

/**
 * Validate a promocode for the current user
 * @param promocodeText The promocode to validate
 * @returns A promise that resolves to the validation response
 */
export const validatePromocode = async (promocodeText: string): Promise<ValidatePromocodeResponse> => {
  try {
    const user = getTelegramUser();
    if (!user) {
      throw new Error('No Telegram user data available');
    }

    const { options, clearTimeout } = createFetchOptions('POST', {
      telegram_id: user.id,
      promocode_text: promocodeText
    });

    const response = await fetch(`${API_BASE_URL}/promocodes/validate`, options);
    clearTimeout();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to validate promocode');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error validating promocode:', error);
    throw error;
  }
};

/**
 * Calculate the final price after applying a promocode discount
 * @param originalPrice The original price before discount
 * @param promocode The promocode to apply
 * @returns The final price after discount
 */
export const calculateDiscountedPrice = (originalPrice: number, promocode: Promocode): number => {
  let finalPrice = originalPrice;
  
  // Apply fixed discount first
  if (promocode.discount_fixed > 0) {
    finalPrice = Math.max(0, finalPrice - promocode.discount_fixed);
  }
  
  // Then apply percentage discount if any
  if (promocode.discount_percent && promocode.discount_percent !== 'null') {
    const percentageDiscount = (finalPrice * parseFloat(promocode.discount_percent)) / 100;
    finalPrice = Math.max(0, finalPrice - percentageDiscount);
  }
  
  return Math.round(finalPrice); // Round to nearest integer
};

/**
 * Create a new promocode (admin only)
 * @param promocodeData The promocode data
 * @returns A promise that resolves to the created promocode
 */
export const createPromocode = async (promocodeData: {
  promocode_text: string;
  discount_fixed: number;
  usages_global: number;
  usages_per_user: number;
  valid_to_dttm: string;
  client_id?: number | null;
}): Promise<CreatePromocodeResponse> => {
  try {
    const { options, clearTimeout } = createFetchOptions('POST', promocodeData);

    const response = await fetch(`${API_BASE_URL}/promocodes/create`, options);
    clearTimeout();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create promocode');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating promocode:', error);
    throw error;
  }
}; 