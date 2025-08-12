import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  showFallbackContent('JavaScript Error: ' + (event.error?.message || 'Unknown error occurred'));
});

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showFallbackContent('Application Error: Failed to load properly');
});

// Fallback content function
function showFallbackContent(errorMessage: string) {
  const appRoot = document.querySelector('app-root');
  if (appRoot && !appRoot.querySelector('.angular-loaded')) {
    appRoot.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        padding: 20px; 
        text-align: center; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        background: #f5f5f5;
        color: #333;
      ">
        <div style="
          background: white; 
          padding: 40px; 
          border-radius: 8px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
        ">
          <h1 style="margin-bottom: 20px; color: #d32f2f;">Application Error</h1>
          <p style="margin-bottom: 20px; line-height: 1.5;">
            ${errorMessage}
          </p>
          <p style="margin-bottom: 30px; font-size: 14px; color: #666;">
            This may be due to browser compatibility issues. Please try refreshing the page or using a different browser.
          </p>
          <button 
            onclick="location.reload()" 
            style="
              background: #1976d2; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 4px; 
              cursor: pointer; 
              font-size: 16px;
              margin-right: 10px;
            "
            onmouseover="this.style.background='#1565c0'"
            onmouseout="this.style.background='#1976d2'"
          >
            Refresh Page
          </button>
          <button 
            onclick="localStorage.clear(); location.reload();" 
            style="
              background: #757575; 
              color: white; 
              border: none; 
              padding: 12px 24px; 
              border-radius: 4px; 
              cursor: pointer; 
              font-size: 16px;
            "
            onmouseover="this.style.background='#616161'"
            onmouseout="this.style.background='#757575'"
          >
            Clear Cache & Refresh
          </button>
        </div>
      </div>
    `;
  }
}

// Enhanced bootstrap with better error handling
async function initializeApp() {
  try {
    // Check if we're in a supported browser
    if (typeof Promise === 'undefined') {
      throw new Error('Browser not supported - Promise is required');
    }

    // Add a class to detect if Angular loaded successfully
    const appRoot = document.querySelector('app-root');
    if (appRoot) {
      // Set a timeout to show fallback if Angular doesn't load
      const fallbackTimeout = setTimeout(() => {
        if (!appRoot.querySelector('.angular-loaded')) {
          console.warn('Angular bootstrap timeout - showing fallback');
          showFallbackContent('Application is taking too long to load');
        }
      }, 15000); // 15 second timeout

      // Try to bootstrap Angular
      const app = await bootstrapApplication(AppComponent, appConfig);
      
      // Mark as successfully loaded
      setTimeout(() => {
        const loadedRoot = document.querySelector('app-root');
        if (loadedRoot && loadedRoot.children.length > 0) {
          loadedRoot.classList.add('angular-loaded');
          clearTimeout(fallbackTimeout);
        }
      }, 1000);

      console.log('Angular application bootstrapped successfully');
      return app;
    } else {
      throw new Error('app-root element not found');
    }
  } catch (err) {
    console.error('Bootstrap error:', err);
    
    // Show user-friendly error message
    const errorMessage = err instanceof Error 
      ? `Bootstrap failed: ${err.message}`
      : 'Failed to start the application';
    
    showFallbackContent(errorMessage);
    
    // Re-throw for any external error handlers
    throw err;
  }
}

// Start the application
initializeApp().catch((err) => {
  console.error('Final error handler:', err);
  
  // Last resort fallback
  setTimeout(() => {
    const appRoot = document.querySelector('app-root');
    if (appRoot && !appRoot.querySelector('.angular-loaded')) {
      showFallbackContent('Critical error occurred during application startup');
    }
  }, 1000);
});