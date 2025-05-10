import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AttributeFilter } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface ToggleFilterProps {
  attribute: AttributeFilter;
}

export function ToggleFilter({ attribute }: ToggleFilterProps) {
  const { filters, setFilter, removeFilter } = useFilters();
  const [checked, setChecked] = useState<boolean | null>(null);

  // Initialize from existing filters
  useEffect(() => {
    const existingFilter = filters.find(f => f.attributeCode === attribute.code);
    if (existingFilter && typeof existingFilter.value === 'boolean') {
      setChecked(existingFilter.value);
    } else {
      setChecked(null);
    }
  }, [filters, attribute.code]);

  const handleToggleChange = (value: boolean) => {
    setChecked(value);
    setFilter({
      attributeCode: attribute.code,
      value
    });
  };

  const clearFilter = () => {
    setChecked(null);
    removeFilter(attribute.code);
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
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch
          checked={checked === true}
          onCheckedChange={() => handleToggleChange(true)}
          id={`${attribute.code}-yes`}
        />
        <Label htmlFor={`${attribute.code}-yes`} className="text-sm">Yes</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={checked === false}
          onCheckedChange={() => handleToggleChange(false)}
          id={`${attribute.code}-no`}
        />
        <Label htmlFor={`${attribute.code}-no`} className="text-sm">No</Label>
      </div>
    </div>
  );
} 