import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterValue } from '@/lib/database.types';

interface FilterContextType {
  filters: FilterValue[];
  pendingFilters: FilterValue[];
  setFilter: (filter: FilterValue) => void;
  removeFilter: (attributeCode: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

export const FilterContext = createContext<FilterContextType | undefined>(undefined);

// This component uses useSearchParams and should be wrapped in Suspense
export function FilterProviderWithSearchParams({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterValue[]>([]);
  const [pendingFilters, setPendingFilters] = useState<FilterValue[]>([]);
  
  // Initialize filters from URL on mount
  useEffect(() => {
    const initialFilters: FilterValue[] = [];
    
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        const attributeCode = key.replace('filter_', '');
        let parsedValue: any = value;
        
        // Try to parse array values
        if (value.startsWith('[') && value.endsWith(']')) {
          try {
            parsedValue = JSON.parse(value);
          } catch (e) {
            console.error('Failed to parse filter value:', e);
          }
        } 
        // Try to parse numeric values
        else if (!isNaN(Number(value))) {
          parsedValue = Number(value);
        } 
        // Try to parse boolean values
        else if (value === 'true' || value === 'false') {
          parsedValue = value === 'true';
        }
        
        initialFilters.push({
          attributeCode,
          value: parsedValue
        });
      }
    }
    
    setFilters(initialFilters);
    setPendingFilters(initialFilters);
  }, [searchParams]);
  
  // Memoize setFilter to avoid unnecessary rerenders
  const setFilter = useCallback((filter: FilterValue) => {
    setPendingFilters(prevFilters => {
      const existingIndex = prevFilters.findIndex(f => f.attributeCode === filter.attributeCode);
      
      if (existingIndex !== -1) {
        // Only update if the value actually changed
        if (JSON.stringify(prevFilters[existingIndex].value) === JSON.stringify(filter.value)) {
          return prevFilters; // No change, return same array to prevent rerender
        }
        
        const newFilters = [...prevFilters];
        newFilters[existingIndex] = filter;
        return newFilters;
      } else {
        return [...prevFilters, filter];
      }
    });
  }, []);
  
  // Memoize removeFilter to avoid unnecessary rerenders
  const removeFilter = useCallback((attributeCode: string) => {
    setPendingFilters(prevFilters => {
      // If the filter doesn't exist, return the same array to prevent rerender
      if (!prevFilters.some(f => f.attributeCode === attributeCode)) {
        return prevFilters;
      }
      
      return prevFilters.filter(filter => filter.attributeCode !== attributeCode);
    });
  }, []);
  
  // Memoize clearFilters to avoid unnecessary rerenders
  const clearFilters = useCallback(() => {
    // Only clear if there are actually filters to clear
    setPendingFilters([]);
    
    // Only update URL if there are actual filters to clear
    if (filters.length > 0) {
      // Update URL by removing all filter_ params
      const url = new URL(window.location.href);
      
      for (const key of [...url.searchParams.keys()]) {
        if (key.startsWith('filter_')) {
          url.searchParams.delete(key);
        }
      }
      
      // Make a copy to trigger proper state update
      const emptyFilters: FilterValue[] = [];
      setFilters(emptyFilters);
      
      router.push(url.pathname + url.search);
    }
  }, [filters, router]);
  
  // Memoize applyFilters to avoid unnecessary rerenders
  const applyFilters = useCallback(() => {
    // Only apply if there are changes to apply
    if (JSON.stringify(filters) !== JSON.stringify(pendingFilters)) {
      // Create a deep copy of pendingFilters to ensure state update is detected
      const newFilters = JSON.parse(JSON.stringify(pendingFilters));
      setFilters(newFilters);
      
      // Update URL with current filters
      const url = new URL(window.location.href);
      
      // First, remove all existing filter params
      for (const key of [...url.searchParams.keys()]) {
        if (key.startsWith('filter_')) {
          url.searchParams.delete(key);
        }
      }
      
      // Then add all current filters
      pendingFilters.forEach(filter => {
        let valueStr: string;
        
        if (Array.isArray(filter.value)) {
          valueStr = JSON.stringify(filter.value);
        } else if (filter.value === null) {
          valueStr = '';
        } else {
          valueStr = String(filter.value);
        }
        
        url.searchParams.set(`filter_${filter.attributeCode}`, valueStr);
      });
      
      // Use router.replace instead of push to avoid adding to history
      // This helps prevent back button issues
      router.push(url.pathname + url.search);
    }
  }, [filters, pendingFilters, router]);
  
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

// Wrapper component that doesn't use useSearchParams directly
export function FilterProvider({ children }: { children: ReactNode }) {
  return <FilterProviderWithSearchParams>{children}</FilterProviderWithSearchParams>;
}

export function useFilters() {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  
  return context;
} 