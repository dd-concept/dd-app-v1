import { toast } from 'sonner';
import { API_BASE_URL, TIMEOUTS, handleApiError, cache, CACHE_CONFIG, createFetchOptions } from './config';
import { StockItem, StockResponse, SizeAvailability, ItemPhoto, CategoryResponse, Category } from './types';
import { MOCK_PRODUCTS } from './mockData';

// Cache keys
const CACHE_KEYS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories'
};

// Fetch all available products with fallback to mock data and caching
export const fetchProducts = async (): Promise<StockItem[]> => {
  console.log('Fetching products...');
  
  try {
    // Check cache first
    const cachedProducts = cache.get<StockItem[]>(CACHE_KEYS.PRODUCTS, CACHE_CONFIG.PRODUCTS_TTL);
    if (cachedProducts) {
      console.log('Using cached products data');
      return cachedProducts;
    }
    
    console.log('No cached products, fetching from API...');
    
    // Make the API call with improved fetch options
    const { options, clearTimeout } = createFetchOptions('GET', undefined, TIMEOUTS.PRODUCTS);
    
    try {
      const response = await fetch(`${API_BASE_URL}/stock/in-stock`, options);
      clearTimeout();
      
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
      const stockResponse: StockResponse = JSON.parse(responseText);
      console.log('Products fetched successfully, count:', stockResponse.items?.length || 0);
      
      if (!stockResponse.items || !Array.isArray(stockResponse.items)) {
        console.error('API returned invalid products data');
        toast.error('Invalid products data received from API');
        return MOCK_PRODUCTS;
      }
      
      // Process the items to ensure consistent data format
      const normalizedItems = stockResponse.items.map(item => {
        // Ensure price_rub is a number
        const price = typeof item.price_rub === 'string' 
          ? parseFloat(item.price_rub.replace(/[^\d.-]/g, '')) 
          : Number(item.price_rub);
          
        // Ensure photos array exists
        const photos = Array.isArray(item.photos) ? item.photos : [];
        
        // Ensure sizes array exists and has quantity as number
        const sizes = Array.isArray(item.sizes) 
          ? item.sizes.map(size => ({
              ...size,
              quantity: typeof size.quantity === 'string' ? parseInt(size.quantity, 10) : size.quantity
            }))
          : [];
        
        return {
          ...item,
          price_rub: isNaN(price) ? 0 : price,
          photos: photos,
          sizes: sizes
        };
      });
      
      // Cache the products
      cache.set(CACHE_KEYS.PRODUCTS, normalizedItems);
      
      return normalizedItems;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(`Error loading products: ${error.message}`);
      return MOCK_PRODUCTS;
    }
  } catch (error: any) {
    console.error('Error in fetchProducts:', error);
    toast.error(`Error: ${error.message}`);
    return MOCK_PRODUCTS;
  }
};

/**
 * Fetch all available categories
 * @returns A promise that resolves to an array of categories
 */
export const fetchCategories = async (): Promise<Category[]> => {
  console.log('Fetching categories...');
  
  try {
    // Check cache first
    const cachedCategories = cache.get<Category[]>(CACHE_KEYS.CATEGORIES, CACHE_CONFIG.PRODUCTS_TTL);
    if (cachedCategories) {
      console.log('Using cached categories data');
      return cachedCategories;
    }
    
    console.log('No cached categories, fetching from API...');
    
    // Make the API call with improved fetch options
    const { options, clearTimeout } = createFetchOptions('GET', undefined, TIMEOUTS.PRODUCTS);
    
    try {
      const response = await fetch(`${API_BASE_URL}/stock/get-categories`, options);
      clearTimeout();
      
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
      const categoryResponse: CategoryResponse = JSON.parse(responseText);
      console.log('Categories fetched successfully, count:', categoryResponse.categories?.length || 0);
      
      if (!categoryResponse.categories || !Array.isArray(categoryResponse.categories)) {
        console.error('API returned invalid categories data');
        toast.error('Invalid categories data received from API');
        return [];
      }
      
      // Cache the categories
      cache.set(CACHE_KEYS.CATEGORIES, categoryResponse.categories);
      
      return categoryResponse.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    handleApiError('Failed to fetch categories');
    return [];
  }
};
