import React, { useState, useEffect } from 'react';
import { Calculator, ExternalLink, Truck, Plane, Loader2, Coins } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { hapticSelection } from '@/utils/telegramUtils';
import { createPreorder, calculateDelivery } from '@/services/api/orderService';
import { fetchCategories } from '@/services/api/productService';
import { getClientInfo } from '@/services/api/clientService';
import { Category, DeliveryRate } from '@/services/api/types';
import { toast } from 'sonner';
import ClientInfoForm from '@/components/ClientInfoForm';
import PromocodeInput from '@/components/PromocodeInput';
import { Promocode } from '@/services/api/promocodeService';
import { useTelegramUser } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { getDDCoinsBalance } from '@/services/api/userService';

// Constants for fallback calculation if API fails
const CNY_USD_RATE = 0.14;
const USD_RUB_RATE = 90;
const COMMISSION_COEFFICIENT = 1700;

// Delivery type coefficients
const DELIVERY_TYPE_COEFFICIENTS = {
  car: 7,
  plane: 15
};

// Helper function to capitalize first letter of each word
const formatCategoryName = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const DeliveryCalculator: React.FC = () => {
  const { telegramUser } = useTelegramUser();
  const navigate = useNavigate();
  // State for form inputs
  const [price, setPrice] = useState<string>('');
  const [itemType, setItemType] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<string>('car');
  const [itemUrl, setItemUrl] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isCheckingClientInfo, setIsCheckingClientInfo] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [showClientInfoForm, setShowClientInfoForm] = useState<boolean>(false);
  const [clientInfo, setClientInfo] = useState<{email?: string, phone?: string, address?: string} | null>(null);
  
  // State for validation
  const [priceError, setPriceError] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  
  // State for calculation result
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [currentPromocode, setCurrentPromocode] = useState<Promocode | undefined>();
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [ddCoinsBalance, setDDCoinsBalance] = useState<number>(0);
  const [ddCoinsToUse, setDDCoinsToUse] = useState<number>(0);
  const [isLoadingDDCoins, setIsLoadingDDCoins] = useState<boolean>(false);
  const [selectedDeliveryRate, setSelectedDeliveryRate] = useState<DeliveryRate | null>(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
        
        // Set default item type to the first category if available
        if (fetchedCategories.length > 0) {
          setItemType(fetchedCategories[0].name);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load item categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, []);
  
  // Fetch DD coins balance on component mount
  useEffect(() => {
    const loadDDCoinsBalance = async () => {
      if (!telegramUser) return;
      
      setIsLoadingDDCoins(true);
      try {
        const balance = await getDDCoinsBalance();
        setDDCoinsBalance(balance);
        
        // Reset DD coins to use if balance has changed
        setDDCoinsToUse(0);
      } catch (error) {
        console.error('Failed to load DD coins balance:', error);
      } finally {
        setIsLoadingDDCoins(false);
      }
    };
    
    loadDDCoinsBalance();
  }, [telegramUser]);
  
  // Function to check required client information
  const checkClientInformation = async (): Promise<boolean> => {
    setIsCheckingClientInfo(true);
    try {
      const info = await getClientInfo();
      
      // If we have client info and all required fields are present
      if (info && info.email && info.phone_number && info.address) {
        setClientInfo({
          email: info.email,
          phone: info.phone_number,
          address: info.address
        });
        return true;
      }
      
      // If client info is missing or incomplete, store what we have
      setClientInfo({
        email: info?.email || '',
        phone: info?.phone_number || '',
        address: info?.address || ''
      });
      
      // Show the form to collect missing info
      setShowClientInfoForm(true);
      return false;
    } catch (error) {
      console.error('Error checking client information:', error);
      return false;
    } finally {
      setIsCheckingClientInfo(false);
    }
  };
  
  // Calculate price using the API with explicit button click
  const handleCalculate = async () => {
    if (!price || priceError) {
      toast.error('Please enter a valid price to calculate');
      return;
    }
    
    if (!itemType) {
      toast.error('Please select an item category');
      return;
    }
    
    setIsCalculating(true);
    
    try {
      const priceInCNY = parseInt(price);
      
      // Call the API to calculate the delivery cost
      const deliveryCost = await calculateDelivery(priceInCNY, deliveryType, itemType);
      
      // Set the total price from the API response
      setTotalPrice(deliveryCost);
    } catch (error: any) {
      console.error('Error calculating delivery:', error);
      toast.error(`Failed to calculate delivery: ${error.message}`);
      setTotalPrice(null);
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Validate price input
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) {
      setPriceError('Please enter only numbers');
      setPrice(value);
      return;
    }
    
    // Check if price is within allowed range
    const numValue = parseInt(value);
    if (value && (numValue <= 0 || numValue >= 1000000)) {
      setPriceError('Price must be between 1 and 999,999 CNY');
    } else {
      setPriceError('');
    }
    
    setPrice(value);
  };
  
  // Validate URL input and extract clean URL if needed
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Extract the URL if there's pasted text with additional content
    const extractedUrl = extractDewuUrl(value);
    const cleanUrl = extractedUrl || value;
    
    if (cleanUrl && !isValidUrl(cleanUrl)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError('');
    }
    
    // If we extracted a URL, use that instead of the original input
    setItemUrl(extractedUrl || value);
  };
  
  // Extract DEWU URL from pasted text
  const extractDewuUrl = (text: string): string | null => {
    // Common DEWU URL patterns
    const urlPatterns = [
      /https?:\/\/dw4\.co\/[^\s]+/i,
      /https?:\/\/m\.dewu\.com\/[^\s]+/i,
      /https?:\/\/www\.dewu\.com\/[^\s]+/i,
      /https?:\/\/dewu\.com\/[^\s]+/i
    ];
    
    // Try each pattern until we find a match
    for (const pattern of urlPatterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        console.log('Extracted DEWU URL:', match[0]);
        return match[0];
      }
    }
    
    return null;
  };
  
  // Check if string is a valid URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Handle item type selection
  const handleItemTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    hapticSelection();
    setItemType(e.target.value);
    // Reset total price when input changes
    setTotalPrice(null);
  };
  
  // Handle delivery type selection
  const handleDeliveryTypeChange = (type: string) => {
    hapticSelection();
    setDeliveryType(type);
    // Reset total price when input changes
    setTotalPrice(null);
  };
  
  // Calculate the maximum amount of DD coins that can be used (50% of final price)
  const maxDDCoinsToUse = Math.min(
    ddCoinsBalance,
    Math.floor(finalPrice * 0.5)
  );
  
  // Calculate the final price after DD coins
  const finalPriceAfterDDCoins = finalPrice - ddCoinsToUse;
  
  // Handle DD coins slider change
  const handleDDCoinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setDDCoinsToUse(value);
  };
  
  // Calculate final price whenever price or promocode changes
  useEffect(() => {
    if (totalPrice) {
      let discountedPrice = totalPrice;
      if (currentPromocode) {
        // Apply fixed discount first (only once for the whole order)
        if (currentPromocode.discount_fixed) {
          discountedPrice = Math.max(0, discountedPrice - currentPromocode.discount_fixed);
        }
        // Then apply percentage discount
        if (currentPromocode.discount_percent && currentPromocode.discount_percent !== 'null') {
          const percentageDiscount = (discountedPrice * parseFloat(currentPromocode.discount_percent)) / 100;
          discountedPrice = Math.max(0, discountedPrice - percentageDiscount);
        }
      }
      
      // Add delivery price if a delivery rate is selected
      if (selectedDeliveryRate) {
        discountedPrice += selectedDeliveryRate.price_rub;
      }
      
      setFinalPrice(Math.round(discountedPrice));
    }
  }, [totalPrice, currentPromocode, selectedDeliveryRate]);

  const handlePromocodeApplied = (promocode: Promocode, discountedPrice: number) => {
    setCurrentPromocode(promocode);
    setFinalPrice(Math.round(discountedPrice));
  };

  const handlePromocodeRemoved = () => {
    setCurrentPromocode(undefined);
    setFinalPrice(totalPrice || 0);
  };
  
  // Handle create order button click
  const handleCreateOrder = async () => {
    if (!telegramUser) {
      toast.error('Please log in to create an order');
      return;
    }

    try {
      // Get client information and show form to review/update
      const clientInfo = await getClientInfo();
      setClientInfo({
        email: clientInfo?.email || '',
        phone: clientInfo?.phone_number || '',
        address: clientInfo?.address || ''
      });
      setShowClientInfoForm(true);
    } catch (error) {
      console.error('Error checking client information:', error);
      toast.error('Failed to check client information');
    }
  };
  
  // Handle client info form completion
  const handleClientInfoComplete = (deliveryRate?: DeliveryRate) => {
    setShowClientInfoForm(false);
    if (deliveryRate) {
      setSelectedDeliveryRate(deliveryRate);
    }
    createPreorderWithInfo();
  };

  // Separate function to create preorder after client info is confirmed
  const createPreorderWithInfo = async () => {
    try {
      const orderData = {
        telegram_user_id: telegramUser!.id,
        delivery_method: selectedDeliveryRate?.delivery_type || 'self_pickup',
        delivery_address: clientInfo?.address || '',
        promocode_text: currentPromocode?.promocode_text,
        dd_coins_amount: ddCoinsToUse,
        preorder_item: {
          dewu_url: itemUrl,
          size: size,
          price_cny: price ? parseInt(price) : 0,
          category_type: itemType,
          delivery_type: deliveryType === 'car' ? 'cargo' : 'aero', // Convert to API format
          sale_price: totalPrice || 0
        }
      };

      console.log('Creating preorder with data:', JSON.stringify(orderData));
      
      const response = await createPreorder(orderData);
      if (response.success) {
        toast.success('Preorder created successfully!');
        navigate('/orders');
      } else {
        toast.error(response.message || 'Failed to create preorder');
      }
    } catch (error) {
      console.error('Error creating preorder:', error);
      toast.error('Failed to create preorder');
    }
  };
  
  return (
    <PageLayout>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Calculator className="mr-2 text-telegram-blue" size={24} />
          <h1 className="text-2xl font-semibold">Delivery Calculator</h1>
        </div>
        
        <div className="space-y-6">
          {/* Price Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Item Price (CNY)
            </label>
            <input
              type="text"
              value={price}
              onChange={handlePriceChange}
              placeholder="Enter price in CNY"
              className={`w-full p-3 rounded-lg border ${priceError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-sidebar-accent`}
            />
            {priceError && (
              <p className="text-red-500 text-sm">{priceError}</p>
            )}
            <div className="flex items-center text-xs text-telegram-hint">
              <a 
                href="https://teletype.in/@poizonshop/link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-telegram-link"
              >
                How to check price? <ExternalLink size={12} className="ml-1" />
              </a>
            </div>
          </div>
          
          {/* Item Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Item Category
            </label>
            <select
              value={itemType}
              onChange={handleItemTypeChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-sidebar-accent"
              disabled={isLoadingCategories}
            >
              {isLoadingCategories ? (
                <option value="">Loading categories...</option>
              ) : categories.length === 0 ? (
                <option value="">No categories available</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {formatCategoryName(category.name)}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {/* Delivery Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Delivery Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('car')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                  deliveryType === 'car' 
                    ? 'bg-telegram-blue text-white' 
                    : 'bg-white dark:bg-sidebar-accent border border-gray-300 dark:border-gray-700'
                }`}
              >
                <Truck size={24} className="mb-2" />
                <span className="font-medium">By Car</span>
                <span className="text-xs mt-1 opacity-80">21-35 Days</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('plane')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                  deliveryType === 'plane' 
                    ? 'bg-telegram-blue text-white' 
                    : 'bg-white dark:bg-sidebar-accent border border-gray-300 dark:border-gray-700'
                }`}
              >
                <Plane size={24} className="mb-2" />
                <span className="font-medium">By Plane</span>
                <span className="text-xs mt-1 opacity-80">5-10 Days</span>
              </button>
            </div>
          </div>
          
          {/* Calculate Button */}
          <button
            type="button"
            onClick={handleCalculate}
            disabled={isCalculating || !price || !!priceError || !itemType}
            className="w-full bg-green-600 text-white p-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <>
                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate Delivery Cost'
            )}
          </button>
          
          {/* Calculation Result */}
          {totalPrice !== null && (
            <div className="mt-8 p-4 bg-telegram-secondary-bg rounded-lg">
              <h2 className="text-lg font-medium mb-2">Estimated Total</h2>
              <div className="flex justify-between items-center">
                <span>Final Price:</span>
                <span className="text-2xl font-bold text-telegram-blue">
                  ₽{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 text-xs text-telegram-hint">
                <p>Includes item price, delivery, and commission fees</p>
              </div>
            </div>
          )}
          
          {/* Item URL Input (Required) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Item URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={itemUrl}
              onChange={handleUrlChange}
              placeholder="Paste Poizon (DEWU) URL"
              className={`w-full p-3 rounded-lg border ${urlError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-sidebar-accent`}
            />
            {urlError && (
              <p className="text-red-500 text-sm">{urlError}</p>
            )}
            <div className="flex items-center text-xs text-telegram-hint">
              <a 
                href="https://teletype.in/@poizonshop/link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-telegram-link"
              >
                How to get the URL? <ExternalLink size={12} className="ml-1" />
              </a>
            </div>
          </div>
          
          {/* Size Input (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Size (Optional)
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="e.g. 42, XL, etc."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-sidebar-accent"
            />
          </div>
          
          {/* Promocode Input */}
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 shadow-sm mb-6">
            <h3 className="text-sm font-medium mb-2">Have a promocode?</h3>
            <PromocodeInput
              originalPrice={totalPrice || 0}
              onPromocodeApplied={handlePromocodeApplied}
              onPromocodeRemoved={handlePromocodeRemoved}
              currentPromocode={currentPromocode}
            />
          </div>
          
          {/* Order Summary */}
          <div className="bg-white dark:bg-sidebar-accent rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>₽{totalPrice?.toLocaleString() || 0}</span>
              </div>
              {selectedDeliveryRate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery ({selectedDeliveryRate.delivery_type === 'self_pickup' 
                      ? 'Self Pickup' 
                      : selectedDeliveryRate.delivery_type === 'courier'
                        ? 'Courier'
                        : 'Shipping'})
                  </span>
                  <span>
                    {selectedDeliveryRate.price_rub > 0 
                      ? `₽${selectedDeliveryRate.price_rub.toLocaleString()}`
                      : 'Free'}
                  </span>
                </div>
              )}
              {currentPromocode && (
                <div className="flex justify-between text-telegram-blue">
                  <span>
                    Promocode: {currentPromocode.promocode_text}
                  </span>
                  <span>
                    {currentPromocode.discount_fixed ? 
                      `-₽${currentPromocode.discount_fixed}` : 
                      (currentPromocode.discount_percent && currentPromocode.discount_percent !== 'null') ? 
                        `-${currentPromocode.discount_percent}%` : 
                        ''
                    }
                  </span>
                </div>
              )}
              
              {/* DD Coins Section */}
              {ddCoinsBalance > 0 && finalPrice > 0 && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1">
                      <Coins size={16} className="text-yellow-500" />
                      <span className="font-medium">DD Coins</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Balance: {ddCoinsBalance}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Use DD Coins for payment</span>
                      <span className="text-telegram-blue">{ddCoinsToUse} coins (-₽{ddCoinsToUse})</span>
                    </div>
                    
                    <input
                      type="range"
                      min="0"
                      max={maxDDCoinsToUse}
                      value={ddCoinsToUse}
                      onChange={handleDDCoinsChange}
                      className="w-full"
                      disabled={maxDDCoinsToUse <= 0}
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0</span>
                      <span>Max: {maxDDCoinsToUse} coins (50% of total)</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span>₽{finalPriceAfterDDCoins.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={!totalPrice || isSubmitting}
              className="w-full mt-4 bg-telegram-blue text-white py-3 rounded-lg font-medium hover:bg-telegram-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Order...' : 'Create Preorder'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Client Info Form */}
      {showClientInfoForm && clientInfo && (
        <ClientInfoForm
          initialEmail={clientInfo.email}
          initialPhone={clientInfo.phone}
          initialAddress={clientInfo.address}
          onComplete={handleClientInfoComplete}
          onCancel={() => setShowClientInfoForm(false)}
        />
      )}
    </PageLayout>
  );
};

export default DeliveryCalculator; 