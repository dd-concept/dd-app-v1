import { miniApp, hapticFeedback, backButton, mainButton, themeParams, viewport, retrieveLaunchParams, type LaunchParams } from '@telegram-apps/sdk';

// Define RGB type for Telegram colors
export type RGB = `#${string}`;

// Re-export the TelegramUser type from our central type definition
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

// Define theme parameters interface
interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

// Define event types for Telegram WebApp
type TelegramEventType = 'themeChanged' | 'viewportChanged' | 'mainButtonClicked' | 'fullscreenChanged' | 'fullscreenFailed' | 'activated' | 'deactivated' | 'safeAreaChanged' | 'contentSafeAreaChanged';

// Define the complete TelegramWebApp interface
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (eventType: TelegramEventType, eventHandler: () => void) => void;
  offEvent: (eventType: TelegramEventType, eventHandler: () => void) => void;
  sendData: (data: string) => void;
  postEvent: (eventType: string, eventData?: string) => void;
  themeParams: ThemeParams;
  colorScheme: 'light' | 'dark';
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  // Bot API 8.0+ Full-screen mode properties and methods
  isFullscreen?: boolean;
  isActive?: boolean;
  safeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  contentSafeAreaInset?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  requestFullscreen?: () => void;
  exitFullscreen?: () => void;
  // Optional method that might be available in some Telegram clients
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
}

/**
 * Helper function to safely access the Telegram WebApp instance
 * @returns The Telegram WebApp instance or undefined if not available
 */
export function getTelegramWebApp(): TelegramWebApp | undefined {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    // Cast to unknown first to avoid type checking, then to our interface
    // This is safe because we know the actual implementation has these methods
    return window.Telegram.WebApp as unknown as TelegramWebApp;
  }
  return undefined;
}

/**
 * Detect if the current device is mobile
 */
export function isMobileDevice(): boolean {
  try {
    // Check multiple indicators for mobile device
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Check for mobile user agents
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    
    // Check for touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check viewport width (mobile-first approach)
    const isNarrowScreen = window.innerWidth <= 768;
    
    // Check if running in Telegram mobile app specifically
    const platform = navigator.platform || '';
    const isTelegramMobile = platform.includes('iPhone') || platform.includes('Android') || 
                            userAgent.includes('Mobile') || userAgent.includes('Telegram');
    
    // Combine all checks - device is mobile if any mobile indicator is true
    const isMobile = isMobileUA || (hasTouch && isNarrowScreen) || isTelegramMobile;
    
    console.log('Mobile detection:', {
      userAgent,
      isMobileUA,
      hasTouch,
      isNarrowScreen,
      isTelegramMobile,
      finalResult: isMobile
    });
    
    return isMobile;
  } catch (error) {
    console.error('Error detecting mobile device:', error);
    // Default to mobile for safety in Telegram environment
    return true;
  }
}

/**
 * Initialize the Telegram WebApp
 * This must be called before any other Telegram WebApp functions
 */
export function initTelegramWebApp(): void {
  try {
    console.log("Initializing Telegram WebApp...");
    
    // Detect if we're on mobile device
    const isMobile = isMobileDevice();
    console.log(`Device detected as: ${isMobile ? 'Mobile' : 'Desktop'}`);
    
    // Try SDK method first
    try {
      // Tell Telegram the WebApp is ready
      miniApp.ready();
      
      // Expand the WebApp to full height immediately
      viewport.expand();
      
      // Force full screen mode more aggressively
      setTimeout(() => {
        viewport.expand();
        console.log("Secondary viewport expansion attempted");
      }, 100);
      
      // Use official Telegram fullscreen API (Bot API 8.0+) - ONLY ON MOBILE
      const webApp = getTelegramWebApp();
      if (webApp && webApp.requestFullscreen && isMobile) {
        // Add a delay to ensure WebApp is fully initialized before requesting fullscreen
        setTimeout(() => {
          console.log("Requesting fullscreen using Telegram API (mobile device detected)...");
          webApp.requestFullscreen();
          
          // Set up fullscreen event listeners
          webApp.onEvent('fullscreenChanged', () => {
            console.log('Fullscreen state changed:', webApp.isFullscreen);
          });
          
          webApp.onEvent('fullscreenFailed', () => {
            console.log('Fullscreen request failed');
          });
          
          webApp.onEvent('activated', () => {
            console.log('Mini App activated');
          });
          
          webApp.onEvent('deactivated', () => {
            console.log('Mini App deactivated');
          });
          
          webApp.onEvent('safeAreaChanged', () => {
            console.log('Safe area changed:', webApp.safeAreaInset);
          });
          
          webApp.onEvent('contentSafeAreaChanged', () => {
            console.log('Content safe area changed:', webApp.contentSafeAreaInset);
          });
        }, 500); // 500ms delay to ensure WebApp is ready
      } else if (!isMobile) {
        console.log("Desktop device detected - skipping fullscreen request");
      } else {
        console.log("Telegram fullscreen API not available, using viewport expansion only");
      }
      
      console.log("Telegram WebApp initialized successfully using SDK");
    } catch (sdkError) {
      console.warn("SDK initialization failed, falling back to direct WebApp API:", sdkError);
      
      // Fallback to direct WebApp API
      const webApp = getTelegramWebApp();
      if (webApp) {
        webApp.ready();
        webApp.expand();
        
        // Force full screen mode more aggressively
        setTimeout(() => {
          webApp.expand();
          console.log("Secondary WebApp expansion attempted");
        }, 100);
        
        // Use official Telegram fullscreen API (Bot API 8.0+) - ONLY ON MOBILE
        if (webApp.requestFullscreen && isMobile) {
          // Add a delay to ensure WebApp is fully initialized before requesting fullscreen
          setTimeout(() => {
            console.log("Requesting fullscreen using Telegram API (fallback, mobile device detected)...");
            webApp.requestFullscreen();
            
            // Set up fullscreen event listeners
            webApp.onEvent('fullscreenChanged', () => {
              console.log('Fullscreen state changed:', webApp.isFullscreen);
            });
            
            webApp.onEvent('fullscreenFailed', () => {
              console.log('Fullscreen request failed');
            });
            
            webApp.onEvent('activated', () => {
              console.log('Mini App activated');
            });
            
            webApp.onEvent('deactivated', () => {
              console.log('Mini App deactivated');
            });
            
            webApp.onEvent('safeAreaChanged', () => {
              console.log('Safe area changed:', webApp.safeAreaInset);
            });
            
            webApp.onEvent('contentSafeAreaChanged', () => {
              console.log('Content safe area changed:', webApp.contentSafeAreaInset);
            });
          }, 500); // 500ms delay to ensure WebApp is ready
        } else if (!isMobile) {
          console.log("Desktop device detected - skipping fullscreen request");
        } else {
          console.log("Telegram fullscreen API not available, using viewport expansion only");
        }
        
        console.log("Telegram WebApp initialized successfully using direct WebApp API");
      } else {
        throw new Error("Telegram WebApp is not available");
      }
    }
    
    // Force viewport settings
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
    
    // Set body and html styles for full screen (removed overflow: hidden to allow scrolling)
    document.body.style.height = '100vh';
    document.documentElement.style.height = '100vh';
    
  } catch (error) {
    console.error("Error initializing Telegram WebApp:", error);
  }
}

/**
 * Set the HTML class based on Telegram's color scheme
 */
export function setThemeClass(): void {
  try {
    const html = document.documentElement;
    
    // Add telegram-webview class to html element
    html.classList.add('telegram-webview');
    
    // Get isDark from SDK or WebApp
    const webApp = getTelegramWebApp();
    const isDark = themeParams.isDark || webApp?.colorScheme === 'dark';
    
    // Set dark/light class based on Telegram's theme
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    
    console.log(`Theme set to ${isDark ? 'dark' : 'light'} mode`);
  } catch (error) {
    console.error("Error setting theme class:", error);
  }
}

/**
 * Force the Telegram mini app to use a dark gray theme
 */
export function setDarkGrayTheme(): void {
  try {
    console.log("Setting dark gray theme for Telegram mini app");
    
    // Get the root element
    const root = document.documentElement;
    const darkGrayColor = "#232730";
    const darkGraySecondaryColor = "#2c313c";
    
    // Force dark gray theme regardless of user's Telegram theme
    // Apply directly to HTML element
    root.style.backgroundColor = darkGrayColor;
    
    // Force dark class
    root.classList.add('dark');
    root.classList.remove('light');
    root.classList.add('telegram-webview');
    
    // Set CSS variables for Telegram colors - use !important to override any other styles
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --tg-theme-bg-color: ${darkGrayColor} !important;
        --tg-theme-secondary-bg-color: ${darkGraySecondaryColor} !important;
        --tg-theme-text-color: #ffffff !important;
        --tg-theme-hint-color: #7d7d7d !important;
        --tg-theme-link-color: #64baff !important;
        --tg-theme-button-color: #3390ec !important;
        --tg-theme-button-text-color: #ffffff !important;
        --tg-color-scheme: dark !important;
        
        --telegram-bg: ${darkGrayColor} !important;
        --telegram-secondary-bg: ${darkGraySecondaryColor} !important;
        --telegram-text: #ffffff !important;
      }
      
      body, html, #root {
        background-color: ${darkGrayColor} !important;
        color: #ffffff !important;
      }
      
      .dark body, .dark html, .dark #root {
        background-color: ${darkGrayColor} !important;
      }
    `;
    
    // Add the style element to the head
    document.head.appendChild(style);
    
    // Also set individual CSS variables
    root.style.setProperty('--tg-theme-bg-color', darkGrayColor, 'important');
    root.style.setProperty('--tg-theme-secondary-bg-color', darkGraySecondaryColor, 'important');
    root.style.setProperty('--tg-theme-text-color', '#ffffff', 'important');
    root.style.setProperty('--tg-theme-hint-color', '#7d7d7d', 'important');
    root.style.setProperty('--tg-theme-link-color', '#64baff', 'important');
    root.style.setProperty('--tg-color-scheme', 'dark', 'important');
    
    // Apply the background color to all main elements
    document.body.style.backgroundColor = darkGrayColor;
    document.body.style.setProperty('background-color', darkGrayColor, 'important');
    
    if (document.getElementById('root')) {
      const rootElement = document.getElementById('root')!;
      rootElement.style.backgroundColor = darkGrayColor;
      rootElement.style.setProperty('background-color', darkGrayColor, 'important');
    }
    
    // Try to override Telegram's theme params if possible
    if (window.Telegram?.WebApp) {
      try {
        // This is a hack to try to override Telegram's theme
        const webApp = window.Telegram.WebApp as any;
        if (webApp._themeParams) {
          webApp._themeParams.bg_color = darkGrayColor;
          webApp._themeParams.secondary_bg_color = darkGraySecondaryColor;
        }
      } catch (e) {
        console.error("Error trying to override Telegram theme params:", e);
      }
    }
    
    console.log("Dark gray theme applied to Telegram mini app");
  } catch (error) {
    console.error("Error setting dark gray theme:", error);
  }
}

/**
 * Sync the app's theme with Telegram's theme
 */
export function syncTelegramTheme(): void {
  try {
    // Get CSS variables from Telegram theme
    const root = document.documentElement;
    
    // Set CSS variables for Telegram colors
    if (themeParams.backgroundColor) {
      root.style.setProperty('--tg-theme-bg-color', String(themeParams.backgroundColor));
    }
    
    if (themeParams.textColor) {
      root.style.setProperty('--tg-theme-text-color', String(themeParams.textColor));
    }
    
    if (themeParams.hintColor) {
      root.style.setProperty('--tg-theme-hint-color', String(themeParams.hintColor));
    }
    
    if (themeParams.linkColor) {
      root.style.setProperty('--tg-theme-link-color', String(themeParams.linkColor));
    }
    
    if (themeParams.buttonColor) {
      root.style.setProperty('--tg-theme-button-color', String(themeParams.buttonColor));
    }
    
    if (themeParams.buttonTextColor) {
      root.style.setProperty('--tg-theme-button-text-color', String(themeParams.buttonTextColor));
    }
    
    if (themeParams.secondaryBackgroundColor) {
      root.style.setProperty('--tg-theme-secondary-bg-color', String(themeParams.secondaryBackgroundColor));
    }
    
    // Set color scheme
    root.style.setProperty('--tg-color-scheme', themeParams.isDark ? 'dark' : 'light');
    
    console.log("Theme synchronized with Telegram");
  } catch (error) {
    console.error("Error syncing theme:", error);
  }
}

/**
 * Listen for theme changes from Telegram
 * @returns Cleanup function
 */
export function listenForThemeChanges(): () => void {
  try {
    const themeChangeHandler = () => {
      console.log("Theme changed, updating...");
      setThemeClass();
      syncTelegramTheme();
    };
    
    // Add event listener for theme changes
    window.addEventListener('themechange', themeChangeHandler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('themechange', themeChangeHandler);
    };
  } catch (error) {
    console.error("Error setting up theme change listener:", error);
    return () => {}; // Return empty cleanup function
  }
}

/**
 * Get the Telegram user data
 * @returns User data or null if not available
 */
export function getTelegramUser(): TelegramUser | null {
  try {
    console.log("Attempting to get Telegram user data...");
    
    // APPROACH 1: Use the official SDK method to retrieve launch parameters
    // try {
    //   const { initData, user } = retrieveLaunchParams();
      
    //   if (user) {
    //     console.log("User data found in launch parameters:", user);
        
    //     // Store in localStorage for future use
    //     try {
    //       localStorage.setItem('telegramUser', JSON.stringify(user));
    //     } catch (e) {
    //       console.error("Error storing user data in localStorage:", e);
    //     }
        
    //     return user as TelegramUser;
    //   } else {
    //     console.log("No user data in launch parameters");
    //   }
    // } catch (e) {
    //   console.error("Error retrieving launch parameters:", e);
    // }
    
    // APPROACH 2: Directly access window.Telegram.WebApp.initDataUnsafe
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      console.log("User data found in window.Telegram.WebApp.initDataUnsafe:", user);
      
      // Store in localStorage for future use
      try {
        localStorage.setItem('telegramUser', JSON.stringify(user));
      } catch (e) {
        console.error("Error storing user data in localStorage:", e);
      }
      
      return user as TelegramUser;
    }
    
    // APPROACH 3: Try to parse initData directly if it exists
    // if (window.Telegram?.WebApp?.initData) {
    //   try {
    //     const params = new URLSearchParams(window.Telegram.WebApp.initData);
    //     console.log('Parsed initData params:', Array.from(params.entries()));
        
    //     if (params.has('user')) {
    //       try {
    //         const userData = JSON.parse(decodeURIComponent(params.get('user') || '{}'));
    //         console.log('User data parsed from initData:', userData);
            
    //         // Store in localStorage for future use
    //         try {
    //           localStorage.setItem('telegramUser', JSON.stringify(userData));
    //         } catch (e) {
    //           console.error("Error storing user data in localStorage:", e);
    //         }
            
    //         return userData as TelegramUser;
    //       } catch (e) {
    //         console.error('Error parsing user data from initData:', e);
    //       }
    //     } else {
    //       console.log('No user param in initData');
    //     }
    //   } catch (e) {
    //     console.error('Error parsing initData:', e);
    //   }
    // }
    
    // APPROACH 4: Fallback to localStorage as a last resort
    // try {
    //   const storedUser = localStorage.getItem('telegramUser');
    //   if (storedUser) {
    //     const userData = JSON.parse(storedUser);
    //     console.log("Using stored user data from localStorage:", userData);
    //     return userData as TelegramUser;
    //   }
    // } catch (e) {
    //   console.error("Error retrieving user data from localStorage:", e);
    // }
    
    console.log("No Telegram user data available from any source");
    return null;
  } catch (error) {
    console.error("Error getting Telegram user:", error);
  return null;
  }
}

/**
 * Show the back button in the header
 * @param callback Function to call when back button is clicked
 */
export function showBackButton(callback: () => void): void {
  try {
    console.log("Showing back button");
    
    // First, make sure any existing handlers are removed
    try {
      backButton.offClick(() => {});
    } catch (e) {
      console.log("No existing back button handlers to remove");
    }
    
    // Set the callback first
    backButton.onClick(callback);
    
    // Then show the back button
    backButton.show();
    
    // Also try the direct WebApp API as fallback
    if (window.Telegram?.WebApp?.BackButton) {
      try {
        window.Telegram.WebApp.BackButton.onClick(callback);
        window.Telegram.WebApp.BackButton.show();
      } catch (e) {
        console.error("Error using direct WebApp API for back button:", e);
      }
    }
    
    console.log("Back button shown and callback registered");
  } catch (error) {
    console.error("Error showing back button:", error);
    
    // Try direct WebApp API as fallback
    if (window.Telegram?.WebApp?.BackButton) {
      try {
        window.Telegram.WebApp.BackButton.onClick(callback);
        window.Telegram.WebApp.BackButton.show();
        console.log("Back button shown using direct WebApp API");
      } catch (e) {
        console.error("Error using direct WebApp API for back button:", e);
      }
    }
  }
}

/**
 * Hide the back button in the header
 */
export function hideBackButton(): void {
  try {
    console.log("Hiding back button");
    
    // Hide the back button
    backButton.hide();
    
    // Also try the direct WebApp API as fallback
    if (window.Telegram?.WebApp?.BackButton) {
      try {
        window.Telegram.WebApp.BackButton.hide();
      } catch (e) {
        console.error("Error using direct WebApp API to hide back button:", e);
      }
    }
    
    console.log("Back button hidden");
  } catch (error) {
    console.error("Error hiding back button:", error);
    
    // Try direct WebApp API as fallback
    if (window.Telegram?.WebApp?.BackButton) {
      try {
        window.Telegram.WebApp.BackButton.hide();
        console.log("Back button hidden using direct WebApp API");
      } catch (e) {
        console.error("Error using direct WebApp API to hide back button:", e);
      }
    }
  }
}

/**
 * Show the main button at the bottom of the screen
 * @param text Button text
 * @param onClick Callback function
 * @param color Optional background color
 * @param textColor Optional text color
 */
export function showMainButton(
  text: string,
  onClick: () => void,
  color?: RGB,
  textColor?: RGB
): void {
  try {
    // Set button parameters
    const params: Record<string, any> = {
      text: text,
      isVisible: true
    };
    
    if (color) {
      params.backgroundColor = color;
    }
    
    if (textColor) {
      params.textColor = textColor;
    }
    
    // Update button with parameters
    mainButton.setParams(params);
    
    // Set click handler
    mainButton.onClick(onClick);
    
    console.log("Main button shown with text:", text);
  } catch (error) {
    console.error("Error showing main button:", error);
  }
}

/**
 * Hide the main button
 */
export function hideMainButton(): void {
  try {
    // Hide the button
    mainButton.setParams({ isVisible: false });
    
    console.log("Main button hidden");
  } catch (error) {
    console.error("Error hiding main button:", error);
  }
}

/**
 * Enable the main button
 */
export function enableMainButton(): void {
  try {
    mainButton.setParams({ isEnabled: true });
    console.log("Main button enabled");
  } catch (error) {
    console.error("Error enabling main button:", error);
  }
}

/**
 * Disable the main button
 */
export function disableMainButton(): void {
  try {
    mainButton.setParams({ isEnabled: false });
    console.log("Main button disabled");
  } catch (error) {
    console.error("Error disabling main button:", error);
  }
}

/**
 * Show loading indicator on the main button
 */
export function showMainButtonLoader(): void {
  try {
    mainButton.setParams({ isLoaderVisible: true });
    console.log("Main button loader shown");
  } catch (error) {
    console.error("Error showing main button loader:", error);
  }
}

/**
 * Hide loading indicator on the main button
 */
export function hideMainButtonLoader(): void {
  try {
    mainButton.setParams({ isLoaderVisible: false });
    console.log("Main button loader hidden");
  } catch (error) {
    console.error("Error hiding main button loader:", error);
  }
}

/**
 * Helper function to send haptic feedback events to Telegram
 * @param eventData The event data to send
 */
function sendHapticFeedbackEvent(eventData: Record<string, unknown>): void {
  try {
    const webApp = getTelegramWebApp();
    
    // Different ways to send events in different Telegram clients
    if (webApp?.postEvent) {
      webApp.postEvent('web_app_trigger_haptic_feedback', JSON.stringify(eventData));
    } else if (window.Telegram?.WebviewProxy?.postEvent) {
      window.Telegram.WebviewProxy.postEvent('web_app_trigger_haptic_feedback', JSON.stringify(eventData));
    } else if (window.TelegramWebviewProxy?.postEvent) {
      window.TelegramWebviewProxy.postEvent('web_app_trigger_haptic_feedback', JSON.stringify(eventData));
    } else {
      console.warn("No method available to send haptic feedback event");
    }
  } catch (error) {
    console.error("Error sending haptic feedback event:", error);
  }
}

/**
 * Trigger haptic feedback
 * @param style Feedback style
 */
export function triggerHapticFeedback(
  style: 'impact' | 'notification' | 'selection' = 'impact'
): void {
  try {
    // Try SDK method first
    try {
      switch (style) {
        case 'impact':
          hapticFeedback.impactOccurred('medium');
          break;
        case 'notification':
          hapticFeedback.notificationOccurred('success');
          break;
        case 'selection':
          hapticFeedback.selectionChanged();
          break;
        default:
          hapticFeedback.impactOccurred('medium');
      }
      console.log(`Haptic feedback triggered via SDK: ${style}`);
    } catch (sdkError) {
      console.warn("SDK haptic feedback failed, falling back to direct WebApp API:", sdkError);
      
      // Fallback to direct WebApp API
      switch (style) {
        case 'impact':
          sendHapticFeedbackEvent({ type: 'impact', impact_style: 'medium' });
          break;
        case 'notification':
          sendHapticFeedbackEvent({ type: 'notification', notification_type: 'success' });
          break;
        case 'selection':
          sendHapticFeedbackEvent({ type: 'selection_change' });
          break;
        default:
          sendHapticFeedbackEvent({ type: 'impact', impact_style: 'medium' });
      }
      console.log(`Haptic feedback triggered via WebApp API: ${style}`);
    }
  } catch (error) {
    console.error("Error triggering haptic feedback:", error);
  }
}

/**
 * Trigger haptic impact feedback
 * @param style Impact style
 */
export const hapticImpact = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): void => {
  try {
    // Try SDK method first
    try {
      hapticFeedback.impactOccurred(style);
      console.log(`Haptic impact triggered via SDK: ${style}`);
    } catch (sdkError) {
      console.warn("SDK haptic impact failed, falling back to direct WebApp API:", sdkError);
      
      // Fallback to direct WebApp API
      sendHapticFeedbackEvent({ type: 'impact', impact_style: style });
      console.log(`Haptic impact triggered via WebApp API: ${style}`);
    }
  } catch (error) {
    console.error("Error triggering haptic impact:", error);
  }
};

/**
 * Trigger haptic notification feedback
 * @param type Notification type
 */
export const hapticNotification = (type: 'error' | 'success' | 'warning' = 'success'): void => {
  try {
    // Try SDK method first
    try {
      hapticFeedback.notificationOccurred(type);
      console.log(`Haptic notification triggered via SDK: ${type}`);
    } catch (sdkError) {
      console.warn("SDK haptic notification failed, falling back to direct WebApp API:", sdkError);
      
      // Fallback to direct WebApp API
      sendHapticFeedbackEvent({ type: 'notification', notification_type: type });
      console.log(`Haptic notification triggered via WebApp API: ${type}`);
    }
  } catch (error) {
    console.error("Error triggering haptic notification:", error);
  }
};

/**
 * Trigger haptic selection feedback
 */
export const hapticSelection = (): void => {
  try {
    // Try SDK method first
    try {
      hapticFeedback.selectionChanged();
      console.log("Haptic selection triggered via SDK");
    } catch (sdkError) {
      console.warn("SDK haptic selection failed, falling back to direct WebApp API:", sdkError);
      
      // Fallback to direct WebApp API
      sendHapticFeedbackEvent({ type: 'selection_change' });
      console.log("Haptic selection triggered via WebApp API");
    }
  } catch (error) {
    console.error("Error triggering haptic selection:", error);
  }
};

/**
 * Send data to the Telegram bot
 * @param data Data to send
 */
export async function sendDataToBot(data: any): Promise<void> {
  try {
    // Convert data to string if it's an object
    const dataToSend = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Use the WebApp API directly since the SDK doesn't expose sendData
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(dataToSend);
      console.log("Data sent to bot:", dataToSend);
    } else {
      throw new Error("Telegram WebApp is not available");
    }
  } catch (error) {
    console.error("Error sending data to bot:", error);
    throw error;
  }
}

/**
 * Close the WebApp
 */
export function closeWebApp(): void {
  try {
    miniApp.close();
    console.log("WebApp closed");
  } catch (error) {
    console.error("Error closing WebApp:", error);
  }
}

/**
 * Request the current theme from Telegram
 * This will trigger a theme_changed event with the current theme
 */
export function requestTelegramTheme(): void {
  try {
    console.log("Requesting current theme from Telegram");
    
    // Try the SDK method first (avoiding update method that doesn't exist)
    try {
      // Read the current theme params - this will trigger a refresh in some SDK versions
      const isDark = themeParams.isDark;
      console.log("Using current theme params, isDark:", isDark);
      return;
    } catch (sdkError) {
      console.warn("SDK theme params access failed, trying fallback method:", sdkError);
    }
    
    // Fallback to direct WebApp API
    const webApp = getTelegramWebApp();
    if (!webApp) {
      console.warn("Telegram WebApp is not available, can't request theme");
      return;
    }
    
    // Check if postEvent is available and is a function
    if (typeof webApp.postEvent !== 'function') {
      console.warn("postEvent is not available in this Telegram client");
      // Just use the current theme params instead of trying to update
      setTelegramColors();
      return;
    }
    
    // Try to request theme using postEvent
    try {
      webApp.postEvent("web_app_request_theme");
      console.log("Theme request sent successfully");
    } catch (postEventError) {
      console.warn("Error requesting theme using postEvent:", postEventError);
      // Just use the current theme params instead
      setTelegramColors();
    }
  } catch (error) {
    console.error("Error requesting Telegram theme:", error);
    // Ensure we at least have some colors set
    setTelegramColors();
  }
}

/**
 * Setup theme change listener for instant theme updates
 * This should be called once when the app initializes
 * @returns Cleanup function to remove the listener
 */
export function setupThemeChangeListener(): () => void {
  console.log("Setting up theme change listener for instant updates");
  
  // Function to handle theme changes
  const handleThemeChange = () => {
    console.log("Theme change detected, updating colors and styles");
    setThemeClass();
    setTelegramColors();
  };
  
  // Get the WebApp instance
  const webApp = getTelegramWebApp();
  
  if (webApp) {
    try {
      // Use Telegram's onEvent method for theme changes
      webApp.onEvent('themeChanged', handleThemeChange);
      
      // Also listen for the standard themechange event as backup
      window.addEventListener('themechange', handleThemeChange);
      
      // Return cleanup function
      return () => {
        try {
          webApp.offEvent('themeChanged', handleThemeChange);
        } catch (e) {
          console.warn("Error removing Telegram theme listener:", e);
        }
        window.removeEventListener('themechange', handleThemeChange);
      };
    } catch (error) {
      console.error("Error setting up Telegram event listener:", error);
      
      // Fallback to just window event listener
      window.addEventListener('themechange', handleThemeChange);
      return () => {
        window.removeEventListener('themechange', handleThemeChange);
      };
    }
  }
  
  // If no WebApp, just use window event
  window.addEventListener('themechange', handleThemeChange);
  return () => {
    window.removeEventListener('themechange', handleThemeChange);
  };
}

/**
 * Set the Telegram Mini App header and background colors based on the user's Telegram theme
 * Uses the official Telegram Mini Apps methods and applies Telegram's actual theme colors
 */
export function setTelegramColors(): void {
  try {
    console.log("Setting Telegram Mini App colors based on Telegram's native theme");
    
    // Get the WebApp instance
    const webApp = getTelegramWebApp();
    
    // Get theme colors from WebApp or SDK
    let bgColor: RGB;
    let secondaryBgColor: RGB;
    let textColor: RGB;
    let hintColor: RGB;
    let linkColor: RGB;
    let buttonColor: RGB;
    let buttonTextColor: RGB;
    let isDark: boolean;
    
    if (webApp) {
      console.log("WebApp theme params:", webApp.themeParams);
      
      // Use Telegram's native theme parameters directly
      bgColor = (webApp.themeParams?.bg_color || (webApp.colorScheme === 'dark' ? '#271a28' : '#ffffff')) as RGB;
      secondaryBgColor = (webApp.themeParams?.secondary_bg_color || (webApp.colorScheme === 'dark' ? '#382639' : '#f7f7f7')) as RGB;
      textColor = (webApp.themeParams?.text_color || (webApp.colorScheme === 'dark' ? '#ffffff' : '#000000')) as RGB;
      hintColor = (webApp.themeParams?.hint_color || (webApp.colorScheme === 'dark' ? '#7d7d7d' : '#999999')) as RGB;
      linkColor = (webApp.themeParams?.link_color || (webApp.colorScheme === 'dark' ? '#64baff' : '#2481cc')) as RGB;
      buttonColor = (webApp.themeParams?.button_color || (webApp.colorScheme === 'dark' ? '#3390ec' : '#2481cc')) as RGB;
      buttonTextColor = (webApp.themeParams?.button_text_color || '#ffffff') as RGB;
      isDark = webApp.colorScheme === 'dark';
      
      console.log("Using native Telegram theme colors:", {
        bgColor,
        secondaryBgColor,
        textColor,
        hintColor,
        linkColor,
        buttonColor,
        buttonTextColor,
        isDark
      });
      
      // IMPORTANT: Set the header color to match the frontend background color (secondaryBgColor)
      // This ensures the Telegram miniapp border matches our app's background
      try {
        // Try multiple approaches to set the header color
        
        // Approach 1: Try using direct WebApp method if available
        if (webApp.setHeaderColor) {
          webApp.setHeaderColor(secondaryBgColor);
          console.log("Header color set using WebApp.setHeaderColor:", secondaryBgColor);
        } 
        // Approach 2: Use postEvent method
        else {
          webApp.postEvent('web_app_set_header_color', JSON.stringify({
            color: secondaryBgColor
          }));
          console.log("Header color set using postEvent:", secondaryBgColor);
        }
        
        // Approach 3: Try using global Telegram object directly
        if (window.Telegram?.WebApp) {
          const globalWebApp = window.Telegram.WebApp;
          // @ts-ignore - Ignore TypeScript errors for direct access
          if (typeof globalWebApp.setHeaderColor === 'function') {
            // @ts-ignore
            globalWebApp.setHeaderColor(secondaryBgColor);
            console.log("Header color set using global Telegram.WebApp.setHeaderColor");
          }
        }
      } catch (error) {
        console.error("Error setting header color:", error);
        
        // Fallback: Try using color_key instead of direct color
        try {
          if (window.Telegram?.WebApp) {
            // @ts-ignore
            if (typeof window.Telegram.WebApp.setHeaderColor === 'function') {
              // @ts-ignore
              window.Telegram.WebApp.setHeaderColor('secondary_bg_color');
              console.log("Header color set using color_key: secondary_bg_color");
            }
          }
        } catch (e) {
          console.error("All attempts to set header color failed:", e);
        }
      }
      
      // Set the background color to match the secondary background color
      try {
        if (webApp.setBackgroundColor) {
          webApp.setBackgroundColor(secondaryBgColor);
          console.log("Background color set using WebApp.setBackgroundColor:", secondaryBgColor);
        } else {
          webApp.postEvent('web_app_set_background_color', JSON.stringify({
            color: secondaryBgColor
          }));
          console.log("Background color set using postEvent:", secondaryBgColor);
        }
      } catch (error) {
        console.error("Error setting background color:", error);
      }
    } else {
      // Fallback to SDK
      console.log("WebApp not available, using SDK theme params");
      
      // Use SDK theme params with exact color for dark mode
      bgColor = (themeParams.backgroundColor || (themeParams.isDark ? '#271a28' : '#ffffff')) as RGB;
      secondaryBgColor = (themeParams.secondaryBackgroundColor || (themeParams.isDark ? '#382639' : '#f7f7f7')) as RGB;
      textColor = (themeParams.textColor || (themeParams.isDark ? '#ffffff' : '#000000')) as RGB;
      hintColor = (themeParams.hintColor || (themeParams.isDark ? '#7d7d7d' : '#999999')) as RGB;
      linkColor = (themeParams.linkColor || (themeParams.isDark ? '#64baff' : '#2481cc')) as RGB;
      buttonColor = (themeParams.buttonColor || (themeParams.isDark ? '#3390ec' : '#2481cc')) as RGB;
      buttonTextColor = (themeParams.buttonTextColor || '#ffffff') as RGB;
      isDark = !!themeParams.isDark;
      
      console.log("Using SDK theme colors:", {
        bgColor,
        secondaryBgColor,
        textColor,
        hintColor,
        linkColor,
        buttonColor,
        buttonTextColor,
        isDark
      });
      
      // Apply colors to Telegram Mini App header and background using SDK
      try {
        import('@telegram-apps/sdk').then(({ postEvent }) => {
          // IMPORTANT: Set header color to match the frontend background color
          // Use direct color value instead of color_key to ensure exact match
          postEvent('web_app_set_header_color', { color: secondaryBgColor });
          console.log("Header color set to match frontend background:", secondaryBgColor, "via SDK");
          
          // Set background color to match the secondary background color
          postEvent('web_app_set_background_color', { color: secondaryBgColor });
          console.log("Background color set to:", secondaryBgColor, "via SDK");
        }).catch(e => {
          console.error("Error importing SDK for postEvent:", e);
        });
      } catch (error) {
        console.error("Error setting colors via SDK:", error);
      }
    }
    
    // Apply theme CSS based on Telegram's colors
    applyTelegramThemeCSS(
      secondaryBgColor, // Main app background uses secondaryBgColor
      textColor,
      hintColor,
      linkColor,
      buttonColor,
      buttonTextColor,
      secondaryBgColor, // IMPORTANT: Use secondaryBgColor for UI elements too
      isDark
    );
    
    // Request the theme again to ensure we have the latest
    requestTelegramTheme();
  } catch (error) {
    console.error("Error setting Telegram colors:", error);
  }
}

/**
 * Apply theme CSS based on Telegram's colors
 */
function applyTelegramThemeCSS(
  mainBgColor: RGB,
  textColor: RGB,
  hintColor: RGB,
  linkColor: RGB,
  buttonColor: RGB,
  buttonTextColor: RGB,
  headerBgColor: RGB,
  isDark: boolean | undefined
): void {
  try {
    // Ensure isDark is a boolean
    const isThemeDark = isDark === true;
    
    // Force theme background color for consistency
    const forcedMainBgColor = mainBgColor;
    const forcedHeaderBgColor = headerBgColor;
    
    console.log(`Applying ${isThemeDark ? 'dark' : 'light'} theme CSS with Telegram colors`);
    console.log(`Using main background color: ${forcedMainBgColor}`);
    console.log(`Using header background color: ${forcedHeaderBgColor}`);
    
    // Get the root element
    const root = document.documentElement;
    
    // Set theme class
    if (isThemeDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    root.classList.add('telegram-webview');
    
    // Set CSS variables for Telegram colors - use !important to override any other styles
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --tg-theme-bg-color: ${forcedHeaderBgColor} !important;
        --tg-theme-secondary-bg-color: ${forcedMainBgColor} !important;
        --tg-theme-text-color: ${textColor} !important;
        --tg-theme-hint-color: ${hintColor} !important;
        --tg-theme-link-color: ${linkColor} !important;
        --tg-theme-button-color: ${buttonColor} !important;
        --tg-theme-button-text-color: ${buttonTextColor} !important;
        --tg-color-scheme: ${isThemeDark ? 'dark' : 'light'} !important;
        
        --telegram-bg: ${forcedMainBgColor} !important;
        --telegram-header-bg: ${forcedHeaderBgColor} !important;
        --telegram-secondary-bg: ${forcedHeaderBgColor} !important;
        --telegram-text: ${textColor} !important;
        --telegram-hint: ${hintColor} !important;
        --telegram-link: ${linkColor} !important;
        --telegram-button: ${buttonColor} !important;
        --telegram-button-text: ${buttonTextColor} !important;
      }
      
      body, html, #root {
        background-color: ${forcedMainBgColor} !important;
        color: ${textColor} !important;
      }
      
      .${isThemeDark ? 'dark' : 'light'} body, .${isThemeDark ? 'dark' : 'light'} html, .${isThemeDark ? 'dark' : 'light'} #root {
        background-color: ${forcedMainBgColor} !important;
      }
      
      /* Apply colors to common UI elements */
      .card, .popover, .dropdown-menu, .card-container {
        background-color: ${forcedHeaderBgColor} !important;
        color: ${textColor} !important;
        border: 1px solid ${isThemeDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} !important;
      }
      
      a {
        color: ${linkColor} !important;
      }
      
      .hint, .text-muted {
        color: ${hintColor} !important;
      }
      
      .btn-primary, .button-primary {
        background-color: ${buttonColor} !important;
        color: ${buttonTextColor} !important;
      }
      
      /* Search inputs and form controls */
      input, select, textarea {
        background-color: ${forcedMainBgColor} !important;
        color: ${textColor} !important;
        border-color: ${hintColor}30 !important;
      }
      
      input:focus, select:focus, textarea:focus {
        border-color: ${buttonColor} !important;
        box-shadow: 0 0 0 2px ${buttonColor}30 !important;
      }
      
      /* Size selector buttons */
      .size-button {
        background-color: ${forcedMainBgColor} !important;
        color: ${textColor} !important;
        border-color: ${hintColor}30 !important;
      }
      
      .size-button.selected {
        background-color: ${buttonColor}10 !important;
        color: ${buttonColor} !important;
        border-color: ${buttonColor} !important;
      }
      
      /* Bottom navigation bar - solid color matching the secondary background color */
      .bottom-nav-bar {
        background-color: ${forcedHeaderBgColor} !important;
        /* Remove border and shadow */
        border-top: none !important;
        box-shadow: none !important;
        /* Add a subtle top border for separation */
        border-top: 1px solid ${isThemeDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} !important;
      }
      
      /* Bottom navigation items */
      .bottom-nav-bar a {
        color: ${hintColor} !important;
        padding: 8px 0 !important;
        transition: all 0.2s ease !important;
      }
      
      /* Active navigation items */
      .bottom-nav-bar a.active, 
      .bottom-nav-bar a.active svg,
      .bottom-nav-bar a[aria-current="page"],
      .bottom-nav-bar a[aria-current="page"] svg {
        color: ${buttonColor} !important;
      }
      
      /* Navigation item hover effect */
      .bottom-nav-bar a:hover {
        color: ${buttonColor}CC !important;
        transform: translateY(-2px) !important;
      }
      
      /* Badge styling */
      .bottom-nav-bar .badge {
        background-color: ${buttonColor} !important;
        color: ${buttonTextColor} !important;
      }
      
      /* Force styles for desktop view */
      @media (min-width: 768px) {
        body, html, #root, .telegram-webview, .dark body, .dark html, .dark #root {
          background-color: ${forcedMainBgColor} !important;
        }
        
        .bottom-nav-bar, .dark .bottom-nav-bar {
          background-color: ${forcedHeaderBgColor} !important;
          border-top: none !important;
          box-shadow: none !important;
        }
      }
    `;
    
    // Remove any previous style element we added
    const previousStyle = document.getElementById('telegram-theme-style');
    if (previousStyle) {
      previousStyle.remove();
    }
    
    // Add ID to the style element for easy reference
    style.id = 'telegram-theme-style';
    
    // Add the style element to the head
    document.head.appendChild(style);
    
    // Also set individual CSS variables
    root.style.setProperty('--tg-theme-bg-color', forcedHeaderBgColor, 'important');
    root.style.setProperty('--tg-theme-secondary-bg-color', forcedMainBgColor, 'important');
    root.style.setProperty('--tg-theme-text-color', textColor, 'important');
    root.style.setProperty('--tg-theme-hint-color', hintColor, 'important');
    root.style.setProperty('--tg-theme-link-color', linkColor, 'important');
    root.style.setProperty('--tg-theme-button-color', buttonColor, 'important');
    root.style.setProperty('--tg-theme-button-text-color', buttonTextColor, 'important');
    root.style.setProperty('--tg-color-scheme', isThemeDark ? 'dark' : 'light', 'important');
    
    // Apply the background color to all main elements
    document.body.style.backgroundColor = forcedMainBgColor;
    document.body.style.setProperty('background-color', forcedMainBgColor, 'important');
    document.body.style.color = textColor;
    document.body.style.setProperty('color', textColor, 'important');
    
    if (document.getElementById('root')) {
      const rootElement = document.getElementById('root')!;
      rootElement.style.backgroundColor = forcedMainBgColor;
      rootElement.style.setProperty('background-color', forcedMainBgColor, 'important');
    }
    
    // Apply styles to bottom navigation bar directly if it exists
    const bottomNavBar = document.querySelector('.bottom-nav-bar');
    if (bottomNavBar) {
      (bottomNavBar as HTMLElement).style.backgroundColor = forcedHeaderBgColor;
      (bottomNavBar as HTMLElement).style.setProperty('background-color', forcedHeaderBgColor, 'important');
      // Remove backdrop filter
      (bottomNavBar as HTMLElement).style.backdropFilter = 'none';
      (bottomNavBar as HTMLElement).style.setProperty('-webkit-backdrop-filter', 'none', 'important');
      // Remove border and shadow
      (bottomNavBar as HTMLElement).style.borderTop = 'none';
      (bottomNavBar as HTMLElement).style.setProperty('border-top', 'none', 'important');
      (bottomNavBar as HTMLElement).style.boxShadow = 'none';
      (bottomNavBar as HTMLElement).style.setProperty('box-shadow', 'none', 'important');
    }
    
    // Force background color on html element too
    document.documentElement.style.backgroundColor = forcedMainBgColor;
    document.documentElement.style.setProperty('background-color', forcedMainBgColor, 'important');
    
    console.log(`${isThemeDark ? 'Dark' : 'Light'} theme CSS applied with Telegram colors`);
  } catch (error) {
    console.error("Error applying theme CSS:", error);
  }
}

/**
 * Open URL directly in Telegram WebApp
 * This bypasses the confirmation dialog and opens the URL within Telegram
 * @param url URL to open
 */
export function openTelegramUrl(url: string): void {
  try {
    console.log("Opening URL in Telegram:", url);
    
    // Get the WebApp instance
    const webApp = getTelegramWebApp();
    
    if (webApp) {
      // Use Telegram's openLink method if available (newer versions)
      if (typeof webApp.openLink === 'function') {
        webApp.openLink(url, { try_instant_view: true });
        console.log("URL opened using WebApp.openLink");
        return;
      }
    }
    
    // Fallback to global Telegram.WebApp
    if (window.Telegram?.WebApp) {
      const globalWebApp = window.Telegram.WebApp;
      // @ts-ignore - Some versions might have this method
      if (typeof globalWebApp.openLink === 'function') {
        // @ts-ignore
        globalWebApp.openLink(url, { try_instant_view: true });
        console.log("URL opened using global Telegram.WebApp.openLink");
        return;
      }
    }
    
    // If all else fails, just open in a new tab
    console.warn("No Telegram-specific method available to open URL, falling back to window.open");
    window.open(url, '_blank');
  } catch (error) {
    console.error("Error opening URL in Telegram:", error);
    // Fallback to regular open
    window.open(url, '_blank');
  }
}

/**
 * Request fullscreen mode using Telegram's official API (Bot API 8.0+)
 */
export function requestFullscreen(): void {
  try {
    const webApp = getTelegramWebApp();
    if (webApp && webApp.requestFullscreen) {
      console.log("Requesting fullscreen mode...");
      webApp.requestFullscreen();
    } else {
      console.warn("Telegram fullscreen API not available");
    }
  } catch (error) {
    console.error("Error requesting fullscreen:", error);
  }
}

/**
 * Exit fullscreen mode using Telegram's official API (Bot API 8.0+)
 */
export function exitFullscreen(): void {
  try {
    const webApp = getTelegramWebApp();
    if (webApp && webApp.exitFullscreen) {
      console.log("Exiting fullscreen mode...");
      webApp.exitFullscreen();
    } else {
      console.warn("Telegram fullscreen API not available");
    }
  } catch (error) {
    console.error("Error exiting fullscreen:", error);
  }
}

/**
 * Check if the app is currently in fullscreen mode
 */
export function isFullscreen(): boolean {
  try {
    const webApp = getTelegramWebApp();
    return webApp?.isFullscreen ?? false;
  } catch (error) {
    console.error("Error checking fullscreen status:", error);
    return false;
  }
}

/**
 * Check if the app is currently active (not minimized)
 */
export function isAppActive(): boolean {
  try {
    const webApp = getTelegramWebApp();
    return webApp?.isActive ?? true;
  } catch (error) {
    console.error("Error checking app active status:", error);
    return true;
  }
}

/**
 * Get the safe area insets for the device
 */
export function getSafeAreaInset(): { top: number; bottom: number; left: number; right: number } | null {
  try {
    const webApp = getTelegramWebApp();
    return webApp?.safeAreaInset ?? null;
  } catch (error) {
    console.error("Error getting safe area inset:", error);
    return null;
  }
}

/**
 * Get the content safe area insets
 */
export function getContentSafeAreaInset(): { top: number; bottom: number; left: number; right: number } | null {
  try {
    const webApp = getTelegramWebApp();
    return webApp?.contentSafeAreaInset ?? null;
  } catch (error) {
    console.error("Error getting content safe area inset:", error);
    return null;
  }
}

/**
 * Set up fullscreen event listeners
 * @param onFullscreenChange - Callback for when fullscreen state changes
 * @param onFullscreenFailed - Callback for when fullscreen request fails
 * @param onActivated - Callback for when app is activated
 * @param onDeactivated - Callback for when app is deactivated
 */
export function setupFullscreenEventListeners(
  onFullscreenChange?: (isFullscreen: boolean) => void,
  onFullscreenFailed?: () => void,
  onActivated?: () => void,
  onDeactivated?: () => void
): () => void {
  try {
    const webApp = getTelegramWebApp();
    if (!webApp) {
      console.warn("Telegram WebApp not available for event listeners");
      return () => {};
    }

    const handlers: Array<{ event: TelegramEventType; handler: () => void }> = [];

    if (onFullscreenChange) {
      const handler = () => onFullscreenChange(webApp.isFullscreen ?? false);
      webApp.onEvent('fullscreenChanged', handler);
      handlers.push({ event: 'fullscreenChanged', handler });
    }

    if (onFullscreenFailed) {
      webApp.onEvent('fullscreenFailed', onFullscreenFailed);
      handlers.push({ event: 'fullscreenFailed', handler: onFullscreenFailed });
    }

    if (onActivated) {
      webApp.onEvent('activated', onActivated);
      handlers.push({ event: 'activated', handler: onActivated });
    }

    if (onDeactivated) {
      webApp.onEvent('deactivated', onDeactivated);
      handlers.push({ event: 'deactivated', handler: onDeactivated });
    }

    // Return cleanup function
    return () => {
      handlers.forEach(({ event, handler }) => {
        webApp.offEvent(event, handler);
      });
    };
  } catch (error) {
    console.error("Error setting up fullscreen event listeners:", error);
    return () => {};
  }
}
