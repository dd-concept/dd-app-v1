
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchProducts, StockItem } from '@/services/api';

const Shop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products using React Query
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract all available sizes from products
  const availableSizes = useMemo(() => {
    if (!products) return [];
    
    const sizes = new Set<string>();
    products.forEach(product => {
      product.sizes.forEach(sizeObj => {
        if (sizeObj.count > 0) {
          sizes.add(sizeObj.size);
        }
      });
    });
    
    return Array.from(sizes).sort();
  }, [products]);

  // Filter products based on search term and selected size
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by search term
      const matchesSearch = product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.color_code.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by size
      const matchesSize = selectedSize === 'all' || 
                          product.sizes.some(sizeObj => 
                            sizeObj.size === selectedSize && sizeObj.count > 0
                          );
      
      return matchesSearch && matchesSize;
    });
  }, [products, searchTerm, selectedSize]);

  // Handle errors
  if (error) {
    return (
      <PageLayout>
        <div className="p-4 text-center">
          <h2 className="text-lg font-medium text-red-600 mb-2">Error loading products</h2>
          <p className="text-gray-600">Please try again later</p>
          <button 
            className="mt-4 px-4 py-2 bg-telegram-blue text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-4">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold mb-4">Shop</h1>
          
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-telegram-blue focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters button */}
          <button
            className="flex items-center gap-2 text-sm text-gray-700 mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
          </button>
          
          {/* Size filters */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg animate-slide-down">
              <h3 className="text-sm font-medium mb-2">Filter by Size</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    selectedSize === 'all' ? 'bg-telegram-blue text-white border-telegram-blue' : 'bg-white border-gray-300'
                  }`}
                  onClick={() => setSelectedSize('all')}
                >
                  All Sizes
                </button>
                {availableSizes.map(size => (
                  <button
                    key={size}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedSize === size ? 'bg-telegram-blue text-white border-telegram-blue' : 'bg-white border-gray-300'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Products grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-gray-700">No products found</h2>
            <p className="text-gray-500 mt-2">Try changing your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.sku} 
                product={product}
                className="animate-fade-in"
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Shop;
