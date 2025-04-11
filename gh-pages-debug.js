// GitHub Pages specific debugging
(function() {
  console.log('GitHub Pages Debug script initialized');
  
  // Create a debug panel
  function createDebugPanel() {
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '0';
    debugPanel.style.left = '0';
    debugPanel.style.right = '0';
    debugPanel.style.backgroundColor = 'rgba(0,0,0,0.8)';
    debugPanel.style.color = '#fff';
    debugPanel.style.zIndex = '10000';
    debugPanel.style.padding = '10px';
    debugPanel.style.maxHeight = '200px';
    debugPanel.style.overflow = 'auto';
    debugPanel.style.fontSize = '14px';
    debugPanel.style.fontFamily = 'monospace';
    
    return debugPanel;
  }
  
  // Capture console errors
  const originalConsoleError = console.error;
  const errors = [];
  
  console.error = function() {
    errors.push(Array.from(arguments).join(' '));
    updateDebugInfo();
    originalConsoleError.apply(console, arguments);
  };
  
  // Log all script and resource load errors
  window.addEventListener('error', function(e) {
    if (e.target && (e.target.src || e.target.href)) {
      errors.push(`Failed to load: ${e.target.src || e.target.href}`);
      updateDebugInfo();
    }
  }, true);
  
  // Update the debug panel with current info
  function updateDebugInfo() {
    if (!debugPanel.parentNode) {
      document.body.appendChild(debugPanel);
    }
    
    debugPanel.innerHTML = `
      <h3>GitHub Pages Debug</h3>
      <div>Location: ${window.location.href}</div>
      <div>Base: ${document.querySelector('base')?.href || 'No base tag'}</div>
      <div>Public URL: ${window.location.origin}${document.querySelector('base')?.getAttribute('href') || ''}</div>
      <h4>Errors (${errors.length}):</h4>
      ${errors.map(err => `<div style="color: #ff6b6b">${err}</div>`).join('')}
      <button id="debugClose" style="position:absolute;top:5px;right:5px;background:#333;color:#fff;border:none;padding:2px 5px;">X</button>
    `;
    
    document.getElementById('debugClose')?.addEventListener('click', function() {
      debugPanel.style.display = 'none';
    });
  }
  
  // Wait for DOM to be loaded before creating the panel
  const debugPanel = createDebugPanel();
  
  // Add panel when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      updateDebugInfo();
    });
  } else {
    updateDebugInfo();
  }
})(); 