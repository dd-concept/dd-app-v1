import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from 'next-themes';
import { hapticSelection } from '@/utils/telegramUtils';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { theme } = useTheme();
  
  const isActive = (path: string) => location.pathname === path;
  
  // Custom navigation handler with haptic feedback
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Only trigger haptic feedback and navigate if not already on this path
    if (!isActive(path)) {
      // Trigger haptic feedback
      hapticSelection();
      
      // Navigate to the path
      navigate(path);
    }
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav-bar">
      <div className="grid grid-cols-3 w-full max-w-md mx-auto h-20">
        <Link
          to="/"
          onClick={handleNavigation('/')}
          className={cn(
            'flex items-center justify-center transition-all duration-200',
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
            'flex items-center justify-center relative transition-all duration-200',
            isActive('/shop') ? 'text-telegram-button active' : 'text-telegram-hint'
          )}
          aria-current={isActive('/shop') ? 'page' : undefined}
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
        
        <Link
          to="/calculator"
          onClick={handleNavigation('/calculator')}
          className={cn(
            'flex items-center justify-center transition-all duration-200',
            isActive('/calculator') ? 'text-telegram-button active' : 'text-telegram-hint'
          )}
          aria-current={isActive('/calculator') ? 'page' : undefined}
        >
          <Calculator size={32} />
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;

