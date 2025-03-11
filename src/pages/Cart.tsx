
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const { items, removeFromCart, addToCart, clearCart, totalPrice } = useCart();

  const handleRemoveItem = (productId: string, size: string) => {
    removeFromCart(productId, size);
  };

  const handleAddItem = (item: any) => {
    // Create temporary product object matching what addToCart expects
    const tempProduct = {
      id: item.productId,
      name: item.name,
      color: item.color,
      sizes: [item.size],
      price: item.price,
      quantity: 1
    };
    
    addToCart(tempProduct, item.size);
  };

  const handleCreateOrder = () => {
    // In a real app, this would redirect to checkout or call an API
    toast.success("Order created successfully!");
    clearCart();
  };

  return (
    <PageLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
          <Link to="/shop" className="text-telegram-blue">
            Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10">
            <ShoppingBag size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added any products yet</p>
            <Link to="/shop">
              <Button className="bg-telegram-blue hover:bg-telegram-dark">
                Go to Shop
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y dark:divide-gray-700">
              {items.map((item, index) => (
                <div key={`${item.productId}-${item.size}-${index}`} className="py-4 flex items-center">
                  <div className="w-16 h-16 bg-telegram-light dark:bg-sidebar-accent/30 rounded-md flex items-center justify-center mr-4">
                    <span className="text-2xl">👕</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.color} • Size: {item.size}
                    </p>
                    <p className="font-medium text-telegram-blue">₽{item.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleRemoveItem(item.productId, item.size)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Minus size={16} />
                    </button>
                    
                    <span className="w-8 text-center">{item.quantity}</span>
                    
                    <button 
                      onClick={() => handleAddItem(item)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Plus size={16} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        // Remove all of this item
                        for (let i = 0; i < item.quantity; i++) {
                          handleRemoveItem(item.productId, item.size);
                        }
                      }}
                      className="p-1 ml-2 text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t dark:border-gray-700 mt-6 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>₽{totalPrice}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold mb-6">
                <span>Total</span>
                <span>₽{totalPrice}</span>
              </div>
              
              <Button 
                className="w-full bg-telegram-blue hover:bg-telegram-dark"
                onClick={handleCreateOrder}
              >
                Create Order
              </Button>
              
              <button 
                className="w-full mt-4 text-red-500 text-sm"
                onClick={clearCart}
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Cart;
