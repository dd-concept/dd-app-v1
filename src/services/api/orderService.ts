import { toast } from 'sonner';
import { API_BASE_URL, TIMEOUTS, handleApiError, cache, CACHE_CONFIG, createFetchOptions } from './config';
import { Order, CartItem, OrdersRequest, OrdersResponse, OrderStockRequest, OrderStockResponse, PreorderRequest, PreorderResponse, StockOrderItem } from './types';
import { MOCK_ORDERS } from './mockData';
import { getTelegramUser } from './userService';

// Cache keys
const CACHE_KEYS = {
  ORDERS: (userId: number) => `orders_${userId}`
};

// Fetch orders for the current user with fallback to mock data and caching
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    // Get the current user
    const user = getTelegramUser();
    if (!user || !user.id) {
      console.error('No user data available when fetching orders');
      return []; // Return empty array instead of mock data
    }
    
    console.log(`Fetching orders for user ID: ${user.id}...`);
    
    // Check cache first
    const cacheKey = CACHE_KEYS.ORDERS(user.id);
    const cachedOrders = cache.get<Order[]>(cacheKey, CACHE_CONFIG.ORDERS_TTL);
    if (cachedOrders) {
      console.log('Using cached orders data');
      return cachedOrders;
    }
    
    console.log('No cached orders, fetching from API...');
    
    // Prepare the request
    const requestBody: OrdersRequest = {
      telegram_user_id: user.id
    };
    
    // Make the API call with improved fetch options
    const { options, clearTimeout } = createFetchOptions('POST', requestBody, TIMEOUTS.ORDERS);
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/orders`, options);
      clearTimeout();
      
      // If user not found or no orders yet, return empty array
      if (response.status === 404) {
        console.log('User has no orders or not found in orders API');
        // Cache empty array to avoid repeated calls
        cache.set(cacheKey, []);
        return [];
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorDetail;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetail = errorJson.detail || errorText;
        } catch (e) {
          errorDetail = errorText || `HTTP error ${response.status}`;
        }
        throw new Error(errorDetail);
      }
      
      // Get the response text first
      const responseText = await response.text();
      
      // Parse response
      const ordersResponse: OrdersResponse = JSON.parse(responseText);
      console.log('Orders fetched successfully:', ordersResponse);
      
      if (!ordersResponse.orders || !Array.isArray(ordersResponse.orders)) {
        console.error('API returned invalid orders data');
        return [];
      }
      
      // Cache the orders
      cache.set(cacheKey, ordersResponse.orders);
      
      return ordersResponse.orders;
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      
      // Don't show error toast for user not found
      if (!error.message.includes('User not found')) {
        toast.error(`Error fetching orders: ${error.message}`);
      }
      
      return [];
    }
  } catch (error: any) {
    console.error('Error in fetchOrders:', error);
    
    // Don't show error toast for user not found
    if (!error.message.includes('User not found')) {
      toast.error(`Error: ${error.message}`);
    }
    
    return [];
  }
};

/**
 * Create a new order and send a confirmation message to the Telegram chat
 * @param cartItems The items in the cart
 * @param shippingCost The cost of shipping
 * @returns A promise that resolves to the created order
 */
export const createOrder = async (cartItems: CartItem[], shippingCost: number = 800): Promise<boolean> => {
  try {
    // Get the user data
    const user = getTelegramUser();
    if (!user) {
      console.error('No user data available when creating order');
      toast.error('User data not available. Please try again.');
      return false;
    }
    
    console.log('Creating order for user:', user);
    
    // Calculate total price
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalPrice = subtotal + shippingCost;
    
    // Generate a unique order ID
    const orderNumber = `${user.id}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    console.log(`Generated order number: ${orderNumber}`);
    
    // Format the order items for the message
    const orderItems = cartItems.map(item => {
      return `${item.name} ${item.color} (цвет: ${getColorName(item.color)}, размер: ${item.size})  ${item.price.toFixed(2)}RUB x${item.quantity} шт`;
    }).join('\n');
    
    // Create the order message
    const orderMessage = `
Заказ №${orderNumber} успешно оформлен


Состав заказа:
${orderItems}
Стоимость доставки: ${shippingCost.toFixed(2)}RUB

Сумма: ${totalPrice.toLocaleString()} RUB

Спасибо за ваш заказ! В ближайшее время с вами свяжется менеджер
`;
    
    console.log('Prepared order message');
    
    // Create the order data
    const orderData = {
      user_id: user.id,
      username: user.username || `user_${user.id}`,
      order_number: orderNumber,
      items: cartItems.map(item => ({
        product_id: item.productId,
        name: item.name,
        color: item.color,
        size: item.size,
        price: item.price,
        quantity: item.quantity
      })),
      shipping_cost: shippingCost,
      total_price: totalPrice
    };
    
    // Send the order to the API
    const { options, clearTimeout } = createFetchOptions('POST', orderData, TIMEOUTS.ORDERS);
    
    // Store the order in localStorage as a backup
    try {
      localStorage.setItem(`order_${orderNumber}`, JSON.stringify(orderData));
    } catch (e) {
      console.warn('Could not store order in localStorage:', e);
    }
    
    // Send the order confirmation message to the Telegram chat
    console.log('Sending order confirmation to Telegram chat');
    try {
      await sendOrderConfirmation(user.id, orderMessage);
      console.log('Order confirmation sent successfully');
    } catch (error) {
      console.error('Failed to send order confirmation, but continuing with order creation:', error);
      // We'll continue with the order creation even if the confirmation fails
    }
    
    // Invalidate the orders cache for this user
    const username = user.username || `user_${user.id}`;
    cache.invalidate(CACHE_KEYS.ORDERS(user.id));
    
    // Show success message
    toast.success('Order created successfully! Check your Telegram chat for details.');
    
    return true;
  } catch (error: any) {
    console.error('Error creating order:', error);
    toast.error(`Error creating order: ${error.message}`);
    return false;
  }
};

/**
 * Send an order confirmation message to the Telegram chat
 * @param chatId The Telegram chat ID
 * @param message The message to send
 */
const sendOrderConfirmation = async (chatId: number, message: string): Promise<void> => {
  try {
    // Determine if we're in development or production
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    // Use local API in development, fallback to API_BASE_URL in production
    const apiUrl = isDevelopment 
      ? 'http://localhost:3001/api/telegram/send_message'
      : `${API_BASE_URL}/telegram/send_message`;
    
    console.log(`Sending order confirmation to chat ID ${chatId} via ${apiUrl}`);
    console.log('Message length:', message.length);
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');
    
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      console.log('Sending fetch request...');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        }),
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API response not OK:', response.status, response.statusText);
        console.error('Error data:', errorData);
        throw new Error(`Failed to send message: ${errorData?.error || response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('Order confirmation sent successfully:', responseData);
      
      // Store the message in localStorage as a backup
      try {
        localStorage.setItem(`order_message_${chatId}_${Date.now()}`, message);
      } catch (e) {
        console.warn('Could not store order message in localStorage:', e);
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout when sending order confirmation');
        throw new Error('Request timeout when sending order confirmation');
      }
      
      console.error('Fetch error details:', fetchError);
      
      // If we're in development and get a CORS error, try a different approach
      if (isDevelopment && (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch'))) {
        console.log('CORS issue detected, trying alternative approach...');
        
        // Create a fallback message with key order details
        const fallbackMessage = `
⚠️ Order created but notification failed to send via API.

Order Number: ${message.split('№')[1]?.split(' ')[0] || 'Unknown'}
Total: ${message.split('Сумма: ')[1]?.split('\n')[0] || 'Unknown'}

Please check your orders in the app.
`;
        
        // Show a warning to the user
        toast.warning('Order created, but notification could not be sent to Telegram. Check your console for details.');
        console.error('Could not send notification to Telegram due to CORS or network issues. The bot server might not be running or accessible.');
        
        // Log the fallback message
        console.log('Fallback message:', fallbackMessage);
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error sending order confirmation:', error);
    
    // Store the failed message in localStorage for potential retry
    try {
      localStorage.setItem(`failed_order_message_${chatId}_${Date.now()}`, JSON.stringify({
        chat_id: chatId,
        text: message,
        error: error.message
      }));
    } catch (e) {
      console.warn('Could not store failed order message in localStorage:', e);
    }
    
    // Don't show an error toast here, as we've already created the order successfully
    // Just log the error for debugging
  }
};

/**
 * Get the Russian name for a color code
 * @param colorCode The color code (e.g., "black", "white")
 * @returns The Russian name for the color
 */
const getColorName = (colorCode: string): string => {
  const colorMap: Record<string, string> = {
    'black': 'Черный',
    'white': 'Белый',
    'red': 'Красный',
    'blue': 'Синий',
    'green': 'Зеленый',
    'yellow': 'Желтый',
    'purple': 'Фиолетовый',
    'orange': 'Оранжевый',
    'pink': 'Розовый',
    'gray': 'Серый',
    'brown': 'Коричневый'
  };
  
  return colorMap[colorCode.toLowerCase()] || colorCode;
};

// Add a product to the user's cart
export const addProductToCart = async (productId: string, size: string): Promise<boolean> => {
  try {
    // This is just a placeholder/mock since we don't have a real cart API
    // In a real app, you'd call an API endpoint here
    console.log(`[MOCK API] Added product to cart - Product ID: ${productId}, Size: ${size}`);
    return true;
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return false;
  }
};

// Update the application when an order is placed
export const handleOrderPlaced = (orderId: number, items: CartItem[]): void => {
  try {
    // Get the current user
    const user = getTelegramUser();
    if (!user || !user.id) {
      console.error('No user data available for handleOrderPlaced');
      return;
    }
    
    // Invalidate the orders cache for this user
    cache.invalidate(CACHE_KEYS.ORDERS(user.id));
    
    // Show success message
    toast.success('Order placed successfully!');
  } catch (error) {
    console.error('Error in handleOrderPlaced:', error);
  }
};

interface CreateStockOrderData {
  telegram_user_id: number;
  delivery_type?: string;
  delivery_method?: string;
  delivery_address?: string;
  promocode_text?: string;
  dd_coins_amount?: number;
  items: {
    sku: string;
    size: string;
    quantity: number;
    sale_price: number;
  }[];
}

interface CreateStockOrderResponse {
  success: boolean;
  message: string;
  order_id?: number;
}

export const createStockOrder = async (orderData: CreateStockOrderData): Promise<CreateStockOrderResponse> => {
  try {
    // Validate required fields
    if (!orderData.items?.length) {
      throw new Error('Order must contain at least one item');
    }

    for (const item of orderData.items) {
      if (!item.sku) {
        throw new Error('Each item must have a SKU');
      }
    }

    // Use delivery_method if provided, otherwise use delivery_type
    const deliveryType = orderData.delivery_method || orderData.delivery_type;

    // Validate delivery_address if needed
    if ((deliveryType === 'courier' || deliveryType === 'shipping') && !orderData.delivery_address) {
      throw new Error('Delivery address is required for courier or shipping delivery method');
    }

    // Create a clean order data object with standardized field names
    const cleanOrderData = {
      ...orderData,
      delivery_type: deliveryType
    };

    const { options, clearTimeout } = createFetchOptions('POST', cleanOrderData);

    const response = await fetch(`${API_BASE_URL}/orders/stock`, options);
    clearTimeout();

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorText;
      } catch (e) {
        errorDetail = errorText;
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating stock order:', error);
    throw error;
  }
};

export const createPreorder = async (orderData: {
  telegram_user_id: number;
  delivery_method: string;
  delivery_address?: string;
  promocode_text?: string;
  dd_coins_amount?: number;
  final_price?: number;
  preorder_item: {
    dewu_url: string;
    size: string;
    price_cny: number;
    category_type: string;  // Must be one of: "обувь", "одежда", "аксессуары"
    delivery_type: string;  // Must be one of: "cargo" or "aero"
    quantity: number;
  };
}): Promise<CreateStockOrderResponse> => {
  try {
    // Validate required fields
    if (!orderData.telegram_user_id) {
      throw new Error('Telegram user ID is required');
    }
    
    if (!orderData.preorder_item) {
      throw new Error('Preorder item details are required');
    }
    
    if (!orderData.preorder_item.dewu_url) {
      throw new Error('Preorder item URL is required');
    }
    
    if (!orderData.preorder_item.category_type) {
      throw new Error('Preorder item category type is required');
    }
    
    if (!orderData.preorder_item.delivery_type) {
      throw new Error('Preorder item delivery type is required');
    }
    
    // Validate category_type
    const validCategoryTypes = ['обувь', 'одежда', 'аксессуары'];
    if (!validCategoryTypes.includes(orderData.preorder_item.category_type)) {
      throw new Error(`Invalid category type. Must be one of: ${validCategoryTypes.join(', ')}`);
    }
    
    // Validate delivery_type
    const validDeliveryTypes = ['cargo', 'aero'];
    if (!validDeliveryTypes.includes(orderData.preorder_item.delivery_type)) {
      throw new Error(`Invalid delivery type. Must be one of: ${validDeliveryTypes.join(', ')}`);
    }
    
    // Validate delivery_address if needed
    if ((orderData.delivery_method === 'courier' || orderData.delivery_method === 'shipping') && !orderData.delivery_address) {
      throw new Error('Delivery address is required for courier or shipping delivery method');
    }
    
    // Create a clean request structure as expected by the API
    const requestData = {
      telegram_user_id: orderData.telegram_user_id,
      preorder_item: orderData.preorder_item,
      delivery_method: orderData.delivery_method,
      delivery_address: orderData.delivery_address || '',
      promocode_text: orderData.promocode_text,
      dd_coins_amount: orderData.dd_coins_amount,
      final_price: orderData.final_price,
      quantity: orderData.preorder_item.quantity
    };
    
    const { options, clearTimeout } = createFetchOptions('POST', requestData);

    const response = await fetch(`${API_BASE_URL}/orders/preorder`, options);
    clearTimeout();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to create preorder');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating preorder:', error);
    throw error;
  }
};

/**
 * Calculate shipping cost using the API
 * @param priceCny The price in CNY
 * @param shippingType The shipping type ('cargo' for car, 'aero' for plane)
 * @param category The item category (e.g., 'sneakers', 'hoodie')
 * @returns A promise that resolves to the shipping cost
 */
export const calculateShipping = async (
  priceCny: number,
  shippingType: string,
  category: string
): Promise<number> => {
  try {
    // Convert shipping type to API format if needed
    const apiShippingType = shippingType === 'car' ? 'cargo' : shippingType === 'plane' ? 'aero' : shippingType;
    
    // Prepare the request body
    const requestBody = {
      price_cny: priceCny,
      shipping_type: apiShippingType,
      category
    };
    
    console.log('Shipping calculation request:', requestBody);
    
    // Make the API call
    const { options, clearTimeout } = createFetchOptions('POST', requestBody, TIMEOUTS.PRODUCTS);
    
    const response = await fetch(`${API_BASE_URL}/orders/calculate-shipping`, options);
    clearTimeout();
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API response not OK:', response.status, response.statusText);
      console.error('Error data:', errorData);
      throw new Error(`Failed to calculate shipping: ${errorData?.message || response.statusText}`);
    }
    
    // Get the response
    const responseData = await response.json();
    console.log('Shipping calculation response:', responseData);
    
    // Return the shipping cost
    return responseData.shipping_cost;
  } catch (error: any) {
    console.error('Error calculating shipping:', error);
    throw new Error(`Error calculating shipping: ${error.message}`);
  }
};

// Add a new function for creating unified orders (both stock and preorder items)
export const createUnifiedOrder = async (orderData: {
  telegram_user_id: number;
  delivery_method: string;
  delivery_address?: string;
  promocode_text?: string;
  dd_coins_amount?: number;
  items: {
    item_type: 'stock' | 'preorder';
    // For stock items
    stock_id?: number;
    sku?: string;
    size?: string;
    quantity?: number;
    // For preorder items
    dewu_url?: string;
    category_type?: string;
    shipping_type?: string;
    price_cny?: number;
  }[];
  final_price?: number;
}): Promise<CreateStockOrderResponse> => {
  try {
    // Validate required fields
    if (!orderData.items?.length) {
      throw new Error('Order must contain at least one item');
    }

    // Prepare the items array in the format expected by the API
    const items = orderData.items.map(item => {
      if (item.item_type === 'preorder') {
        // Validate preorder item fields
        if (!item.dewu_url) {
          throw new Error('Preorder item must have a URL');
        }
        if (!item.category_type) {
          throw new Error('Preorder item must have a category type');
        }
        if (!item.shipping_type) {
          throw new Error('Preorder item must have a shipping type');
        }
        if (!item.price_cny) {
          throw new Error('Preorder item must have a price in CNY');
        }
        
        // Validate category_type
        const validCategoryTypes = ['обувь', 'одежда', 'аксессуары'];
        if (!validCategoryTypes.includes(item.category_type)) {
          throw new Error(`Invalid category type for preorder. Must be one of: ${validCategoryTypes.join(', ')}`);
        }
        
        // Validate shipping_type
        const validShippingTypes = ['cargo', 'aero'];
        if (!validShippingTypes.includes(item.shipping_type)) {
          throw new Error(`Invalid shipping type for preorder. Must be one of: ${validShippingTypes.join(', ')}`);
        }

        // Return preorder item in the format expected by the API
        return {
          item_type: 'preorder',
          dewu_url: item.dewu_url,
          size: item.size || '',
          price_cny: item.price_cny,
          category_type: item.category_type,
          shipping_type: item.shipping_type,
          quantity: item.quantity || 1
        };
      } else {
        // Stock item
        // If stock_id is provided, use that
        if (item.stock_id) {
          return {
            item_type: 'stock',
            stock_id: item.stock_id
          };
        }
        
        // Otherwise require sku and size
        if (!item.sku) {
          throw new Error('Stock item must have a SKU');
        }
        
        return {
          item_type: 'stock',
          sku: item.sku,
          size: item.size || '',
          quantity: item.quantity || 1
        };
      }
    });

    // Validate delivery_address if needed
    if ((orderData.delivery_method === 'courier' || orderData.delivery_method === 'shipping') && !orderData.delivery_address) {
      throw new Error('Delivery address is required for courier or shipping delivery method');
    }

    // Prepare the request data
    const requestData = {
      telegram_user_id: orderData.telegram_user_id,
      items: items,
      delivery_method: orderData.delivery_method,
      delivery_address: orderData.delivery_address || '',
      promocode_text: orderData.promocode_text,
      dd_coins_amount: orderData.dd_coins_amount,
      final_price: orderData.final_price
    };

    console.log("Sending unified order request:", JSON.stringify(requestData, null, 2));

    const { options, clearTimeout } = createFetchOptions('POST', requestData);

    const response = await fetch(`${API_BASE_URL}/orders/create-order`, options);
    clearTimeout();

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorText;
      } catch (e) {
        errorDetail = errorText;
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating unified order:', error);
    throw error;
  }
};

/**
 * Fetch available delivery types
 * @returns A promise that resolves to an array of delivery types
 */
export const fetchDeliveryTypes = async () => {
  try {
    const { options, clearTimeout } = createFetchOptions('GET', undefined, TIMEOUTS.PRODUCTS);
    
    const response = await fetch(`${API_BASE_URL}/orders/delivery-types`, options);
    clearTimeout();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API response not OK:', response.status, response.statusText);
      console.error('Error data:', errorData);
      throw new Error(`Failed to fetch delivery types: ${errorData?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.delivery_types || [];
  } catch (error) {
    console.error('Error fetching delivery types:', error);
    throw error;
  }
};
