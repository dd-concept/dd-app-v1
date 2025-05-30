import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTopWithRetries } from '@/utils/scrollUtils';

/**
 * A hook that scrolls the window to the top when the pathname changes.
 * Uses the scrollUtils utility for maximum reliability.
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    // Use our utility function that handles multiple scroll attempts
    const cleanup = scrollToTopWithRetries();
    console.log(`useScrollToTop hook executed for path: ${pathname}`);
    
    // Return the cleanup function to clear all timeouts
    return cleanup;
  }, [pathname]);
}; 