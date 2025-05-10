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
}

export function SelectFilter({ attribute }: SelectFilterProps) {
  const { setFilter, filters, removeFilter } = useFilters();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Initialize from existing filters
  useEffect(() => {
    const existingFilter = filters.find(f => f.attributeCode === attribute.code);
    if (existingFilter) {
      if (Array.isArray(existingFilter.value)) {
        setSelectedOptions(existingFilter.value as string[]);
      } else if (existingFilter.value !== null) {
        setSelectedOptions([existingFilter.value.toString()]);
      }
    }
  }, [filters, attribute.code]);

  const handleOptionToggle = (optionValue: string) => {
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
    setSelectedOptions([]);
    removeFilter(attribute.code);
  };

  // Handle the display text for the button
  const getButtonText = () => {
    if (selectedOptions.length === 0) {
      return attribute.name;
    }

    if (attribute.isMultiple) {
      return `${attribute.name} (${selectedOptions.length})`;
    }

    // For single select, find the display name
    const optionObj = attribute.options?.find(opt => opt.option_value === selectedOptions[0]);
    return optionObj ? optionObj.option_value : selectedOptions[0];
  };

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{attribute.name}</span>
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
              {attribute.options?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.option_value}
                  onSelect={() => handleOptionToggle(option.option_value)}
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