// This script is added to help debug GitHub Pages deployment issues
document.addEventListener('DOMContentLoaded', function() {
  console.log('Debug script loaded');
  
  // Create debug info element
  const debugEl = document.createElement('div');
  debugEl.style.position = 'fixed';
  debugEl.style.bottom = '0';
  debugEl.style.left = '0';
  debugEl.style.width = '100%';
  debugEl.style.padding = '10px';
  debugEl.style.backgroundColor = 'rgba(0,0,0,0.8)';
  debugEl.style.color = 'white';
  debugEl.style.zIndex = '9999';
  debugEl.style.fontSize = '12px';
  debugEl.style.fontFamily = 'monospace';
  debugEl.style.maxHeight = '30%';
  debugEl.style.overflow = 'auto';
  
  // Collect script elements information
  const scripts = document.querySelectorAll('script');
  let scriptInfo = '<h3>Scripts:</h3>';
  
  scripts.forEach((script, index) => {
    scriptInfo += `<div>[${index}] src: ${script.src || 'inline'}, type: ${script.type || 'standard'}</div>`;
  });
  
  // Collect stylesheet information
  const styles = document.querySelectorAll('link[rel="stylesheet"]');
  let styleInfo = '<h3>Stylesheets:</h3>';
  
  styles.forEach((style, index) => {
    styleInfo += `<div>[${index}] href: ${style.href}</div>`;
  });
  
  // Collect error information
  const errors = [];
  const originalError = console.error;
  
  console.error = function() {
    errors.push(Array.from(arguments).join(' '));
    if (errors.length > 10) errors.shift();
    updateDebugInfo();
    originalError.apply(console, arguments);
  };
  
  function updateDebugInfo() {
    let errorInfo = '<h3>Recent Errors:</h3>';
    
    errors.forEach((error, index) => {
      errorInfo += `<div>[${index}] ${error}</div>`;
    });
    
    debugEl.innerHTML = `
      <h2>Debug Information</h2>
      <div>User Agent: ${navigator.userAgent}</div>
      <div>URL: ${window.location.href}</div>
      <div>Base Path: ${document.baseURI}</div>
      ${scriptInfo}
      ${styleInfo}
      ${errorInfo}
    `;
  }
  
  // Initial update
  updateDebugInfo();
  
  // Add to document
  document.body.appendChild(debugEl);
  
  // Check for root div and report its status
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const rootInfo = document.createElement('div');
    rootInfo.innerHTML = `<h3>Root Element:</h3><div>Found #root element with ${rootEl.children.length} children</div>`;
    debugEl.appendChild(rootInfo);
  } else {
    const rootInfo = document.createElement('div');
    rootInfo.innerHTML = `<h3>Root Element:</h3><div style="color:red">WARNING: #root element not found!</div>`;
    debugEl.appendChild(rootInfo);
  }
}); 