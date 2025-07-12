// TODO [DEPRECATED]: This file is no longer used.
// Filter functionality has been moved to StaticFiltersPanel with the main filter-context.tsx
// This file can be safely removed in a future cleanup.

import React, { useState, ReactNode, useCallback } from 'react';
import { FilterValue } from '@/lib/database.types';
import { FilterContext } from './filter-context';

// This file is designed to be a drop-in replacement for filter-context.tsx
// It provides the same API but without the URL persistence

// Override FilterProvider with a version that doesn't persist to URL
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [pendingFilters, setPendingFilters] = useState<FilterValue[]>([]);
  
  const setFilter = useCallback((filter: FilterValue) => {
    setPendingFilters(prevFilters => {
      const existingIndex = prevFilters.findIndex(f => f.attributeCode === filter.attributeCode);
      
      if (existingIndex !== -1) {
        if (JSON.stringify(prevFilters[existingIndex].value) === JSON.stringify(filter.value)) {
          return prevFilters;
        }
        
        const newFilters = [...prevFilters];
        newFilters[existingIndex] = filter;
        return newFilters;
      } else {
        return [...prevFilters, filter];
      }
    });
  }, []);
  
  const removeFilter = useCallback((attributeCode: string) => {
    setPendingFilters(prevFilters => {
      if (!prevFilters.some(f => f.attributeCode === attributeCode)) {
        return prevFilters;
      }
      
      return prevFilters.filter(filter => filter.attributeCode !== attributeCode);
    });
  }, []);
  
  const clearFilters = useCallback(() => {
    setPendingFilters([]);
    setFilters([]);
  }, []);
  
  const applyFilters = useCallback(() => {
    if (JSON.stringify(filters) !== JSON.stringify(pendingFilters)) {
      const newFilters = JSON.parse(JSON.stringify(pendingFilters));
      setFilters(newFilters);
    }
  }, [filters, pendingFilters]);
  
  return (
    <FilterContext.Provider 
      value={{ 
        filters, 
        pendingFilters,
        setFilter, 
        removeFilter, 
        clearFilters, 
        applyFilters 
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

// For backward compatibility
export function FilterProviderWithSearchParams({ children }: { children: ReactNode }) {
  return <FilterProvider>{children}</FilterProvider>;
}

// Re-export useFilters from filter-context for consistency
export { useFilters } from './filter-context'; 