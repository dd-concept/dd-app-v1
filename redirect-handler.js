// Handles redirects for GitHub Pages SPA
(function() {
  // Parse query parameters from the URL
  const getQueryParams = () => {
    const query = window.location.search.substring(1);
    const params = {};
    
    if (query) {
      const pairs = query.split('&');
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }
    }
    
    return params;
  };
  
  // If we have a path parameter from our 404.html redirect
  // convert it back to normal browser URL
  const params = getQueryParams();
  
  if (params.path) {
    // Get the proper path from the parameter
    const path = params.path.replace(/^\/+/, '');
    
    // Get the basename (should be /dd-app-v1/)
    const pathname = window.location.pathname;
    const basename = '/dd-app-v1/';
    
    // Keep all query parameters except 'path'
    const newSearch = Array.from(new URL(window.location.href).searchParams.entries())
      .filter(([key]) => key !== 'path')
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Create new URL making sure we don't duplicate the path
    let newUrl = '';
    
    // Check if pathname already ends with dd-app-v1/
    if (pathname.endsWith('dd-app-v1/')) {
      newUrl = `${window.location.origin}${pathname}${path}`;
    } else {
      // Otherwise make sure we have the proper basename
      newUrl = `${window.location.origin}${basename}${path}`;
    }
    
    // Add any remaining query parameters and hash
    newUrl += `${newSearch ? '?' + newSearch : ''}${window.location.hash}`;
    
    console.log('Redirect handler: Transforming to', newUrl);
    
    // Update history to show the proper URL
    window.history.replaceState(null, document.title, newUrl);
  }
})(); 