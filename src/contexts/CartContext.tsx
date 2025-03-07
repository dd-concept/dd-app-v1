
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// This matches more closely what our API structure needs
interface CartItem {
  productId: string; // SKU from the API
  name: string;
  color: string;
  size: string;
  price: number; // Will be updated when we have real prices
  quantity: number;
}

// For compatibility with existing code
interface Product {
  id: string; // SKU
  name: string;
  color: string;
  sizes: string[];
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Calculate total item count and price
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string) => {
    setItems(currentItems => {
      // Check if this product and size is already in the cart
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === product.id && item.size === size
      );

      if (existingItemIndex >= 0) {
        // If already in cart, increase quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += 1;
        toast.success(`Added another ${product.name} (${size}) to cart`);
        return updatedItems;
      } else {
        // Otherwise add new item
        toast.success(`Added ${product.name} (${size}) to cart`);
        return [...currentItems, {
          productId: product.id,
          name: product.name,
          color: product.color,
          size,
          price: product.price,
          quantity: 1
        }];
      }
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === productId && item.size === size
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        if (updatedItems[existingItemIndex].quantity > 1) {
          // If quantity > 1, just decrease quantity
          updatedItems[existingItemIndex].quantity -= 1;
        } else {
          // Otherwise remove the item
          updatedItems.splice(existingItemIndex, 1);
        }
        return updatedItems;
      }
      return currentItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    toast.info('Cart cleared');
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      clearCart,
      itemCount,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
