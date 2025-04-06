import React from 'react';
import { Trash } from 'lucide-react';
import { CartItem as CartItemType } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  return (
    <div className="flex items-center bg-white dark:bg-sidebar-accent p-4 rounded-lg shadow-sm">
      <div className="flex-1">
        <h3 className="font-medium">{item.name}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span>Size: {item.size}</span>
          {item.color && (
            <span className="ml-2">Color: {item.color}</span>
          )}
        </div>
        <div className="flex justify-between mt-1">
          <div className="text-telegram-blue font-medium">
            ₽{item.sale_price || item.price}
          </div>
          <div className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            Qty: {item.quantity}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={onRemove}
          className="ml-4 text-red-500"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem; 