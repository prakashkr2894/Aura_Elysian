import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import axios from 'axios';

export interface FilterOptions {
  fragrances: string[];
  festivals: string[];
  themes: string[];
  weights: string[];
  priceRanges: { min: number; max: number; };
  weightRanges?: { min: number; max: number; };
  categories: string[];
}

export interface FilterState {
  selectedFestivals: string[];
  selectedFragrances: string[];
  selectedThemes: string[];
  selectedWeights: string[];
  priceRange: [number, number];
  weightRange: [number, number];
  selectedCategories: string[];
}

interface FilterContextType {
  filterOptions: FilterOptions | null;
  filterState: FilterState;
  loading: boolean;
  error: string | null;
  updateFilterState: (newState: Partial<FilterState>) => void;
  refreshFilters: () => Promise<void>;
  resetFilters: () => void;
  applyCollectionFilter: (collectionTitle: string) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilters must be used within a FilterProvider');
  return context;
};

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children }) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<FilterState>({
    selectedFestivals: [],
    selectedFragrances: [],
    selectedThemes: [],
    selectedWeights: [],
    priceRange: [0, 1000],
    weightRange: [0, 1000],
    selectedCategories: [],
  });

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/filters');
      setFilterOptions(response.data);
      if (response.data.priceRanges) {
        setFilterState(prev => ({ ...prev, priceRange: [response.data.priceRanges.min, response.data.priceRanges.max] }));
      }
      if (response.data.weightRanges) {
        setFilterState(prev => ({ ...prev, weightRange: [response.data.weightRanges.min, response.data.weightRanges.max] }));
      }
    } catch (err: unknown) {
      const message = (axios.isAxiosError(err) && err.response?.data?.message)
        || (err instanceof Error ? err.message : 'Failed to fetch filter options');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFilters = useCallback(async () => { await fetchFilterOptions(); }, [fetchFilterOptions]);
  const updateFilterState = useCallback((newState: Partial<FilterState>) => { setFilterState(prev => ({ ...prev, ...newState })); }, []);

  const resetFilters = useCallback(() => {
    setFilterState({
      selectedFestivals: [],
      selectedFragrances: [],
      selectedThemes: [],
      selectedWeights: [],
      priceRange: [filterOptions?.priceRanges?.min || 0, filterOptions?.priceRanges?.max || 1000],
      weightRange: [filterOptions?.weightRanges?.min || 0, filterOptions?.weightRanges?.max || 1000],
      selectedCategories: [],
    });
  }, [filterOptions]);

  const applyCollectionFilter = useCallback((collectionTitle: string) => {
    if (!filterOptions) return;
    const title = collectionTitle.toLowerCase().trim();
    const matchingFestival = filterOptions.festivals.find(f => f.toLowerCase().includes(title) || title.includes(f.toLowerCase()));
    const matchingFragrance = filterOptions.fragrances.find(f => f.toLowerCase().includes(title) || title.includes(f.toLowerCase()));
    const matchingTheme = filterOptions.themes.find(t => t.toLowerCase().includes(title) || title.includes(t.toLowerCase()));
    const matchingWeight = filterOptions.weights.find(w => w.toLowerCase().includes(title) || title.includes(w.toLowerCase()));
    const matchingCategory = filterOptions.categories.find(c => c.toLowerCase().includes(title) || title.includes(c.toLowerCase()));
    if (matchingFestival) setFilterState(prev => ({ ...prev, selectedFestivals: [matchingFestival] }));
    else if (matchingFragrance) setFilterState(prev => ({ ...prev, selectedFragrances: [matchingFragrance] }));
    else if (matchingTheme) setFilterState(prev => ({ ...prev, selectedThemes: [matchingTheme] }));
    else if (matchingWeight) setFilterState(prev => ({ ...prev, selectedWeights: [matchingWeight] }));
    else if (matchingCategory) setFilterState(prev => ({ ...prev, selectedCategories: [matchingCategory] }));
  }, [filterOptions]);

  useEffect(() => { fetchFilterOptions(); }, [fetchFilterOptions]);

  const value: FilterContextType = useMemo(() => ({
    filterOptions, filterState, loading, error, updateFilterState, refreshFilters, resetFilters, applyCollectionFilter,
  }), [filterOptions, filterState, loading, error, updateFilterState, refreshFilters, resetFilters, applyCollectionFilter]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
