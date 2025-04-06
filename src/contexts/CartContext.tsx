import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// This matches more closely what our API structure needs
export interface CartItem {
  productId: string; // SKU from the API
  name: string;
  color: string;
  size: string;
  price: number;
  sale_price?: number;
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
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  getItemQuantity: (productId: string, size: string) => number;
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
        // Removed toast notification as requested
        return updatedItems;
      } else {
        // Otherwise add new item
        // Removed toast notification as requested
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

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.productId === productId && item.size === size
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...currentItems];
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedItems.splice(existingItemIndex, 1);
        } else {
          // Update quantity
          updatedItems[existingItemIndex].quantity = quantity;
        }
        return updatedItems;
      } else if (quantity > 0) {
        // If item doesn't exist but quantity > 0, we can't add it without product details
        console.warn('Attempted to update quantity for non-existent item');
      }
      return currentItems;
    });
  };

  const getItemQuantity = (productId: string, size: string): number => {
    const item = items.find(item => item.productId === productId && item.size === size);
    return item ? item.quantity : 0;
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
      totalPrice,
      updateQuantity,
      getItemQuantity
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
