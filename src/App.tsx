
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { CartProvider } from "./contexts/CartContext";
import { useEffect } from "react";
import { initTelegramWebApp } from "./utils/telegramUtils";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component to initialize Telegram WebApp
const TelegramInitializer = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Telegram WebApp
    initTelegramWebApp();

    // Check if we need to handle any Telegram-specific routing
    const handleTelegramRouting = () => {
      // Example: If opened directly to a specific path from Telegram
      // This is just an example - modify according to your actual needs
      if (location.pathname === "/telegram-start") {
        navigate("/");
      }
    };

    handleTelegramRouting();
  }, [location, navigate]);

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <CartProvider>
          <Toaster />
          <Sonner position="top-center" />
          <BrowserRouter>
            <TelegramInitializer>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TelegramInitializer>
          </BrowserRouter>
        </CartProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
