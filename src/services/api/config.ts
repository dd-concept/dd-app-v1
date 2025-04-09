import { toast } from 'sonner';

// API configuration
export const API_BASE_URL = 'https://v2786182.hosted-by-vdsina.ru/api/v1';

// Function to ensure proper API path formatting
export const getApiUrl = (path: string): string => {
  // Remove any leading slash from the path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Remove api/v1 prefix from path if it exists since API_BASE_URL already includes it
  const finalPath = cleanPath.startsWith('api/v1/') 
    ? cleanPath.substring(7) // Remove 'api/v1/'
    : cleanPath;
    
  return `${API_BASE_URL}/${finalPath}`;
};

// Increased timeout configuration for different API calls
export const TIMEOUTS = {
  PRODUCTS: 15000, // 15 seconds (increased from 10)
  ORDERS: 12000,   // 12 seconds (increased from 8)
  PROFILE: 12000   // 12 seconds (increased from 8)
};

// Cache configuration
export const CACHE_CONFIG = {
  PRODUCTS_TTL: 5 * 60 * 1000, // 5 minutes
  PROFILE_TTL: 10 * 60 * 1000, // 10 minutes
  ORDERS_TTL: 3 * 60 * 1000,   // 3 minutes
};

// Cache storage
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache management
export const cache = {
  _store: new Map<string, CacheItem<any>>(),
  
  get<T>(key: string, ttl: number): T | null {
    const item = this._store.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > ttl) {
      // Cache expired
      this._store.delete(key);
      return null;
    }
    
    return item.data as T;
  },
  
  set<T>(key: string, data: T): void {
    this._store.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  invalidate(key: string): void {
    this._store.delete(key);
  },
  
  clear(): void {
    this._store.clear();
  }
};

// Helper function to handle API errors with detailed error messages
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  let message = 'An error occurred. Please try again.';
  
  if (error.response) {
    // Server responded with an error status code
    const statusCode = error.response.status;
    
    // Try to extract error detail from response
    try {
      const errorData = error.response.data;
      if (errorData && errorData.detail) {
        message = `API Error (${statusCode}): ${errorData.detail}`;
      } else {
        message = `API Error (${statusCode}): ${error.response.statusText}`;
      }
    } catch (e) {
      message = `API Error (${statusCode}): Could not parse error details`;
    }
  } else if (error.request) {
    // Request made but no response received
    message = 'Network Error: No response from server. Using cached data instead.';
  } else if (error instanceof Error) {
    // Something else went wrong
    message = `Error: ${error.message}`;
  }
  
  if (message.includes('Using cached data')) {
    toast.info(message);
  } else {
    toast.error(message);
  }
  
  return Promise.reject(new Error(message));
};

// Helper function to create fetch options with proper headers and timeout
export const createFetchOptions = (
  method: string = 'GET', 
  body?: any, 
  timeout: number = TIMEOUTS.PRODUCTS
): { 
  signal: AbortSignal, 
  options: RequestInit,
  clearTimeout: () => void 
} => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const options: RequestInit = {
    method,
    signal: controller.signal,
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  
  return {
    signal: controller.signal,
    options,
    clearTimeout: () => clearTimeout(timeoutId)
  };
};
