import { toast } from 'sonner';

// API configuration
export const API_BASE_URL = 'https://www.ddconcept.ru/api';

// Timeout configuration for different API calls
export const TIMEOUTS = {
  PRODUCTS: 10000, // 10 seconds
  ORDERS: 8000,    // 8 seconds
  PROFILE: 8000     // 8 seconds
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
