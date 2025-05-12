import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, FilterX } from 'lucide-react';
import { FilterValue } from '@/lib/database.types';
import { useFilters } from './filter-context';
import { cn } from '@/lib/utils';

interface AppliedFiltersProps {
  listingCount: number;
  loading?: boolean;
}

// Function to format filter values for display
const formatFilterDisplay = (filter: FilterValue): { label: string; value: string } => {
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
  
  return { label: attributeName, value: valueDisplay };
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
  
  if (filters.length === 0) return null;

  return (
    <div className="mb-2 animate-in fade-in-0 zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span className="font-medium">Active Filters</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-1.5 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleClearAll}
        >
          <FilterX className="h-3 w-3" />
          <span>Reset</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {filters.map((filter) => {
          const { label, value } = formatFilterDisplay(filter);
          return (
            <Badge 
              key={filter.attributeCode} 
              variant="outline"
              className={cn(
                "text-xs rounded-full px-2 py-0.5 border border-border/60 bg-background",
                "flex items-center gap-1 hover:bg-accent/40 transition-colors whitespace-nowrap"
              )}
            >
              <span className="font-medium">{label}:</span>
              <span>{value}</span>
              <button 
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted flex items-center justify-center"
                onClick={() => handleRemoveFilter(filter.attributeCode)}
                aria-label={`Remove ${label} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
} 