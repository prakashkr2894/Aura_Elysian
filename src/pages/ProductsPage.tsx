import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Filter, Grid, List, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useFilters, useProductFilters } from '../hooks/useFilters';
import { useImagePreload } from '../hooks/useImagePreload';

interface Product {
  _id: string;
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  primaryImage: string;
  category: string;
  rating: number;
  reviews: number;
  festival?: string[];
  fragrance?: string;
  weight?: string;
  theme?: string;
}

export const ProductsPage: React.FC = () => {
  const location = useLocation();
  const { cart, updateCartItemQuantity } = useCart();
  const { filterOptions, filterState, updateFilterState, resetFilters, loading: filterLoading, applyCollectionFilter } = useFilters();

  const hasActiveFilters = filterState.selectedFestivals.length > 0 ||
    filterState.selectedFragrances.length > 0 ||
    filterState.selectedThemes.length > 0 ||
    filterState.selectedWeights.length > 0 ||
    filterState.selectedCategories.length > 0 ||
    (filterOptions?.priceRanges && filterState.priceRange[0] > (filterOptions.priceRanges.min || 0)) ||
    (filterOptions?.priceRanges && filterState.priceRange[1] < (filterOptions.priceRanges.max || 1000)) ||
    (filterOptions?.weightRanges && filterState.weightRange[0] > (filterOptions?.weightRanges?.min || 0)) ||
    (filterOptions?.weightRanges && filterState.weightRange[1] < (filterOptions?.weightRanges?.max || 1000));
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [festivalInput, setFestivalInput] = useState<string>('');

  const productImages = allProducts.map(product => product.primaryImage);
  useImagePreload(productImages, allProducts.length > 0);

  const isCandlesPage = location.pathname === '/candles';

  const handleCartUpdate = (productId: string, quantity: number) => {
    updateCartItemQuantity(productId, quantity);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<Product[]>('/api/products');
        const products = res.data;

        setAllProducts(products.map((p: Product & { _id: string }) => ({
          ...p,
          id: p._id,
        })) as Product[]);

      } catch (error) {
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const collectionTitle = urlParams.get('collection');

    if (collectionTitle && filterOptions && !filterLoading) {
      applyCollectionFilter(collectionTitle);
    }
  }, [location.search, filterOptions, filterLoading, applyCollectionFilter]);

  const { filteredProducts } = useProductFilters(allProducts);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ];

  const handlePriceRangeChange = (value: number) => {
    updateFilterState({
      priceRange: [filterState.priceRange[0], value]
    });
  };

  const handleFragranceChange = (fragrance: string, checked: boolean) => {
    const newFragrances = checked
      ? [...filterState.selectedFragrances, fragrance]
      : filterState.selectedFragrances.filter(f => f !== fragrance);
    updateFilterState({ selectedFragrances: newFragrances });
  };

  const handleThemeChange = (theme: string, checked: boolean) => {
    const newThemes = checked
      ? [...filterState.selectedThemes, theme]
      : filterState.selectedThemes.filter(t => t !== theme);
    updateFilterState({ selectedThemes: newThemes });
  };

  const handleWeightChange = (weight: string, checked: boolean) => {
    const newWeights = checked
      ? [...filterState.selectedWeights, weight]
      : filterState.selectedWeights.filter(w => w !== weight);
    updateFilterState({ selectedWeights: newWeights });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {isCandlesPage ? 'Handcrafted Candles' : 'Our Collection'}
          </h1>
          <p className="text-lg text-gray-600">
            {isCandlesPage
              ? 'Discover our exquisite collection of handcrafted candles, made with love and the finest ingredients'
              : 'Discover our complete range of handcrafted candles, and custom pieces'
            }
          </p>
        </motion.div>

        <div className="relative">
          {/* Filters Sidebar - Slides from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: showFilters ? 0 : '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header with close button */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-lg">Filters</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      hasActiveFilters
                        ? 'text-gray-500 hover:text-gray-700'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹{filterState.priceRange[0]}</span>
                    <span>₹{filterState.priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min={filterOptions?.priceRanges.min || 0}
                    max={filterOptions?.priceRanges.max || 1000}
                    value={filterState.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Festivals */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">By Occasion</h3>
                <input
                  type="text"
                  value={festivalInput}
                  onChange={(e) => setFestivalInput(e.target.value)}
                  placeholder="Type festival/occasion..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
                />
              </div>

              {/* Fragrances */}
              {filterOptions?.fragrances && filterOptions.fragrances.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">By Fragrance</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.fragrances.map(fragrance => (
                      <label key={fragrance} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={filterState.selectedFragrances.includes(fragrance)}
                          onChange={e => handleFragranceChange(fragrance, e.target.checked)}
                          className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">{fragrance}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Themes */}
              {filterOptions?.themes && filterOptions.themes.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">By Theme</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.themes.map(theme => (
                      <label key={theme} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={filterState.selectedThemes.includes(theme)}
                          onChange={e => handleThemeChange(theme, e.target.checked)}
                          className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">{theme}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Weight Range (grams)</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{filterState.weightRange[0]}g</span>
                    <span>{filterState.weightRange[1]}g</span>
                  </div>
                  <input
                    type="range"
                    min={filterOptions?.weightRanges?.min || 0}
                    max={filterOptions?.weightRanges?.max || 1000}
                    value={filterState.weightRange[1]}
                    onChange={(e) => updateFilterState({
                      weightRange: [filterState.weightRange[0], parseInt(e.target.value)]
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>

              {/* Weights */}
              {filterOptions?.weights && filterOptions.weights.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">By Weight</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {filterOptions.weights.map(weight => (
                      <label key={weight} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={filterState.selectedWeights.includes(weight)}
                          onChange={e => handleWeightChange(weight, e.target.checked)}
                          className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-600">{weight}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Backdrop to close filters when clicking outside */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-4 shadow-sm mb-6"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                    showFilters
                      ? 'bg-pink-100 text-pink-700'
                      : hasActiveFilters
                      ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {filterState.selectedFestivals.length +
                       filterState.selectedFragrances.length +
                       filterState.selectedThemes.length +
                       filterState.selectedWeights.length +
                       filterState.selectedCategories.length +
                       ((filterOptions?.priceRanges && (
                          filterState.priceRange[0] > (filterOptions.priceRanges?.min ?? 0) ||
                          filterState.priceRange[1] < (filterOptions.priceRanges?.max ?? 1000)
                        )) ? 1 : 0) +
                       ((filterOptions?.weightRanges && (
                          filterState.weightRange[0] > (filterOptions.weightRanges?.min ?? 0) ||
                          filterState.weightRange[1] < (filterOptions.weightRanges?.max ?? 1000)
                        )) ? 1 : 0)}
                    </span>
                  )}
                  {filterLoading && <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />}
                </button>

                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {sortedProducts.length} products
                </span>

                <div className="flex-1" />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === 'list'
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              layout
              className={`grid max-w-max mx-auto gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProductCard
                      product={product}
                      onCartUpdate={handleCartUpdate}
                      quantity={cart.find(item => item.productId === product.id)?.quantity || 0}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 col-span-full"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
