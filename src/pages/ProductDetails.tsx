
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import SizeSelector from '@/components/SizeSelector';
import { fetchProducts, Product } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { getConsistentEmoji } from '@/utils/emojiUtils';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Fetch all products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Find the current product
  const product = products?.find(p => p.id === Number(productId));
  
  // Set default selected size when product loads
  useEffect(() => {
    if (product && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);
  
  // Get emoji for product
  const productEmoji = product 
    ? getConsistentEmoji(`${product.name}-${product.color}`, 'product')
    : '📦';
  
  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
    addToCart(product, selectedSize);
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
  
  if (error || !product) {
    return (
      <PageLayout>
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-red-600 mb-2">Product not found</h2>
          <button 
            className="mt-4 px-4 py-2 bg-telegram-blue text-white rounded-lg"
            onClick={() => navigate('/shop')}
          >
            Back to Shop
          </button>
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
            <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{product.color}</span>
              <span className="text-xl font-medium text-telegram-blue">${product.price}</span>
            </div>
          </div>
          
          {/* Size selector */}
          <SizeSelector
            sizes={product.sizes}
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
              This premium {product.name.toLowerCase()} in {product.color.toLowerCase()} offers exceptional comfort and style. 
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
