
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import SizeSelector from '@/components/SizeSelector';
import { fetchProducts, addToCart, StockItem } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { getConsistentEmoji } from '@/utils/emojiUtils';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart: addItemToCart } = useCart();
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
    return product.sizes
      .filter(sizeObj => sizeObj.count > 0)
      .map(sizeObj => sizeObj.size);
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
  
  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
    // Call the cart context method to add the product
    // Create a temporary product object that matches what the cart context expects
    const tempProduct = {
      id: product.sku,
      name: product.item_name,
      color: product.color_code,
      sizes: availableSizes,
      // These fields aren't in the API, but our cart context needs them
      price: 1999, // Placeholder price
      quantity: 1
    };
    
    addItemToCart(tempProduct, selectedSize);
    
    // Also call the API method (which is just a placeholder for now)
    addToCart(product.sku, selectedSize);
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
            {isError ? "Error loading product" : "Product not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {isError ? "Please try again later" : "This product may no longer be available"}
          </p>
          <div className="flex justify-center gap-4">
            {isError && (
              <button 
                className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
                onClick={() => refetch()}
              >
                Retry
              </button>
            )}
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              onClick={() => navigate('/shop')}
            >
              Back to Shop
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="flex flex-col min-h-screen">
        {/* Back button */}
        <button
          className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md"
          onClick={() => navigate('/shop')}
        >
          <ChevronLeft size={24} />
        </button>
        
        {/* Product image */}
        <div className="w-full aspect-square bg-telegram-light flex items-center justify-center">
          <span className="text-8xl animate-float">{productEmoji}</span>
        </div>
        
        {/* Product details */}
        <div className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-2">{product.item_name}</h1>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{product.color_code}</span>
              <span className="text-xl font-medium text-telegram-blue">
                {/* Placeholder price since API doesn't provide it */}
                ₽1,999
              </span>
            </div>
          </div>
          
          {/* Size selector */}
          <SizeSelector
            sizes={availableSizes}
            onChange={setSelectedSize}
            className="mb-8"
          />
          
          {/* Add to cart button */}
          <button
            className="w-full py-3 bg-telegram-blue text-white rounded-lg flex items-center justify-center gap-2 hover:bg-telegram-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={!selectedSize}
          >
            <ShoppingBag size={20} />
            <span>Add to Cart</span>
          </button>
          
          {/* Product description */}
          <div className="mt-8 pb-10">
            <h2 className="text-lg font-medium mb-2">Product Details</h2>
            <p className="text-gray-600">
              This premium {product.item_name.toLowerCase()} in {product.color_code.toLowerCase()} offers exceptional comfort and style. 
              Perfect for any occasion, it features high-quality materials and expert craftsmanship.
            </p>
            
            <div className="mt-4">
              <h3 className="font-medium">Features:</h3>
              <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-1">
                <li>Premium quality material</li>
                <li>Comfortable fit</li>
                <li>Stylish design</li>
                <li>Durable construction</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetails;
