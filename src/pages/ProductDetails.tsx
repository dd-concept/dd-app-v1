import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Plus, Minus, ShoppingCart } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import SizeSelector from '@/components/SizeSelector';
import { fetchProducts, addProductToCart, StockItem } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { getConsistentEmoji } from '@/utils/emojiUtils';
import { hapticSelection, hapticImpact } from '@/utils/telegramUtils';
import { sortSizes } from '@/utils/sizeUtils';
import { toast } from 'sonner';
import PhotoSwiper from '@/components/PhotoSwiper';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart: addItemToCart, updateQuantity, getItemQuantity } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Fetch all products with retry and longer staleTime
  const { data: products, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
  
  // Find the current product
  const product = products?.find(p => p.sku === productId);
  
  // Get available sizes (only those with count > 0)
  const availableSizes = useMemo(() => {
    if (!product) return [];
    
    // Handle array of SizeAvailability
    if (Array.isArray(product.sizes)) {
      const sizes = product.sizes
        .filter(size => size.quantity > 0)
        .map(size => size.size);
      
      // Return sorted sizes
      return sortSizes(sizes);
    }
    
    // Fallback for backward compatibility
    return [];
  }, [product]);

  // Set default selected size when product loads
  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);
  
  // Get emoji for product
  const productEmoji = product 
    ? getConsistentEmoji(`${product.item_name}-${product.color_code}`, 'product')
    : '📦';
  
  // Get current quantity in cart
  const currentQuantity = useMemo(() => {
    if (!product || !selectedSize) return 0;
    return getItemQuantity(product.sku, selectedSize);
  }, [product, selectedSize, getItemQuantity]);
  
  // Get processed photo URLs
  const photoUrls = useMemo(() => {
    if (!product || !product.photos) return [];
    
    return Array.isArray(product.photos) 
      ? product.photos.map(photo => {
          if (typeof photo === 'string') return photo;
          return photo.photo_url || '';
        }).filter(url => url)
      : [];
  }, [product]);
  
  // Get maximum available quantity for the selected size
  const getMaxAvailableQuantity = useMemo(() => {
    if (!product || !selectedSize) return 0;
    
    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    return sizeInfo ? sizeInfo.quantity : 0;
  }, [product, selectedSize]);
  
  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
    // Check if adding one more would exceed available stock
    if (currentQuantity >= getMaxAvailableQuantity) {
      toast.error(`Извините, доступно только ${getMaxAvailableQuantity} шт. размера ${selectedSize}`);
      return;
    }
    
    // Provide haptic feedback
    hapticSelection();
    
    // Calculate price - convert from string if needed
    const price = typeof product.price_rub === 'string' 
      ? parseFloat(product.price_rub.replace(/[^\d.-]/g, ''))
      : product.price_rub;
    
    // Call the cart context method to add the product
    // Create a temporary product object that matches what the cart context expects
    const tempProduct = {
      id: product.sku,
      name: product.item_name,
      color: product.color_code,
      sizes: availableSizes,
      // Use the actual price from the API
      price: price,
      quantity: 1
    };
    
    addItemToCart(tempProduct, selectedSize);
    
    // Also call the API method (which is just a placeholder for now)
    addProductToCart(product.sku, selectedSize);
  };
  
  const handleIncreaseQuantity = () => {
    if (!product || !selectedSize) return;
    
    // Check if adding one more would exceed available stock
    if (currentQuantity >= getMaxAvailableQuantity) {
      toast.error(`Извините, доступно только ${getMaxAvailableQuantity} шт. размера ${selectedSize}`);
      return;
    }
    
    hapticSelection();
    updateQuantity(product.sku, selectedSize, currentQuantity + 1);
  };
  
  const handleDecreaseQuantity = () => {
    if (!product || !selectedSize || currentQuantity <= 0) return;
    hapticSelection();
    updateQuantity(product.sku, selectedSize, currentQuantity - 1);
  };
  
  const handleViewCart = () => {
    hapticSelection();
    navigate('/cart');
  };
  
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }
  
  if (isError || !product) {
    return (
      <PageLayout>
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-red-600 mb-2">
            {isError ? "Ошибка загрузки товара" : "Товар не найден"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {isError ? "Пожалуйста, попробуйте позже" : "Этот товар может быть больше не доступен"}
          </p>
          <div className="flex justify-center gap-4">
            {isError && (
              <button 
                className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
                onClick={() => refetch()}
              >
                Повторить
              </button>
            )}
            <button 
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
              onClick={() => navigate('/shop')}
            >
              В магазин
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="flex flex-col min-h-screen">
        {/* Product image slider using PhotoSwiper component */}
        <PhotoSwiper
          photos={photoUrls}
          productName={product.item_name}
          fallbackEmoji={productEmoji}
        />
        
        <div className="p-4 flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{product.item_name}</h1>
            <Link 
              to="/cart" 
              className="relative flex items-center justify-center w-10 h-10 bg-telegram-button text-white rounded-full hover:bg-telegram-button/90 transition-colors"
              aria-label="View Cart"
            >
              <ShoppingCart size={20} className="text-white" />
              {/* Show total quantity of this product in cart across all sizes */}
              {availableSizes.reduce((total, size) => total + getItemQuantity(product.sku, size), 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {availableSizes.reduce((total, size) => total + getItemQuantity(product.sku, size), 0)}
                </span>
              )}
            </Link>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              {product.brand && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full">
                  {product.brand}
                </span>
              )}
              <span className="px-2 py-1 bg-telegram-light dark:bg-telegram-dark/20 text-telegram-blue dark:text-telegram-blue text-xs rounded-full">
                {product.color_code}
              </span>
            </div>
            <p className="text-lg font-semibold text-telegram-blue">
              ₽{typeof product.price_rub === 'string' 
                ? parseFloat(product.price_rub.replace(/[^\d.-]/g, '')).toLocaleString() 
                : product.price_rub.toLocaleString()}
            </p>
          </div>
          
          <div className="mb-6">
            <h2 className="font-medium mb-2">Выберите размер</h2>
            <SizeSelector
              availableSizes={availableSizes}
              selectedSize={selectedSize}
              onChange={setSelectedSize}
            />
          </div>
          
          <div className="mb-6">
            {product.description && (
              <>
                <h2 className="font-medium mb-2">Описание</h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  {product.description}
                </p>
              </>
            )}
          </div>
          
          <div className="sticky bottom-0 pt-4 pb-2 bg-white dark:bg-sidebar-primary">
            {selectedSize && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Размер: {selectedSize}</span>
                  {getItemQuantity(product.sku, selectedSize) > 0 && (
                    <span className="text-sm text-gray-500">
                      В корзине: {getItemQuantity(product.sku, selectedSize)} шт.
                    </span>
                  )}
                </div>
                
                {getItemQuantity(product.sku, selectedSize) === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize || availableSizes.length === 0}
                    className="w-full py-3 px-4 bg-telegram-blue text-white rounded-lg flex items-center justify-center gap-2 hover:bg-telegram-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={20} />
                    <span>Добавить в корзину</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                    <button 
                      onClick={handleDecreaseQuantity}
                      className="w-10 h-10 flex items-center justify-center text-telegram-text bg-gray-100 dark:bg-gray-800 rounded-md"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-medium">{getItemQuantity(product.sku, selectedSize)}</span>
                    <button 
                      onClick={handleIncreaseQuantity}
                      className="w-10 h-10 flex items-center justify-center text-telegram-text bg-gray-100 dark:bg-gray-800 rounded-md"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={handleViewCart}
              className="w-full py-3 px-4 bg-telegram-blue text-white rounded-lg flex items-center justify-center gap-2 hover:bg-telegram-dark transition-colors"
            >
              <ShoppingCart size={20} />
              <span>Перейти в корзину</span>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetails;
