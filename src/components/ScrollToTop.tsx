import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTopWithRetries } from '@/utils/scrollUtils';

/**
 * ScrollToTop component that forces window to scroll to top when route changes
 * Uses the scrollUtils utility for maximum reliability
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use our utility function that handles multiple scroll attempts
    const cleanup = scrollToTopWithRetries();
    console.log(`ScrollToTop component executed for path: ${pathname}`);
    
    // Return the cleanup function to clear all timeouts
    return cleanup;
  }, [pathname]);

  return null;
};

export default ScrollToTop; 