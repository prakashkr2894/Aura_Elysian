import { useMemo } from 'react';
import { useFilters as useFilterContext } from '../context/FilterContext';

export const useFilters = () => {
  return useFilterContext();
};

export interface Product {
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

export const useProductFilters = (products: Product[]) => {
  const { filterState, filterOptions } = useFilters();

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];

    return products.filter(product => {
      const priceMatch = product.price >= filterState.priceRange[0] &&
                        product.price <= filterState.priceRange[1];

      const festivalMatch = filterState.selectedFestivals.length === 0 ||
        (product.festival && product.festival.some(f =>
          filterState.selectedFestivals.includes(f)
        ));

      const fragranceMatch = filterState.selectedFragrances.length === 0 ||
        (product.fragrance && filterState.selectedFragrances.includes(product.fragrance));

      const themeMatch = filterState.selectedThemes.length === 0 ||
        (product.theme && filterState.selectedThemes.includes(product.theme));

      const weightMatch = filterState.selectedWeights.length === 0 ||
        (product.weight && filterState.selectedWeights.includes(product.weight));

      const categoryMatch = filterState.selectedCategories.length === 0 ||
        filterState.selectedCategories.includes(product.category);

      return priceMatch && festivalMatch && fragranceMatch &&
             themeMatch && weightMatch && categoryMatch;
    });
  }, [products, filterState]);

  const getActiveFilterCount = () => {
    return (
      filterState.selectedFestivals.length +
      filterState.selectedFragrances.length +
      filterState.selectedThemes.length +
      filterState.selectedWeights.length +
      filterState.selectedCategories.length +
      (filterOptions?.priceRanges && (filterState.priceRange[0] > filterOptions.priceRanges.min ||
       filterState.priceRange[1] < filterOptions.priceRanges.max) ? 1 : 0)
    );
  };

  return {
    filteredProducts,
    activeFilterCount: getActiveFilterCount(),
    hasActiveFilters: getActiveFilterCount() > 0,
  };
};
