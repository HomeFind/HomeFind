import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AttributeFilter } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface ToggleFilterProps {
  attribute: AttributeFilter;
  onInteraction?: () => void;
}

export function ToggleFilter({ attribute, onInteraction }: ToggleFilterProps) {
  const { pendingFilters, setFilter, removeFilter } = useFilters();
  const [checked, setChecked] = useState<boolean | null>(null);

  // Initialize from existing filters
  useEffect(() => {
    const existingFilter = pendingFilters.find(f => f.attributeCode === attribute.code);
    if (existingFilter && typeof existingFilter.value === 'boolean') {
      setChecked(existingFilter.value);
    } else {
      setChecked(null);
    }
  }, [pendingFilters, attribute.code]);

  const handleToggleChange = (value: boolean) => {
    // Notify parent component about interaction
    if (onInteraction) onInteraction();
    
    if (checked === value) {
      // If the same value is clicked again, clear the filter
      setChecked(null);
      removeFilter(attribute.code);
    } else {
      // Otherwise, set the new value
      setChecked(value);
      setFilter({
        attributeCode: attribute.code,
        value
      });
    }
  };

  const clearFilter = () => {
    // Notify parent component about interaction
    if (onInteraction) onInteraction();
    
    setChecked(null);
    removeFilter(attribute.code);
  };

  // Check if the option is available based on filter context
  const isOptionAvailable = (value: boolean) => {
    if (!attribute.availableValues) return true;
    return attribute.availableValues.includes(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{attribute.name}</div>
        {checked !== null && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilter}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-2 border rounded-md p-3">
        <Label htmlFor={`${attribute.code}-toggle`} className="text-sm cursor-pointer">
          {checked === true ? "Yes" : checked === false ? "No" : "Any"}
        </Label>
        <div className="flex items-center gap-3">
          <Button 
            variant={checked === false ? "default" : "outline"} 
            size="sm"
            onClick={() => handleToggleChange(false)}
            className="h-8 px-3"
            disabled={!isOptionAvailable(false)}
          >
            No
          </Button>
          <Button 
            variant={checked === true ? "default" : "outline"} 
            size="sm"
            onClick={() => handleToggleChange(true)}
            className="h-8 px-3"
            disabled={!isOptionAvailable(true)}
          >
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
} 