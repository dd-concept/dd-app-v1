// Export all API services from a single entry point

// Export types
export * from './types';

// Export config
export * from './config';

// Export user service
export { 
  getTelegramUser, 
  checkUserExists, 
  // getUserRank, 
  checkUserProfile,
  getDDCoinsBalance,
  getDeliveryRates
} from './userService';

// Export product service
export * from './productService';

// Export order service
export { 
  fetchOrders,
  createOrder,
  addProductToCart,
  handleOrderPlaced,
  createStockOrder,
  createPreorder,
  calculateShipping,
  createUnifiedOrder,
  fetchDeliveryTypes
} from './orderService';

// Export client service
export * from './clientService';

// Export referral service
export * from './referralService';
