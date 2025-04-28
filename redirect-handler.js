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
    
    // Create the URL for the history API
    const url = new URL(window.location.href);
    
    // Keep all query parameters except 'path'
    const newSearch = Array.from(url.searchParams.entries())
      .filter(([key]) => key !== 'path')
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Construct the proper pathname with the base and the path
    let pathname = url.pathname;
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    pathname += path;
    
    // Create new history state with proper path
    const newUrl = `${window.location.origin}${pathname}${newSearch ? '?' + newSearch : ''}${window.location.hash}`;
    
    console.log('Redirect handler: Transforming to', newUrl);
    
    // Update history to show the proper URL
    window.history.replaceState(null, document.title, newUrl);
  }
})(); 