// TODO [DEPRECATED]: This component is not used in the current static filters implementation
// Date filtering is not part of the current requirements. This file can be safely removed.

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { AttributeFilter } from '@/lib/database.types';
import { useFilters } from './filter-context';

interface DateRangeFilterProps {
  attribute: AttributeFilter;
}

export function DateRangeFilter({ attribute }: DateRangeFilterProps) {
  const { filters, setFilter, removeFilter } = useFilters();
  const [date, setDate] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);

  // Initialize from existing filters
  useEffect(() => {
    const existingFilter = filters.find(f => f.attributeCode === attribute.code);
    
    if (existingFilter && Array.isArray(existingFilter.value)) {
      const [from, to] = existingFilter.value as [string, string];
      setDate({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined
      });
    } else {
      setDate(undefined);
    }
  }, [filters, attribute.code]);

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    
    if (range?.from) {
      const filterValue: [string, string] = [
        range.from.toISOString().split('T')[0],
        range.to ? range.to.toISOString().split('T')[0] : range.from.toISOString().split('T')[0]
      ];
      
      setFilter({
        attributeCode: attribute.code,
        value: filterValue
      });
    } else {
      removeFilter(attribute.code);
    }
  };

  const clearFilter = () => {
    setDate(undefined);
    removeFilter(attribute.code);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{attribute.name}</Label>
        {date && (
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
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Select a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
} 