import React, { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AttributeFilter } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface RangeFilterProps {
  attribute: AttributeFilter;
  min?: number;
  max?: number;
  step?: number;
}

export function RangeFilter({ attribute, min = 0, max = 100, step = 1 }: RangeFilterProps) {
  const { filters, setFilter, removeFilter } = useFilters();
  const [range, setRange] = useState<[number, number]>([min, max]);
  const [inputValues, setInputValues] = useState<[string, string]>([min.toString(), max.toString()]);
  const [hasFilter, setHasFilter] = useState(false);

  // Initialize from existing filters
  useEffect(() => {
    const existingFilter = filters.find(f => f.attributeCode === attribute.code);
    
    if (existingFilter && Array.isArray(existingFilter.value)) {
      const filterValue = existingFilter.value as [number, number];
      setRange(filterValue);
      setInputValues([filterValue[0].toString(), filterValue[1].toString()]);
      setHasFilter(true);
    } else {
      setHasFilter(false);
    }
  }, [filters, attribute.code]);

  const handleSliderChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setRange(newRange);
    setInputValues([newRange[0].toString(), newRange[1].toString()]);
    
    // Only set the filter if it's different from the min/max
    if (newRange[0] > min || newRange[1] < max) {
      setFilter({
        attributeCode: attribute.code,
        value: newRange
      });
      setHasFilter(true);
    } else {
      removeFilter(attribute.code);
      setHasFilter(false);
    }
  };

  const handleInputChange = (index: 0 | 1, value: string) => {
    // Update the input value immediately for responsive UI
    const newInputValues: [string, string] = [...inputValues] as [string, string];
    newInputValues[index] = value;
    setInputValues(newInputValues);
    
    // If the value is not a valid number, don't update the range
    if (isNaN(Number(value)) || value === '') {
      return;
    }
    
    // Update the range value
    const newRange: [number, number] = [...range] as [number, number];
    newRange[index] = Number(value);
    
    // Ensure min <= max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[0] = newRange[1];
      newInputValues[0] = newRange[1].toString();
      setInputValues(newInputValues);
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[1] = newRange[0];
      newInputValues[1] = newRange[0].toString();
      setInputValues(newInputValues);
    }
    
    setRange(newRange);
  };

  const handleInputBlur = () => {
    // When the input loses focus, update the filter
    if (range[0] > min || range[1] < max) {
      setFilter({
        attributeCode: attribute.code,
        value: range
      });
      setHasFilter(true);
    } else {
      removeFilter(attribute.code);
      setHasFilter(false);
    }
  };

  const clearFilter = () => {
    setRange([min, max]);
    setInputValues([min.toString(), max.toString()]);
    removeFilter(attribute.code);
    setHasFilter(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{attribute.name}</div>
        {hasFilter && (
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
      
      <div className="pt-4 px-2">
        <Slider
          defaultValue={[min, max]}
          value={[range[0], range[1]]}
          min={min}
          max={max}
          step={step}
          onValueChange={handleSliderChange}
          className="my-6"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Label htmlFor={`${attribute.code}-min`} className="sr-only">Minimum</Label>
          <Input
            id={`${attribute.code}-min`}
            type="number"
            min={min}
            max={range[1]}
            step={step}
            value={inputValues[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={handleInputBlur}
            className="h-8"
          />
        </div>
        <span className="text-sm text-muted-foreground">to</span>
        <div className="flex-1">
          <Label htmlFor={`${attribute.code}-max`} className="sr-only">Maximum</Label>
          <Input
            id={`${attribute.code}-max`}
            type="number"
            min={range[0]}
            max={max}
            step={step}
            value={inputValues[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={handleInputBlur}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
} 