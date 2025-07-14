// TODO [DEPRECATED]: Boolean filters not needed for static filters
import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AttributeFilter } from '@/lib/database.types';
import { useFilters } from './filter-context';
import { cn } from '@/lib/utils';

interface ToggleFilterProps {
  attribute: AttributeFilter;
  onInteraction?: () => void;
}

// TODO [DEPRECATED]: Boolean filters not needed for static filters
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


  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium">{attribute.name}</div>
        {checked !== null && (
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
      
      <div className="flex justify-between gap-2">
        <div
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-md border cursor-pointer transition-colors",
            checked === false 
              ? "bg-accent border-accent-foreground/20" 
              : "bg-background hover:bg-muted/50 border-border/60"
          )}
          onClick={() => handleToggleChange(false)}
        >
          {checked === false ? (
            <XCircle className="h-4 w-4 text-accent-foreground/80" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <Label className={cn(
            "text-xs cursor-pointer transition-colors",
            checked === false ? "font-medium text-accent-foreground" : "text-muted-foreground"
          )}>
            No
          </Label>
        </div>
        
        <div
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-md border cursor-pointer transition-colors",
            checked === true
              ? "bg-accent border-accent-foreground/20" 
              : "bg-background hover:bg-muted/50 border-border/60"
          )}
          onClick={() => handleToggleChange(true)}
        >
          {checked === true ? (
            <CheckCircle2 className="h-4 w-4 text-accent-foreground/80" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" />
          )}
          <Label className={cn(
            "text-xs cursor-pointer transition-colors",
            checked === true ? "font-medium text-accent-foreground" : "text-muted-foreground"
          )}>
            Yes
          </Label>
        </div>
      </div>
      
      {checked === null && (
        <div className="text-center py-0.5">
          <span className="text-xs text-muted-foreground">Any value</span>
        </div>
      )}
    </div>
  );
} 