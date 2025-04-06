import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, ShoppingCart, X, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchProducts, StockItem } from '@/services/api';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

const Shop: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { itemCount } = useCart();

  // Fetch products using React Query with retry and longer staleTime
  const { data: products, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (isError && error instanceof Error) {
      toast.error(`Shop error: ${error.message}`);
    }
  }, [isError, error]);

  // Extract all available sizes from products
  const availableSizes = useMemo(() => {
    if (!products) return [];
    
    const sizes = new Set<string>();
    
    products.forEach(product => {
      if (Array.isArray(product.sizes)) {
        product.sizes.forEach(sizeObj => {
          if (sizeObj.quantity > 0) {
            sizes.add(sizeObj.size);
          }
        });
      }
    });
    
    return Array.from(sizes).sort();
  }, [products]);
  
  // Extract all available brands from products
  const availableBrands = useMemo(() => {
    if (!products) return [];
    
    const brands = new Set<string>();
    
    products.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    
    return Array.from(brands).sort();
  }, [products]);

  // Toggle size selection
  const toggleSizeSelection = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };
  
  // Toggle brand selection
  const toggleBrandSelection = (brand: string) => {
    setSelectedBrands(prev => {
      if (prev.includes(brand)) {
        return prev.filter(b => b !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  // Filter products based on search term, selected sizes, and brands
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by search term
      const matchesSearch = product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.color_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by sizes - if no sizes selected, show all
      const matchesSize = selectedSizes.length === 0 || 
                          (Array.isArray(product.sizes) && 
                           product.sizes.some(s => selectedSizes.includes(s.size) && s.quantity > 0));
      
      // Filter by brands - if no brands selected, show all
      const matchesBrand = selectedBrands.length === 0 || 
                          (product.brand && selectedBrands.includes(product.brand));
      
      return matchesSearch && matchesSize && matchesBrand;
    });
  }, [products, searchTerm, selectedSizes, selectedBrands]);
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSearchTerm('');
  };
  
  // Remove a specific size filter
  const removeSizeFilter = (size: string) => {
    setSelectedSizes(prev => prev.filter(s => s !== size));
  };
  
  // Remove a specific brand filter
  const removeBrandFilter = (brand: string) => {
    setSelectedBrands(prev => prev.filter(b => b !== brand));
  };
  
  // Check if any filters are active
  const hasActiveFilters = selectedSizes.length > 0 || selectedBrands.length > 0 || searchTerm.length > 0;

  return (
    <PageLayout>
      <div className="p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Shop</h1>
            <Link 
              to="/cart" 
              className="relative flex items-center justify-center w-10 h-10 bg-telegram-button text-white rounded-full hover:bg-telegram-button/90 transition-colors"
              aria-label="View Cart"
            >
              <ShoppingCart size={20} className="text-white" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-telegram-hint" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-3 pl-10 pr-4 border border-telegram-hint/30 rounded-lg bg-telegram-bg text-telegram-text focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters button */}
          <div className="flex items-center justify-between mb-4">
            <button
              className="flex items-center gap-2 text-sm text-telegram-text"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} className="text-telegram-hint" />
              <span>{showFilters ? 'Hide filters' : 'Show filters'}</span>
            </button>
            
            {hasActiveFilters && (
              <button
                className="flex items-center gap-1 text-xs text-red-500"
                onClick={clearFilters}
              >
                <X size={14} />
                <span>Clear filters</span>
              </button>
            )}
          </div>
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSizes.map(size => (
                <span key={`filter-size-${size}`} className="inline-flex items-center gap-1 px-2 py-1 bg-telegram-light text-telegram-blue text-xs rounded-full">
                  <Tag size={12} />
                  Size: {size}
                  <button 
                    className="ml-1" 
                    onClick={() => removeSizeFilter(size)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              
              {selectedBrands.map(brand => (
                <span key={`filter-brand-${brand}`} className="inline-flex items-center gap-1 px-2 py-1 bg-telegram-light text-telegram-blue text-xs rounded-full">
                  <Tag size={12} />
                  Brand: {brand}
                  <button 
                    className="ml-1" 
                    onClick={() => removeBrandFilter(brand)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-telegram-light text-telegram-blue text-xs rounded-full">
                  <Search size={12} />
                  "{searchTerm}"
                  <button 
                    className="ml-1" 
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          )}
          
          {showFilters && (
            <div className="mb-4 p-4 bg-telegram-secondary-bg rounded-lg animate-slide-down space-y-4">
              {/* Size filter */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-telegram-text">Filter by Size (Select Multiple)</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedSizes.includes(size) 
                          ? 'bg-telegram-button text-telegram-button-text border-telegram-button' 
                          : 'bg-telegram-bg text-telegram-text border-telegram-hint/30 hover:border-telegram-hint/50'
                      }`}
                      onClick={() => toggleSizeSelection(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Brand filter */}
              {availableBrands.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-telegram-text">Filter by Brand (Select Multiple)</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableBrands.map(brand => (
                      <button
                        key={brand}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          selectedBrands.includes(brand) 
                            ? 'bg-telegram-button text-telegram-button-text border-telegram-button' 
                            : 'bg-telegram-bg text-telegram-text border-telegram-hint/30 hover:border-telegram-hint/50'
                        }`}
                        onClick={() => toggleBrandSelection(brand)}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Error display */}
        {isError && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-red-700">Error Loading Products:</h3>
            <p className="text-xs text-red-600">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-red-600 mb-2">Error loading products</h2>
            <p className="text-gray-600 mb-4">Please try again later</p>
            <button 
              className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-gray-700">No products found</h2>
            <p className="text-gray-500 mt-2">Try changing your filters or search term</p>
            {hasActiveFilters && (
              <button 
                className="mt-4 px-4 py-2 bg-telegram-blue text-white rounded-lg"
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            )}
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
