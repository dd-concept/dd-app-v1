
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from 'next-themes';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { theme } = useTheme();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t",
      theme === "dark" 
        ? "bg-background border-gray-800" 
        : "bg-white border-gray-200"
    )}>
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        <Link
          to="/"
          className={cn(
            'nav-link',
            isActive('/') && 'active'
          )}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link
          to="/shop"
          className={cn(
            'nav-link',
            isActive('/shop') && 'active',
            'relative'
          )}
        >
          <ShoppingBag size={24} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-telegram-blue text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {itemCount}
            </span>
          )}
          <span className="text-xs mt-1">Shop</span>
        </Link>
        
        <Link
          to="/profile"
          className={cn(
            'nav-link',
            isActive('/profile') && 'active'
          )}
        >
          <User size={24} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavigation;
