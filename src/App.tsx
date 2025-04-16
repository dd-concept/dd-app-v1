import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { 
  initTelegramWebApp, 
  getTelegramUser, 
  showBackButton, 
  hideBackButton,
  syncTelegramTheme,
  listenForThemeChanges,
  setThemeClass,
  setDarkGrayTheme,
  setTelegramColors,
  requestTelegramTheme,
  setupThemeChangeListener
} from "./utils/telegramUtils";
import { checkUserExists /*, getUserRank*/ } from "./services/api";
import { toast } from "sonner";
import useReferral from "./hooks/useReferral";
import useRegistration from "./hooks/useRegistration";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import DeliveryCalculator from "./pages/DeliveryCalculator";
import Settings from "./pages/Settings";

// Create a simple mock for useTelegram if the actual module is not available
const useTelegram = () => {
  return {
    tg: window.Telegram?.WebApp,
    initWebApp: () => {
      console.log("Mock initWebApp called");
      if (window.Telegram?.WebApp) {
        // Use type assertion to avoid TypeScript errors
        (window.Telegram.WebApp as any).ready?.();
      }
    },
    getUserData: () => {
      console.log("Mock getUserData called");
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return window.Telegram.WebApp.initDataUnsafe.user;
      }
      
      // Try to get from localStorage as fallback
      try {
        const storedUser = localStorage.getItem('telegramUser');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      } catch (e) {
        console.error("Error retrieving user data from localStorage:", e);
      }
      
      return null;
    }
  };
};

// Create a persistent query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time, formerly cacheTime)
    },
  },
});

// Component to initialize Telegram WebApp
const TelegramInitializer = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateTelegramUser } = useUser();
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Import the useTelegram hook
  const { tg, initWebApp, getUserData } = useTelegram();
  
  // Initialize the referral system
  const { referralCode, isProcessing: isProcessingReferral } = useReferral();
  
  // Check user registration status
  const { isNewUser } = useRegistration({
    onNewUser: (isNew) => {
      if (isNew && referralCode) {
        console.log(`New user registered with referral code: ${referralCode}`);
        toast.success('Добро пожаловать! Вас пригласил друг.');
      }
    }
  });

  // Setup theme change listener for instant theme updates
  useEffect(() => {
    // Setup the theme change listener
    const cleanupThemeListener = setupThemeChangeListener();
    
    // Clean up when component unmounts
    return () => {
      cleanupThemeListener();
    };
  }, []);

  // Check user existence in the API
  const checkUserInAPI = useCallback(async () => {
    try {
      const userExists = await checkUserExists();
      console.log("API user check result:", userExists);
      
      if (userExists) {
        // If user exists, also get their rank
        // const rank = await getUserRank();
        // console.log("User rank:", rank);
      } else {
        console.log("User does not exist in the system yet");
      }
    } catch (error) {
      console.error("Error checking user in API:", error);
    }
  }, []);

  // Handle navigation to valid routes
  const handleNavigation = useCallback(() => {
    const validRoutes = ["/", "/shop", "/profile", "/cart", "/calculator", "/settings"];
    const isProductRoute = location.pathname.startsWith("/product/");
    
    // Check if the path contains Telegram WebApp data
    const isTelegramWebAppDataPath = location.pathname.includes("tgWebAppData=") || 
                                    location.search.includes("tgWebAppData=");
    
    if (isTelegramWebAppDataPath) {
      console.log("Detected Telegram WebApp data in URL, redirecting to home and preserving data");
      // Don't navigate away, we'll handle the data in initializeTelegram
      return true;
    }
    
    if (!validRoutes.includes(location.pathname) && !isProductRoute) {
      console.log("Redirecting to home from invalid path:", location.pathname);
      navigate("/", { replace: true });
      return false;
    }
    return true;
  }, [location.pathname, location.search, navigate]);

  // Initialize Telegram WebApp
  const initializeTelegram = useCallback(async () => {
    if (initialized) return;
    
    // Check if navigation is needed first
    if (!handleNavigation()) return;
    
    console.log("Initializing Telegram interface...");
    
    // Check if we're in Telegram
    const isTelegramBrowser = navigator.userAgent.toLowerCase().includes('telegram') || 
                             window.location.href.includes('tgwebapp');
    
    if (isTelegramBrowser) {
      console.log("Running in Telegram browser");
    } else {
      console.log("Not running in Telegram browser");
    }
    
    // Check if we have tgWebAppData in the URL
    const hasTgWebAppData = window.location.href.includes('tgWebAppData=');
    if (hasTgWebAppData) {
      console.log("Found tgWebAppData in URL, this is a direct launch from Telegram");
    }
    
    try {
      // CRITICAL: Initialize the WebApp FIRST using the direct method
      if (tg) {
        // Initialize using the useTelegram hook
        initWebApp();
        
        // Apply Telegram colors based on user's theme
        setTelegramColors();
        
        // Request the current theme to ensure we have the latest
        requestTelegramTheme();
        
        // Wait a moment for Telegram to initialize
        // This is important for Mini Apps to receive initData
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try to get user data using the useTelegram hook
        const userData = getUserData();
        
        if (userData) {
          console.log("User data retrieved:", userData);
          updateTelegramUser(userData);
          
          // Check if user exists in the API system
          await checkUserInAPI();
          
          // If we have tgWebAppData in the URL, navigate to home to clean up the URL
          if (hasTgWebAppData && location.pathname !== '/') {
            console.log("Navigating to home to clean up URL");
            navigate('/', { replace: true });
          }
          
          setInitialized(true);
          setIsLoading(false);
        } else if (isTelegramBrowser) {
          console.log("No user data available despite being in Telegram browser");
          
          // Try one more time after a delay
          // This is sometimes necessary as Telegram might not provide the data immediately
          setTimeout(() => {
            const retryUserData = getUserData();
            if (retryUserData) {
              console.log("User data retrieved after delay:", retryUserData);
              updateTelegramUser(retryUserData);
              
              // If we have tgWebAppData in the URL, navigate to home to clean up the URL
              if (hasTgWebAppData && location.pathname !== '/') {
                console.log("Navigating to home to clean up URL");
                navigate('/', { replace: true });
              }
            } else {
              console.log("Still no user data after retry. This might indicate:");
              console.log("1. The Mini App is not properly configured in BotFather");
              console.log("2. The user is not using the official Telegram app");
              console.log("3. There's an issue with the initData validation");
              
              // Try to use localStorage as a last resort
              try {
                const storedUser = localStorage.getItem('telegramUser');
                if (storedUser) {
                  const parsedUser = JSON.parse(storedUser);
                  console.log("Using stored user data from localStorage:", parsedUser);
                  updateTelegramUser(parsedUser);
                }
              } catch (e) {
                console.error("Error retrieving user data from localStorage:", e);
              }
            }
            setInitialized(true); // Mark as initialized anyway to prevent further attempts
            setIsLoading(false);
          }, 800);
        } else {
          console.log("Not in Telegram browser, continuing without user data");
          setInitialized(true);
          setIsLoading(false);
        }
      } else {
        // Fallback to the old method if tg is not available
        console.log("Telegram WebApp is not available, using fallback method");
        initTelegramWebApp();
        
        // Apply Telegram colors based on user's theme
        setTelegramColors();
        
        // Wait a moment for Telegram to initialize
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try to get user data using the old method
        const userData = getTelegramUser();
        
        if (userData) {
          console.log("User data retrieved using fallback method:", userData);
          updateTelegramUser(userData);
        }
        
        setInitialized(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during Telegram initialization:", error);
      setInitialized(true); // Mark as initialized to prevent further attempts
      setIsLoading(false);
    }
  }, [initialized, handleNavigation, updateTelegramUser, navigate, location.pathname, tg, initWebApp, getUserData]);

  // Handle back button functionality
  useEffect(() => {
    // Only show back button if not on home page
    if (location.pathname !== '/') {
      console.log("Showing back button for path:", location.pathname);
      showBackButton(() => {
        console.log("Back button pressed, navigating back");
        navigate(-1); // Go back to previous page
      });
    } else {
      console.log("Hiding back button for home page");
      hideBackButton();
    }
    
    // Clean up when component unmounts
    return () => {
      hideBackButton();
    };
  }, [location.pathname, navigate]);

  // Listen for theme changes
  useEffect(() => {
    console.log("Setting up theme change listener");
    
    // Request the theme from Telegram
    requestTelegramTheme();
    
    // Apply Telegram colors based on user's theme
    setTelegramColors();
    
    // Set up listener that will adapt to theme changes
    const themeChangeHandler = () => {
      console.log("Theme change detected, adapting to user theme");
      setTelegramColors();
    };
    
    // Add event listener for theme changes
    window.addEventListener('themechange', themeChangeHandler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('themechange', themeChangeHandler);
    };
  }, []);

  useEffect(() => {
    initializeTelegram().finally(() => {
      // Set loading to false after initialization completes (success or failure)
      setIsLoading(false);
    });
  }, [initializeTelegram]);

  // Handle route changes
  useEffect(() => {
    handleNavigation();
  }, [location.pathname, handleNavigation]);

  // Show nothing while loading to prevent 404 page flash
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-telegram-blue"></div>
    </div>;
  }

  return children;
};

// Main App component
const App = () => {
  // Ensure we're using HashRouter for GitHub Pages compatibility
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <UserProvider>
            <CartProvider>
              <Toaster richColors closeButton position="top-center" />
              <HashRouter>
                <TelegramInitializer>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:productId" element={<ProductDetails />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/calculator" element={<DeliveryCalculator />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TelegramInitializer>
              </HashRouter>
            </CartProvider>
          </UserProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
