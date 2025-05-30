import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, Search, X, Tag, ArrowUpDown } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { fetchProducts, fetchCategories, StockItem, Category } from '@/services/api';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';

// Sort types
type SortType = 'category-asc' | 'category-desc' | 'price-asc' | 'price-desc';

// Category order for sorting
const CATEGORY_ORDER = ['обувь', 'низ', 'верх', 'аксессуары'];

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('category-asc');
  const { itemCount } = useCart();

  useScrollToTop();

  // Fetch products using React Query with retry and longer staleTime
  const { data: products, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch categories using React Query
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });
  
  // Parse URL parameters on initial load
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const categoryParam = searchParams.get('category');
    const sizeParam = searchParams.get('size');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    
    if (brandParam) {
      setSelectedBrands(brandParam.split(','));
    }
    
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    }
    
    if (sizeParam) {
      setSelectedSizes(sizeParam.split(','));
    }
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }

    if (sortParam && ['category-asc', 'category-desc', 'price-asc', 'price-desc'].includes(sortParam)) {
      setSortBy(sortParam as SortType);
    }
  }, [searchParams]);

  // Update URL parameters when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (selectedBrands.length > 0) {
      newParams.set('brand', selectedBrands.join(','));
    }
    
    if (selectedCategories.length > 0) {
      newParams.set('category', selectedCategories.join(','));
    }
    
    if (selectedSizes.length > 0) {
      newParams.set('size', selectedSizes.join(','));
    }
    
    if (searchTerm) {
      newParams.set('search', searchTerm);
    }
    
    if (sortBy !== 'category-asc') {
      newParams.set('sort', sortBy);
    }
    
    // Only update if params actually changed to avoid needless history entries
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams);
    }
  }, [selectedBrands, selectedCategories, selectedSizes, searchTerm, sortBy, setSearchParams, searchParams]);

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
  
  // Extract all available categories from products
  const availableCategories = useMemo(() => {
    if (!products) return [];
    
    const categorySet = new Set<string>();
    
    products.forEach(product => {
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    
    return Array.from(categorySet).sort();
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
  
  // Toggle category selection
  const toggleCategorySelection = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Filter products based on search term, selected sizes, brands, and categories
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
                           product.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.color_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by sizes - if no sizes selected, show all
      const matchesSize = selectedSizes.length === 0 || 
                          (Array.isArray(product.sizes) && 
                           product.sizes.some(s => selectedSizes.includes(s.size) && s.quantity > 0));
      
      // Filter by brands - if no brands selected, show all
      const matchesBrand = selectedBrands.length === 0 || 
                          (product.brand && selectedBrands.includes(product.brand));
      
      // Filter by categories - if no categories selected, show all
      const matchesCategory = selectedCategories.length === 0 ||
                             (product.category && selectedCategories.includes(product.category));
      
      return matchesSearch && matchesSize && matchesBrand && matchesCategory;
    });
  }, [products, searchTerm, selectedSizes, selectedBrands, selectedCategories]);
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedCategories([]);
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
  
  // Remove a specific category filter
  const removeCategoryFilter = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };
  
  // Check if any filters are active
  const hasActiveFilters = selectedSizes.length > 0 || selectedBrands.length > 0 || selectedCategories.length > 0 || searchTerm.length > 0;

  // Get category position in predefined order
  const getCategoryOrder = (category: string): number => {
    const index = CATEGORY_ORDER.indexOf(category);
    return index !== -1 ? index : CATEGORY_ORDER.length;
  };

  // Sort and filter products
  const sortedAndFilteredProducts = useMemo(() => {
    if (!filteredProducts) return [];
    
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') {
        const priceA = typeof a.price_rub === 'string' ? parseFloat(a.price_rub) : a.price_rub;
        const priceB = typeof b.price_rub === 'string' ? parseFloat(b.price_rub) : b.price_rub;
        return priceA - priceB;
      } 
      else if (sortBy === 'price-desc') {
        const priceA = typeof a.price_rub === 'string' ? parseFloat(a.price_rub) : a.price_rub;
        const priceB = typeof b.price_rub === 'string' ? parseFloat(b.price_rub) : b.price_rub;
        return priceB - priceA;
      }
      else if (sortBy === 'category-desc') {
        const categoryOrderA = getCategoryOrder(a.category || '');
        const categoryOrderB = getCategoryOrder(b.category || '');
        return categoryOrderB - categoryOrderA;
      }
      else { // default: category-asc
        const categoryOrderA = getCategoryOrder(a.category || '');
        const categoryOrderB = getCategoryOrder(b.category || '');
        return categoryOrderA - categoryOrderB;
      }
    });
  }, [filteredProducts, sortBy]);

  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
  };

  const handleSortChange = (newSort: SortType) => {
    setSortBy(newSort);
    setShowSortOptions(false);
  };

  const getSortLabel = (sortType: SortType): string => {
    switch (sortType) {
      case 'price-asc': return 'По цене (от мин. к макс.)';
      case 'price-desc': return 'По цене (от макс. к мин.)';
      case 'category-asc': return 'По категории (обувь→низ→верх→аксессуары)';
      case 'category-desc': return 'По категории (аксессуары→верх→низ→обувь)';
      default: return 'По категории';
    }
  };

  return (
    <PageLayout className="pb-20">
      <div className="p-4">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Магазин</h1>
          </div>
          
          {/* Stock information bar */}
          <div className="mb-3 text-xs text-telegram-hint">
            <p className="text-justify">
              В этом разделе пока есть только то, что прямо сейчас в наличии в Москве. 
              Для заказа напрямую из Poizon используйте <Link to="/calculator" className="text-telegram-button hover:underline">рассчет доставки</Link>
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-telegram-hint" />
            </div>
            <input
              type="text"
              placeholder="Искать товары..."
              className="w-full p-3 pl-10 pr-4 border border-telegram-hint/30 rounded-lg bg-telegram-bg text-telegram-text focus:outline-none focus:ring-2 focus:ring-telegram-button focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Sort and Filter buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <button
                className="flex items-center gap-2 text-sm text-telegram-text"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={18} className="text-telegram-hint" />
                <span>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
              </button>
              
              <button
                className="flex items-center gap-2 text-sm text-telegram-text"
                onClick={toggleSortOptions}
              >
                <ArrowUpDown size={18} className="text-telegram-hint" />
                <span>Сортировка</span>
              </button>
            </div>
            
            {hasActiveFilters && (
              <button
                className="flex items-center gap-1 text-xs text-red-500"
                onClick={clearFilters}
              >
                <X size={14} />
                <span>Очистить фильтры</span>
              </button>
            )}
          </div>
          
          {/* Sort options */}
          {showSortOptions && (
            <div className="mb-4 p-4 bg-telegram-secondary-bg rounded-lg animate-slide-down space-y-2">
              <h3 className="text-sm font-medium mb-2 text-telegram-text">Сортировать по:</h3>
              <div className="flex flex-col gap-2">
                {(['category-asc', 'category-desc', 'price-asc', 'price-desc'] as SortType[]).map((option) => (
                  <button
                    key={option}
                    className={`px-3 py-2 text-sm rounded-lg text-left transition-colors ${
                      sortBy === option
                        ? 'bg-telegram-button text-telegram-button-text'
                        : 'bg-telegram-bg text-telegram-text hover:bg-telegram-bg/80'
                    }`}
                    onClick={() => handleSortChange(option)}
                  >
                    {getSortLabel(option)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSizes.map(size => (
                <span key={`filter-size-${size}`} className="inline-flex items-center gap-1 px-2 py-1 bg-telegram-light text-telegram-blue text-xs rounded-full">
                  <Tag size={12} />
                  Размер: {size}
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
                  Бренд: {brand}
                  <button 
                    className="ml-1" 
                    onClick={() => removeBrandFilter(brand)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              
              {selectedCategories.map(category => (
                <span key={`filter-category-${category}`} className="inline-flex items-center gap-1 px-2 py-1 bg-telegram-light text-telegram-blue text-xs rounded-full">
                  <Tag size={12} />
                  Категория: {category}
                  <button 
                    className="ml-1" 
                    onClick={() => removeCategoryFilter(category)}
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
              {/* Category filter */}
              {availableCategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-telegram-text">Фильтр по категории</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          selectedCategories.includes(category) 
                            ? 'bg-telegram-button text-telegram-button-text border-telegram-button' 
                            : 'bg-telegram-bg text-telegram-text border-telegram-hint/30 hover:border-telegram-hint/50'
                        }`}
                        onClick={() => toggleCategorySelection(category)}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Size filter */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-telegram-text">Фильтр по размеру</h3>
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
                  <h3 className="text-sm font-medium mb-2 text-telegram-text">Фильтр по бренду</h3>
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
            <h2 className="text-lg font-medium text-red-600 mb-2">Ошибка загрузки товаров</h2>
            <p className="text-gray-600 mb-4">Пожалуйста, попробуйте позже</p>
            <button 
              className="px-4 py-2 bg-telegram-blue text-white rounded-lg"
              onClick={() => refetch()}
            >
              Попробовать снова
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-medium text-gray-700">Товары не найдены</h2>
            <p className="text-gray-500 mt-2">Попробуйте изменить ваши фильтры или поисковый запрос</p>
            {hasActiveFilters && (
              <button 
                className="mt-4 px-4 py-2 bg-telegram-blue text-white rounded-lg"
                onClick={clearFilters}
              >
                Очистить все фильтры
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sortedAndFilteredProducts.map((product) => (
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
