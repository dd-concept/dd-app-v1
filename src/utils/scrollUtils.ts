/**
 * Utility function to aggressively scroll to the top of the page
 * Uses multiple methods and attempts to ensure maximum compatibility
 */
export const scrollToTop = () => {
  // Method 1: Basic window.scrollTo
  window.scrollTo(0, 0);
  
  // Method 2: With options object
  window.scrollTo({
    top: 0,
    behavior: 'auto' // Using 'auto' for immediate effect
  });
  
  // Method 3: Document element scroll (for some browsers)
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
  }
  
  // Method 4: Body scroll (for older browsers)
  if (document.body) {
    document.body.scrollTop = 0;
  }
  
  console.log('scrollToTop utility function executed');
};

/**
 * Scroll to top with multiple attempts over time
 * This helps with complex layouts that might take time to render
 */
export const scrollToTopWithRetries = () => {
  // Execute immediately
  scrollToTop();
  
  // Then try multiple times with delays
  const delays = [10, 50, 100, 200, 500];
  const timeouts = delays.map(delay => setTimeout(scrollToTop, delay));
  
  // Return a cleanup function to clear all timeouts
  return () => timeouts.forEach(timeout => clearTimeout(timeout));
}; 