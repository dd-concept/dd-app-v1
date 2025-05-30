import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Calculator, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from 'next-themes';
import { hapticSelection } from '@/utils/telegramUtils';
import { scrollToTop, scrollToTopWithRetries } from '@/utils/scrollUtils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { theme } = useTheme();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Custom navigation handler with haptic feedback and scroll to top
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Only trigger haptic feedback and navigate if not already on this path
    if (!isActive(path)) {
      // Trigger haptic feedback
      hapticSelection();
      
      // Force scroll to top immediately
      scrollToTop();
      
      // Navigate to the path
      navigate(path);
      
      // Try scrolling again after navigation with delays
      [50, 100, 200].forEach(delay => {
        setTimeout(scrollToTop, delay);
      });
    }
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-bar pb-4">
      <div className="grid grid-cols-4 w-full max-w-md mx-auto h-28">
        <Link
          to="/"
          onClick={handleNavigation('/')}
          className={cn(
            'flex items-start justify-center pt-4 transition-all duration-200',
            isActive('/') ? 'text-telegram-button active' : 'text-telegram-hint'
          )}
          aria-current={isActive('/') ? 'page' : undefined}
        >
          <Home size={32} />
        </Link>
        
        <Link
          to="/shop"
          onClick={handleNavigation('/shop')}
          className={cn(
            'flex items-start justify-center pt-4 transition-all duration-200',
            isActive('/shop') ? 'text-telegram-button active' : 'text-telegram-hint'
          )}
          aria-current={isActive('/shop') ? 'page' : undefined}
        >
          <ShoppingBag size={32} />
        </Link>
        
        <Link
          to="/calculator"
          onClick={handleNavigation('/calculator')}
          className={cn(
            'flex items-start justify-center pt-4 transition-all duration-200',
            isActive('/calculator') ? 'text-telegram-button active' : 'text-telegram-hint'
          )}
          aria-current={isActive('/calculator') ? 'page' : undefined}
        >
          <Calculator size={32} />
        </Link>

        <Link
          to="/cart"
          onClick={handleNavigation('/cart')}
          className={cn(
            'flex items-start justify-center pt-4 relative transition-all duration-200',
            isActive('/cart') ? 'text-telegram-button active' : 'text-telegram-hint'
          )}
          aria-current={isActive('/cart') ? 'page' : undefined}
        >
          <div className="relative">
            <ShoppingCart size={32} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full badge">
                {itemCount}
              </span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;

