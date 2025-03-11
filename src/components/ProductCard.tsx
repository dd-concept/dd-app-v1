
import React from 'react';
import { Link } from 'react-router-dom';
import { getConsistentEmoji } from '@/utils/emojiUtils';
import { cn } from '@/lib/utils';
import { StockItem } from '@/services/api';

interface ProductCardProps {
  product: StockItem;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  // Get a consistent emoji based on the product name and color
  const productEmoji = getConsistentEmoji(`${product.item_name}-${product.color_code}`, 'product');
  
  // Get available sizes
  const availableSizes = product.sizes
    .filter(size => size.count > 0)
    .map(size => size.size);

  // Check if product has photos
  const hasPhoto = product.photos && product.photos.length > 0;
  
  return (
    <Link 
      to={`/product/${product.sku}`} 
      className={cn(
        'block bg-white dark:bg-sidebar-accent rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover-lift',
        className
      )}
    >
      <div className="aspect-square bg-telegram-light dark:bg-sidebar-primary/20 flex items-center justify-center">
        {hasPhoto ? (
          <img 
            src={product.photos![0].photo_url} 
            alt={product.item_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<span class="text-5xl animate-float">${productEmoji}</span>`;
            }}
          />
        ) : (
          <span className="text-5xl animate-float">{productEmoji}</span>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.item_name}</h3>
          {product.brand && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {product.brand}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Color: {product.color_code}
          </span>
          <span className="font-medium text-telegram-blue">
            ₽{product.price_rub.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {availableSizes.slice(0, 3).map((size) => (
            <span key={size} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              {size}
            </span>
          ))}
          {availableSizes.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
              +{availableSizes.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
