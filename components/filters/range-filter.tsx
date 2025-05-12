import React, { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AttributeFilter } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface RangeFilterProps {
  attribute: AttributeFilter;
  min?: number | null;
  max?: number | null;
  step?: number;
  onInteraction?: () => void;
}

export function RangeFilter({ 
  attribute, 
  min = 0, 
  max = 100, 
  step = 1,
  onInteraction
}: RangeFilterProps) {
  // Ensure min and max are valid numbers based on attribute data
  const baseMin = typeof min === 'number' ? min : 0;
  const baseMax = typeof max === 'number' ? max : 100;
  
  // Use available min/max from filtered data if present
  const actualMin = typeof attribute.availableMinValue === 'number' ? attribute.availableMinValue : baseMin;
  const actualMax = typeof attribute.availableMaxValue === 'number' ? attribute.availableMaxValue : baseMax;
  
  const { pendingFilters, setFilter, removeFilter } = useFilters();
  const [range, setRange] = useState<[number, number]>([actualMin, actualMax]);
  const [inputValues, setInputValues] = useState<[string, string]>([actualMin.toString(), actualMax.toString()]);
  const [hasFilter, setHasFilter] = useState(false);

  // Initialize from existing filters or available values when they change
  useEffect(() => {
    const existingFilter = pendingFilters.find(f => f.attributeCode === attribute.code);
    
    if (existingFilter && Array.isArray(existingFilter.value)) {
      const filterValue = existingFilter.value as [number, number];
      
      // Ensure filter values are within the available range
      const clampedMin = Math.max(filterValue[0], actualMin);
      const clampedMax = Math.min(filterValue[1], actualMax);
      
      setRange([clampedMin, clampedMax]);
      setInputValues([clampedMin.toString(), clampedMax.toString()]);
      setHasFilter(true);
      
      // Update filter if values were clamped
      if (clampedMin !== filterValue[0] || clampedMax !== filterValue[1]) {
        setFilter({
          attributeCode: attribute.code,
          value: [clampedMin, clampedMax]
        });
      }
    } else {
      // Reset to defaults when no filter is active
      setRange([actualMin, actualMax]);
      setInputValues([actualMin.toString(), actualMax.toString()]);
      setHasFilter(false);
    }
  }, [pendingFilters, attribute.code, actualMin, actualMax, attribute.availableMinValue, attribute.availableMaxValue, setFilter]);

  // Debug log to help see when available values change
  useEffect(() => {
    console.log(`Range filter ${attribute.code} available values:`, {
      min: attribute.minValue,
      max: attribute.maxValue,
      availableMin: attribute.availableMinValue,
      availableMax: attribute.availableMaxValue
    });
  }, [attribute.minValue, attribute.maxValue, attribute.availableMinValue, attribute.availableMaxValue, attribute.code]);

  const handleSliderChange = (values: number[]) => {
    // Call onInteraction when the slider is changed
    if (onInteraction) onInteraction();
    
    const newRange: [number, number] = [values[0], values[1]];
    setRange(newRange);
    setInputValues([newRange[0].toString(), newRange[1].toString()]);
    
    // Only set the filter if it's different from the min/max
    if (newRange[0] > actualMin || newRange[1] < actualMax) {
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
    // Call onInteraction when input changes
    if (onInteraction) onInteraction();
    
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
    
    // Clamp to available values
    if (index === 0 && newRange[0] < actualMin) {
      newRange[0] = actualMin;
      newInputValues[0] = actualMin.toString();
      setInputValues(newInputValues);
    } else if (index === 1 && newRange[1] > actualMax) {
      newRange[1] = actualMax;
      newInputValues[1] = actualMax.toString();
      setInputValues(newInputValues);
    }
    
    setRange(newRange);
  };

  const handleInputBlur = () => {
    // When the input loses focus, update the filter
    if (range[0] > actualMin || range[1] < actualMax) {
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
    if (onInteraction) onInteraction();
    
    setRange([actualMin, actualMax]);
    setInputValues([actualMin.toString(), actualMax.toString()]);
    removeFilter(attribute.code);
    setHasFilter(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium">{attribute.name}</div>
        {hasFilter && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilter}
            className="h-5 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      
      <div className="pt-2 px-1">
        <Slider
          defaultValue={[actualMin, actualMax]}
          value={[range[0], range[1]]}
          min={actualMin}
          max={actualMax}
          step={step}
          onValueChange={handleSliderChange}
          className="my-4"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Label htmlFor={`${attribute.code}-min`} className="sr-only">Minimum</Label>
          <Input
            id={`${attribute.code}-min`}
            type="number"
            min={actualMin}
            max={range[1]}
            step={step}
            value={inputValues[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onBlur={handleInputBlur}
            className="h-7 text-xs"
          />
        </div>
        <span className="text-xs text-muted-foreground">to</span>
        <div className="flex-1">
          <Label htmlFor={`${attribute.code}-max`} className="sr-only">Maximum</Label>
          <Input
            id={`${attribute.code}-max`}
            type="number"
            min={range[0]}
            max={actualMax}
            step={step}
            value={inputValues[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            onBlur={handleInputBlur}
            className="h-7 text-xs"
          />
        </div>
      </div>
      
      {/* Display available range info if different from base range */}
      {(attribute.availableMinValue !== null || attribute.availableMaxValue !== null) && 
       (attribute.availableMinValue !== attribute.minValue || attribute.availableMaxValue !== attribute.maxValue) && (
        <div className="text-xs text-muted-foreground mt-1">
          Range: {attribute.availableMinValue} - {attribute.availableMaxValue}
        </div>
      )}
    </div>
  );
} 