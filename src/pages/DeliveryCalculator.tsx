import React, { useState, useEffect } from 'react';
import { Calculator, ExternalLink, Truck, Plane, Loader2, ShoppingBag } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { hapticSelection, openTelegramUrl } from '@/utils/telegramUtils';
import { calculateShipping } from '@/services/api/orderService';
import { fetchCategories } from '@/services/api/productService';
import { Category } from '@/services/api/types';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

// Constants for fallback calculation if API fails
const CNY_USD_RATE = 0.14;
const USD_RUB_RATE = 90;
const COMMISSION_COEFFICIENT = 1700;

// Shipping type coefficients
const SHIPPING_TYPE_COEFFICIENTS = {
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
  const { addPreorderToCart } = useCart();
  
  // State for form inputs
  const [price, setPrice] = useState<string>('');
  const [itemType, setItemType] = useState<string>('');
  const [shippingType, setShippingType] = useState<string>('car');
  const [itemUrl, setItemUrl] = useState<string>('');
  const [size, setSize] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  
  // State for validation
  const [priceError, setPriceError] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  
  // State for calculation result
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  
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
  
  // Calculate price using the API with explicit button click
  const handleCalculate = async () => {
    if (!price || priceError) {
      toast.error('Введите корректную цену для расчёта');
      return;
    }
    
    if (!itemType) {
      toast.error('Выберите категорию товара');
      return;
    }
    
    // Map internal item type to API category_type
    const apiCategoryType = mapToCategoryType(itemType);
    if (!apiCategoryType) {
      toast.error('Неверный тип категории');
      return;
    }
    
    setIsCalculating(true);
    
    try {
      const priceInCNY = parseInt(price);
      
      // Call the API to calculate the shipping cost
      const shippingCost = await calculateShipping(priceInCNY, shippingType, apiCategoryType);
      
      // Set the total price from the API response
      setTotalPrice(shippingCost);
    } catch (error: any) {
      console.error('Error calculating shipping:', error);
      toast.error(`Ошибка расчёта доставки: ${error.message}`);
      setTotalPrice(null);
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Simplified version that just lowercases the category
  const mapToCategoryType = (internalCategory: string): string => {
    return internalCategory.toLowerCase();
  };
  
  // Validate price input
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers
    if (value && !/^\d+$/.test(value)) {
      setPriceError('Введите только цифры');
      setPrice(value);
      return;
    }
    
    // Check if price is within allowed range
    const numValue = parseInt(value);
    if (value && (numValue <= 0 || numValue >= 1000000)) {
      setPriceError('Цена должна быть от 1 до 999,999 юаней');
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
      setUrlError('Введите корректную ссылку');
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
  
  // Handle shipping type selection
  const handleShippingTypeChange = (type: string) => {
    hapticSelection();
    setShippingType(type);
    // Reset total price when input changes
    setTotalPrice(null);
  };
  
  const handleAddToCart = async () => {
    if (!itemUrl) {
      toast.error('Введите ссылку на товар');
      return;
    }
    
    if (urlError) {
      toast.error('Введите корректную ссылку на товар');
      return;
    }
    
    if (!totalPrice) {
      toast.error('Сначала рассчитайте стоимость');
      return;
    }
    
    // Map internal item type to API category_type
    const apiCategoryType = mapToCategoryType(itemType);
    if (!apiCategoryType) {
      toast.error('Неверный тип категории');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      // Parse the price from the input
      const priceInCNY = price ? parseInt(price) : 0;
      
      // Convert shipping type to the API expected format
      const apiShippingType = shippingType === 'car' ? 'cargo' : 'aero';
      
      // Add the preorder item to cart
      addPreorderToCart({
        dewu_url: itemUrl,
        size: size || 'Не указан', 
        category_type: apiCategoryType,
        shipping_type: apiShippingType,
        price: totalPrice,
        price_cny: priceInCNY, // Include the price in CNY
        name: `Предзаказ - ${apiCategoryType === 'обувь' ? 'Обувь' : 
              apiCategoryType === 'одежда' ? 'Одежда' : 
              apiCategoryType === 'аксессуары' ? 'Аксессуары' : 
              itemType} - ${size || 'Размер не указан'}`
      });
      
      toast.success('Предзаказ добавлен в корзину');
      
      // Clear form after adding to cart
      setItemUrl('');
      setSize('');
      setTotalPrice(null);
    } catch (error: any) {
      console.error('Error adding preorder to cart:', error);
      toast.error('Ошибка при добавлении предзаказа в корзину');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <PageLayout>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Calculator className="mr-2 text-telegram-blue" size={24} />
          <h1 className="text-2xl font-semibold">Калькулятор доставки</h1>
        </div>
        
        <div className="space-y-6">
          {/* Price Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Цена товара (юани)
            </label>
            <input
              type="text"
              value={price}
              onChange={handlePriceChange}
              placeholder="Введите цену в юанях"
              className={`w-full p-3 rounded-lg border ${priceError ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-sidebar-accent`}
            />
            {priceError && (
              <p className="text-red-500 text-sm">{priceError}</p>
            )}
            <div className="flex items-center text-xs text-telegram-hint">
              <button 
                onClick={() => openTelegramUrl("https://telegra.ph/Poisk-i-kartochka-tovara-ceny-razmernaya-setka-i-sroki-dostavki-04-11")}
                className="flex items-center text-telegram-link"
              >
                Как проверить цену? <ExternalLink size={12} className="ml-1" />
              </button>
            </div>
          </div>
          
          {/* Item Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Категория товара
            </label>
            <select
              value={itemType}
              onChange={handleItemTypeChange}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-sidebar-accent"
              disabled={isLoadingCategories}
            >
              {isLoadingCategories ? (
                <option value="">Загрузка категорий...</option>
              ) : categories.length === 0 ? (
                <option value="">Нет доступных категорий</option>
              ) : (
                categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {formatCategoryName(category.name)}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {/* Shipping Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Тип доставки
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleShippingTypeChange('car')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                  shippingType === 'car' 
                    ? 'bg-telegram-blue text-white' 
                    : 'bg-white dark:bg-sidebar-accent border border-gray-300 dark:border-gray-700'
                }`}
              >
                <Truck size={24} className="mb-2" />
                <span className="font-medium">Автомобиль</span>
                <span className="text-xs mt-1 opacity-80">21-35 дней</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleShippingTypeChange('plane')}
                className={`p-3 rounded-lg flex flex-col items-center justify-center ${
                  shippingType === 'plane' 
                    ? 'bg-telegram-blue text-white' 
                    : 'bg-white dark:bg-sidebar-accent border border-gray-300 dark:border-gray-700'
                }`}
              >
                <Plane size={24} className="mb-2" />
                <span className="font-medium">Самолет</span>
                <span className="text-xs mt-1 opacity-80">5-10 дней</span>
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
                Идет расчет...
              </>
            ) : (
              'Рассчитать стоимость доставки'
            )}
          </button>
          
          {/* Calculation Result */}
          {totalPrice !== null && (
            <div className="mt-8 p-4 bg-telegram-secondary-bg rounded-lg">
              <h2 className="text-lg font-medium mb-2">Предварительная стоимость</h2>
              <div className="flex justify-between items-center">
                <span>Итоговая цена:</span>
                <span className="text-2xl font-bold text-telegram-blue">
                  ₽{totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="mt-4 text-xs text-telegram-hint">
                <p>Включает стоимость товара, доставки и комиссии</p>
              </div>
            </div>
          )}
          
          {/* Item URL Input (Required) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Ссылка на товар <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={itemUrl}
              onChange={handleUrlChange}
              placeholder="Вставьте ссылку Poizon (DEWU)"
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
                Как получить ссылку? <ExternalLink size={12} className="ml-1" />
              </a>
            </div>
          </div>
          
          {/* Size Input (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Размер (Необязательно)
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="например, 42, XL и т.д."
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-sidebar-accent"
            />
          </div>
          
          {/* Add to Cart Button */}
          {totalPrice !== null && (
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !itemUrl || !!urlError}
              className="w-full mt-4 bg-telegram-blue text-white py-3 rounded-lg font-medium hover:bg-telegram-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Добавление в корзину...
                </>
              ) : (
                <>
                  <ShoppingBag size={20} />
                  Добавить в корзину
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DeliveryCalculator; 