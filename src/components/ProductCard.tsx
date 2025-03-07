
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
  
  return (
    <Link 
      to={`/product/${product.sku}`} 
      className={cn(
        'block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover-lift',
        className
      )}
    >
      <div className="aspect-square bg-telegram-light flex items-center justify-center">
        <span className="text-5xl animate-float">{productEmoji}</span>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 truncate">{product.item_name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Color: {product.color_code}
          </span>
          <span className="font-medium text-telegram-blue">
            {/* If we had price in the API we'd show it here */}
            In Stock
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {availableSizes.slice(0, 3).map((size) => (
            <span key={size} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {size}
            </span>
          ))}
          {availableSizes.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              +{availableSizes.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
