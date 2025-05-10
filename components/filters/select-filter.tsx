import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { AttributeFilter, AttributeOptionType } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface SelectFilterProps {
  attribute: AttributeFilter;
  onInteraction?: () => void;
}

export function SelectFilter({ attribute, onInteraction }: SelectFilterProps) {
  const { setFilter, pendingFilters, removeFilter } = useFilters();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Initialize from existing filters
  useEffect(() => {
    const existingFilter = pendingFilters.find(f => f.attributeCode === attribute.code);
    if (existingFilter) {
      if (Array.isArray(existingFilter.value)) {
        setSelectedOptions(existingFilter.value as string[]);
      } else if (existingFilter.value !== null) {
        setSelectedOptions([existingFilter.value.toString()]);
      }
    } else {
      // Reset when filter is removed
      setSelectedOptions([]);
    }
  }, [pendingFilters, attribute.code]);

  const handleOptionToggle = (optionValue: string) => {
    // Call onInteraction only once when an option is changed
    if (onInteraction) onInteraction();
    
    let newSelectedOptions: string[];

    if (attribute.isMultiple) {
      // For multi-select, toggle the selected state
      if (selectedOptions.includes(optionValue)) {
        newSelectedOptions = selectedOptions.filter(o => o !== optionValue);
      } else {
        newSelectedOptions = [...selectedOptions, optionValue];
      }
    } else {
      // For single-select, replace the selection
      newSelectedOptions = [optionValue];
      setOpen(false);
    }

    setSelectedOptions(newSelectedOptions);

    // Update filter context
    if (newSelectedOptions.length > 0) {
      setFilter({
        attributeCode: attribute.code,
        value: attribute.isMultiple ? newSelectedOptions : newSelectedOptions[0]
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

  // Handle the display text for the button
  const getButtonText = () => {
    if (selectedOptions.length === 0) {
      return "Select...";
    }

    if (attribute.isMultiple) {
      return `${selectedOptions.length} selected`;
    }

    // For single select, find the display name
    const optionObj = attribute.options?.find(opt => opt.option_value === selectedOptions[0]);
    return optionObj ? optionObj.option_value : selectedOptions[0];
  };

  // Filter options based on available values
  const filteredOptions = attribute.options?.filter(option => {
    // If we have available options, only show those
    if (attribute.availableOptions && attribute.availableOptions.length > 0) {
      return attribute.availableOptions.includes(option.option_value);
    }
    return true;
  });

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{attribute.name}</div>
        {selectedOptions.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      <Popover 
        open={open} 
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          // Only call onInteraction when opening, not on every change
          if (isOpen && onInteraction) onInteraction();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {getButtonText()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${attribute.name.toLowerCase()}...`} />
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.option_value}
                  onSelect={() => handleOptionToggle(option.option_value)}
                  disabled={attribute.availableOptions && !attribute.availableOptions.includes(option.option_value)}
                  className={cn(
                    attribute.availableOptions && !attribute.availableOptions.includes(option.option_value) 
                      ? "opacity-50 cursor-not-allowed" 
                      : ""
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedOptions.includes(option.option_value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.option_value}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {attribute.isMultiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedOptions.map((option) => (
            <Badge 
              key={option} 
              variant="secondary"
              className="text-xs" 
            >
              {option}
              <button 
                className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-1"
                onClick={() => handleOptionToggle(option)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 