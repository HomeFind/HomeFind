import React, { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, Tag, X } from 'lucide-react';
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
      return "Select options...";
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
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="h-5 px-2 text-xs text-muted-foreground"
          >
            Reset
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
            className={cn(
              "w-full justify-between font-normal h-9 text-xs relative border-border/60",
              selectedOptions.length > 0 ? "bg-accent/10" : ""
            )}
          >
            <span className="truncate">{getButtonText()}</span>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[calc(100vw-40px)] p-0 max-h-[300px] overflow-y-auto">
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
                    {/* Show count only if available */}
                    {(option as any).count !== undefined && (
                      <span className="ml-auto text-xs opacity-70">({(option as any).count})</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {attribute.isMultiple && selectedOptions.length > 0 && (
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
                <X className="h-2 w-2" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 