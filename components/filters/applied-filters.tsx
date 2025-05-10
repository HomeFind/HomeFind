import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { FilterValue } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface AppliedFiltersProps {
  listingCount: number;
  loading?: boolean;
}

// Function to format filter values for display
const formatFilterDisplay = (filter: FilterValue): string => {
  // Convert attributeCode from snake_case or camelCase to Title Case
  const attributeName = filter.attributeCode
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  
  // Format the value based on its type
  let valueDisplay = '';
  
  if (filter.value === null) {
    valueDisplay = 'Any';
  } else if (typeof filter.value === 'boolean') {
    valueDisplay = filter.value ? 'Yes' : 'No';
  } else if (Array.isArray(filter.value)) {
    // Handle range filters [min, max]
    if (filter.value.length === 2 && 
        (typeof filter.value[0] === 'number' || typeof filter.value[1] === 'number')) {
      const [min, max] = filter.value;
      valueDisplay = `${min} - ${max}`;
    } 
    // Handle multi-select filters
    else {
      valueDisplay = filter.value.join(', ');
    }
  } else {
    valueDisplay = String(filter.value);
  }
  
  return `${attributeName}: ${valueDisplay}`;
};

export function AppliedFilters({ listingCount, loading = false }: AppliedFiltersProps) {
  const { filters, removeFilter, applyFilters, clearFilters } = useFilters();
  
  if (loading) return null;
  
  const handleRemoveFilter = (attributeCode: string) => {
    removeFilter(attributeCode);
    // Apply the filter changes immediately
    applyFilters();
  };
  
  const handleClearAll = () => {
    clearFilters();
  };
  
  return (
    <div className="mb-4 bg-muted/30 p-3 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm">
          {listingCount > 0 ? (
            <span>Found <strong>{listingCount}</strong> {listingCount === 1 ? 'property' : 'properties'}</span>
          ) : (
            <span>No properties found</span>
          )}
        </div>
        
        {filters.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 px-2"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        )}
      </div>
      
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-sm text-muted-foreground py-1">Filters:</span>
          {filters.map((filter) => (
            <Badge 
              key={filter.attributeCode} 
              variant="secondary" 
              className="text-xs flex items-center gap-1 pl-2 pr-1 py-1"
            >
              {formatFilterDisplay(filter)}
              <Button
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0 ml-1 hover:bg-muted-foreground/20 rounded-full"
                onClick={() => handleRemoveFilter(filter.attributeCode)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 