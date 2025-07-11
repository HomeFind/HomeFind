import React, { useState, useCallback, useEffect } from 'react';
import { X, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Tag, ArrowRightCircle, X as XIcon } from 'lucide-react';
import { useFilters } from './filter-context';
import { cn } from '@/lib/utils';
import { getAttributesWithOptions } from '@/lib/attributes';
import { AttributeFilter } from '@/lib/database.types';
import { Skeleton } from '@/components/ui/skeleton';

interface StaticFiltersPanelProps {
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

// Define the static filter codes in the required order
const STATIC_FILTER_CODES = [
  'number_of_rooms',
  'price', 
  'total_area',
  'district',
  'building_type',
  'housing_type',
  'ad_type'
];

// Range component for number filters (without slider)
function RangeFilter({ 
  attribute,
  onInteraction
}: { 
  attribute: AttributeFilter;
  onInteraction?: () => void;
}) {
  const { pendingFilters, setFilter, removeFilter } = useFilters();
  const min = attribute.availableMinValue ?? attribute.minValue ?? 0;
  const max = attribute.availableMaxValue ?? attribute.maxValue ?? 100;
  
  const [range, setRange] = useState<[number | null, number | null]>([null, null]);
  const [inputValues, setInputValues] = useState<[string, string]>(['', '']);
  
  const existingFilter = pendingFilters.find(f => f.attributeCode === attribute.code);
  const hasFilter = existingFilter && Array.isArray(existingFilter.value);
  
  React.useEffect(() => {
    if (existingFilter && Array.isArray(existingFilter.value)) {
      const filterValue = existingFilter.value as [number, number];
      setRange(filterValue);
      setInputValues([filterValue[0].toString(), filterValue[1].toString()]);
    } else if (!existingFilter) {
      // Only reset if there's no existing filter
      setRange([null, null]);
      setInputValues(['', '']);
    }
  }, [existingFilter?.attributeCode, JSON.stringify(existingFilter?.value)]); // Use JSON.stringify to avoid reference issues

  const handleInputChange = (index: 0 | 1, value: string) => {
    if (onInteraction) onInteraction();
    
    const newInputValues: [string, string] = [...inputValues] as [string, string];
    newInputValues[index] = value;
    setInputValues(newInputValues);
    
    if (isNaN(Number(value)) || value === '') {
      const newRange: [number | null, number | null] = [...range];
      newRange[index] = null;
      setRange(newRange);
      return;
    }
    
    const newRange: [number | null, number | null] = [...range];
    newRange[index] = Number(value);
    setRange(newRange);
  };

  const handleInputBlur = () => {
    // Only apply filter if both values are present and valid
    if (range[0] !== null && range[1] !== null) {
      setFilter({
        attributeCode: attribute.code,
        value: [range[0], range[1]]
      });
    } else if (range[0] !== null || range[1] !== null) {
      // If only one value is present, still apply the filter with the available value
      const minVal = range[0] ?? min;
      const maxVal = range[1] ?? max;
      setFilter({
        attributeCode: attribute.code,
        value: [minVal, maxVal]
      });
    } else {
      removeFilter(attribute.code);
    }
  };

  const clearFilter = () => {
    if (onInteraction) onInteraction();
    setRange([null, null]);
    setInputValues(['', '']);
    removeFilter(attribute.code);
  };

  const formatValue = (value: number) => {
    if (attribute.code === 'price') {
      return `$${value.toLocaleString()}`;
    } else if (attribute.code === 'total_area') {
      return `${value}m²`;
    }
    return value.toString();
  };

  const step = attribute.code === 'price' ? 10000 : 1;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium flex items-center gap-1.5">
          {attribute.name}
        </div>
        {hasFilter && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilter}
            className="h-5 px-2 text-xs text-muted-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      <div className="bg-muted/20 p-2 rounded-md border border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Label htmlFor={`${attribute.code}-min`} className="text-[10px] text-muted-foreground mb-1 block">
              Minimum
            </Label>
            <Input
              id={`${attribute.code}-min`}
              type="number"
              inputMode="decimal"
              step={step}
              value={inputValues[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              onBlur={handleInputBlur}
              className="h-7 text-xs"
              placeholder="Min"
            />
          </div>
          
          <div className="pt-5">
            <ArrowRightCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex-1">
            <Label htmlFor={`${attribute.code}-max`} className="text-[10px] text-muted-foreground mb-1 block">
              Maximum
            </Label>
            <Input
              id={`${attribute.code}-max`}
              type="number"
              inputMode="decimal"
              step={step}
              value={inputValues[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              onBlur={handleInputBlur}
              className="h-7 text-xs"
              placeholder="Max"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">Min: {formatValue(min)}</span>
          <span className="text-[10px] text-muted-foreground">Max: {formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
}

// Select component for enum filters
function SelectFilter({ 
  attribute,
  onInteraction
}: { 
  attribute: AttributeFilter;
  onInteraction?: () => void;
}) {
  const { setFilter, pendingFilters, removeFilter } = useFilters();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const existingFilter = pendingFilters.find(f => f.attributeCode === attribute.code);
  const isMultiple = attribute.isMultiple !== false; // Default to true for most filters
  
  // Update dropdown width when trigger ref changes
  React.useEffect(() => {
    if (triggerRef.current) {
      setDropdownWidth(triggerRef.current.offsetWidth);
    }
  }, [open]);
  
  React.useEffect(() => {
    if (existingFilter) {
      if (Array.isArray(existingFilter.value)) {
        setSelectedOptions(existingFilter.value as string[]);
      } else if (existingFilter.value !== null) {
        setSelectedOptions([existingFilter.value.toString()]);
      }
    } else if (!existingFilter) {
      // Only reset if there's no existing filter
      setSelectedOptions([]);
    }
  }, [existingFilter?.attributeCode, JSON.stringify(existingFilter?.value)]); // Use JSON.stringify to avoid reference issues

  const handleOptionToggle = (optionValue: string) => {
    if (onInteraction) onInteraction();
    
    let newSelectedOptions: string[];

    if (isMultiple) {
      if (selectedOptions.includes(optionValue)) {
        newSelectedOptions = selectedOptions.filter(o => o !== optionValue);
      } else {
        newSelectedOptions = [...selectedOptions, optionValue];
      }
    } else {
      newSelectedOptions = [optionValue];
      setOpen(false);
    }

    setSelectedOptions(newSelectedOptions);

    if (newSelectedOptions.length > 0) {
      setFilter({
        attributeCode: attribute.code,
        value: isMultiple ? newSelectedOptions : newSelectedOptions[0]
      });
    } else {
      removeFilter(attribute.code);
    }
  };

  const clearSelection = () => {
    if (onInteraction) onInteraction();
    setSelectedOptions([]);
    removeFilter(attribute.code);
  };

  const getButtonText = () => {
    if (selectedOptions.length === 0) {
      return "Select options...";
    }

    if (isMultiple) {
      return `${selectedOptions.length} selected`;
    }

    return selectedOptions[0];
  };

  // Filter options based on available values
  const filteredOptions = attribute.options?.filter(option => {
    if (attribute.availableOptions && attribute.availableOptions.length > 0) {
      return attribute.availableOptions.includes(option.option_value);
    }
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium flex items-center gap-1.5">
          {attribute.name}
          {selectedOptions.length > 0 && (
            <Badge variant="outline" className="h-4 text-[10px] px-1.5 bg-muted/40 border-border/60">
              {selectedOptions.length}
            </Badge>
          )}
        </div>
        {selectedOptions.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearSelection}
            className="h-5 px-2 text-xs text-muted-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal h-9 text-xs relative border-border/60",
              selectedOptions.length > 0 ? "bg-accent/10" : ""
            )}
          >
            <span className="truncate">{getButtonText()}</span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 max-h-[300px] overflow-y-auto"
          style={{ width: dropdownWidth }}
          align="start"
        >
          <Command>
            <CommandInput placeholder={`Search ${attribute.name.toLowerCase()}...`} className="h-8 text-xs" />
            <CommandEmpty className="py-2 text-xs text-center">No options found</CommandEmpty>
            <CommandGroup className="max-h-[240px] overflow-auto">
              {filteredOptions?.map((option) => {
                const isAvailable = !attribute.availableOptions || 
                                    attribute.availableOptions.includes(option.option_value);
                return (
                  <CommandItem
                    key={option.id}
                    value={option.option_value}
                    onSelect={() => isAvailable && handleOptionToggle(option.option_value)}
                    disabled={!isAvailable}
                    className={cn(
                      "text-xs py-2 px-2",
                      !isAvailable && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "mr-2 h-3.5 w-3.5 flex items-center justify-center rounded-sm border border-primary/30",
                      selectedOptions.includes(option.option_value) ? "bg-primary border-primary" : "opacity-50"
                    )}>
                      {selectedOptions.includes(option.option_value) && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                    <span className="flex-1">{option.option_value}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {isMultiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedOptions.map((option) => (
            <Badge 
              key={option} 
              variant="secondary"
              className="text-xs py-0.5 px-2 rounded-full flex items-center gap-1 bg-accent/20 hover:bg-accent/30" 
            >
              <Tag className="h-2.5 w-2.5" />
              {option}
              <button 
                className="rounded-full w-3.5 h-3.5 bg-muted/70 hover:bg-muted flex items-center justify-center ml-0.5"
                onClick={() => handleOptionToggle(option)}
                aria-label={`Remove ${option}`}
              >
                <XIcon className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function StaticFiltersPanel({ className, onClose, isOpen = true }: StaticFiltersPanelProps) {
  const { clearFilters, applyFilters, filters, pendingFilters } = useFilters();
  const [attributes, setAttributes] = useState<Map<string, AttributeFilter>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeAttribute, setActiveAttribute] = useState<string | undefined>(undefined);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Initial fetch only
  useEffect(() => {
    const fetchAttributes = async () => {
      setLoading(true);
      try {
        const attributesData = await getAttributesWithOptions([], undefined);
        
        // Create a map of attributes by code
        const attributeMap = new Map<string, AttributeFilter>();
        attributesData.forEach(attr => {
          if (STATIC_FILTER_CODES.includes(attr.code)) {
            attributeMap.set(attr.code, attr);
          }
        });
        
        setAttributes(attributeMap);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialLoadComplete) {
      fetchAttributes();
    }
  }, [initialLoadComplete]);

  // Only refresh when filters are actually applied (not on pending changes)
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const fetchUpdatedAttributes = async () => {
      try {
        const attributesData = await getAttributesWithOptions(filters, undefined);
        
        // Update attributes while preserving existing state
        setAttributes(prevAttributes => {
          const newAttributes = new Map(prevAttributes);
          attributesData.forEach(attr => {
            if (STATIC_FILTER_CODES.includes(attr.code)) {
              // Only update the options/ranges, preserve the component state
              const existing = newAttributes.get(attr.code);
              if (existing) {
                newAttributes.set(attr.code, {
                  ...existing,
                  options: attr.options,
                  availableOptions: attr.availableOptions,
                  minValue: attr.minValue,
                  maxValue: attr.maxValue,
                  availableMinValue: attr.availableMinValue,
                  availableMaxValue: attr.availableMaxValue
                });
              } else {
                newAttributes.set(attr.code, attr);
              }
            }
          });
          return newAttributes;
        });
      } catch (error) {
        console.error('Error fetching updated attributes:', error);
      }
    };

    fetchUpdatedAttributes();
  }, [filters, initialLoadComplete]);

  // Handle attribute interaction - simplified to avoid re-fetching on every interaction
  const handleAttributeInteraction = useCallback((attributeCode: string) => {
    setActiveAttribute(attributeCode);
    // Note: We've removed the immediate re-fetch to prevent input clearing
    // Options will be updated when filters are actually applied
  }, []);

  const handleApplyFilters = useCallback(() => {
    applyFilters();
    onClose?.();
  }, [applyFilters, onClose]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  if (!isOpen) {
    return null;
  }

  const hasPendingFilters = pendingFilters.length > 0;
  const hasFilterChanges = JSON.stringify(filters) !== JSON.stringify(pendingFilters);
  const activeFilterCount = pendingFilters.length;

  return (
    <Card className={cn("overflow-hidden border-muted/60 shadow-sm", className)}>
      <CardHeader className="px-3 py-2 bg-background border-b border-border/40">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Settings2 className="h-4 w-4" />
            Property Filters
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
        
        {/* Action Buttons moved to top */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            disabled={!hasPendingFilters}
            className="h-9 text-xs"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleApplyFilters}
            disabled={!hasFilterChanges}
            className="h-9 text-xs gap-1.5 relative"
          >
            Apply Filters
            {activeFilterCount > 0 && (
              <span className="bg-primary-foreground text-primary rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-1/3 bg-muted rounded-md"></div>
                  <div className="h-8 bg-muted/60 rounded-md"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {STATIC_FILTER_CODES.map((code, index) => {
                const attribute = attributes.get(code);
                if (!attribute) return null;
                
                return (
                  <div key={code}>
                    {attribute.type === 'NUMBER' ? (
                      <RangeFilter 
                        attribute={attribute}
                        onInteraction={() => handleAttributeInteraction(code)}
                      />
                    ) : (
                      <SelectFilter 
                        attribute={attribute}
                        onInteraction={() => handleAttributeInteraction(code)}
                      />
                    )}
                    
                    {index < STATIC_FILTER_CODES.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
      </CardContent>
    </Card>
  );
}