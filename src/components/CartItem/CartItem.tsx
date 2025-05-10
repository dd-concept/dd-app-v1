import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { hapticSelection } from '@/utils/telegramUtils';

interface CartItemProps {
  item: CartItemType;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  const { updateQuantity } = useCart();

  const handleIncrease = () => {
    hapticSelection();
    updateQuantity(item.productId, item.size, item.quantity + 1);
  };

  const handleDecrease = () => {
    hapticSelection();
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.size, item.quantity - 1);
    } else {
      onRemove();
    }
  };

  // Generate a placeholder image based on item type and category
  const getPlaceholderImage = () => {
    if (item.item_type === 'preorder') {
      // Use different emojis based on product category
      if (item.category_type === 'обувь') {
        return '👟'; // Sneaker emoji for shoes/sneakers
      } else if (item.category_type === 'одежда') {
        return '👕'; // T-shirt emoji for одежда
      } else if (item.category_type === 'аксессуары') {
        return '👜'; // Bag emoji for accessories
      }
      return '🔮'; // Default crystal ball emoji for other preorders
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 bg-white dark:bg-sidebar-accent rounded-lg shadow-sm">
      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center text-4xl overflow-hidden">
        {item.photo_url ? (
          <img 
            src={item.photo_url} 
            alt={item.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show emoji placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = getPlaceholderImage();
            }}
          />
        ) : (
          getPlaceholderImage()
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.name}
          </h3>
          <button 
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {item.item_type === 'preorder' ? (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <p className="truncate">URL: {item.dewu_url}</p>
            <p>Размер: {item.size || 'Не указан'}</p>
            <p>Категория: {
              item.category_type === 'обувь' ? 'Обувь' : 
              item.category_type === 'одежда' ? 'Одежда' : 
              item.category_type === 'аксессуары' ? 'Аксессуары' : 
              item.category_type
            }</p>
            <p>Доставка: {(item.shipping_type || item.delivery_type) === 'cargo' ? 'Автомобиль' : 'Самолет'}</p>
          </div>
        ) : (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <p>{item.color && `Цвет: ${item.color}`}</p>
            <p>Размер: {item.size}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm font-medium text-telegram-blue">
            ₽{(item.sale_price || item.price).toLocaleString()}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecrease}
              className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            
            <span className="text-sm font-medium w-6 text-center">
              {item.quantity}
            </span>
            
            <button
              onClick={handleIncrease}
              className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem; 