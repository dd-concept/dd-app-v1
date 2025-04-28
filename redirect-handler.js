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
  
  // If we have a _path parameter from our 404.html redirect
  // convert it back to normal browser URL
  const params = getQueryParams();
  
  if (params._path) {
    const newPath = params._path.replace(/^\/+/, '');
    
    // Create a new URL without the _path parameter
    const url = new URL(window.location.href);
    url.search = '';
    url.pathname = url.pathname.split('/').slice(0, 2).join('/') + '/' + newPath;
    
    // Replace current URL with the new one
    window.history.replaceState({}, document.title, url.toString());
    
    console.log('Redirect handler: Transformed path', newPath);
  }
})(); 