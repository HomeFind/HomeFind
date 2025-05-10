import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterValue } from '@/lib/database.types';

interface FilterContextType {
  filters: FilterValue[];
  setFilter: (filter: FilterValue) => void;
  removeFilter: (attributeCode: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
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
  
  const setFilter = (filter: FilterValue) => {
    setPendingFilters(prevFilters => {
      const existingIndex = prevFilters.findIndex(f => f.attributeCode === filter.attributeCode);
      
      if (existingIndex !== -1) {
        const newFilters = [...prevFilters];
        newFilters[existingIndex] = filter;
        return newFilters;
      } else {
        return [...prevFilters, filter];
      }
    });
  };
  
  const removeFilter = (attributeCode: string) => {
    setPendingFilters(prevFilters => 
      prevFilters.filter(filter => filter.attributeCode !== attributeCode)
    );
  };
  
  const clearFilters = () => {
    setPendingFilters([]);
    
    // Update URL by removing all filter_ params
    const url = new URL(window.location.href);
    
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('filter_')) {
        url.searchParams.delete(key);
      }
    }
    
    router.push(url.pathname + url.search);
    setFilters([]);
  };
  
  const applyFilters = () => {
    setFilters(pendingFilters);
    
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
    
    router.push(url.pathname + url.search);
  };
  
  return (
    <FilterContext.Provider 
      value={{ 
        filters, 
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

export function useFilters() {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  
  return context;
} 