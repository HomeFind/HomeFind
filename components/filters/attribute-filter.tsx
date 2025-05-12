import React from 'react';
import { AttributeFilter as AttributeFilterType } from '@/lib/database.types';
import { SelectFilter } from './select-filter';
import { RangeFilter } from './range-filter';
import { ToggleFilter } from './toggle-filter';

interface AttributeFilterProps {
  attribute: AttributeFilterType;
  onInteraction?: () => void;
}

export function AttributeFilter({ attribute, onInteraction }: AttributeFilterProps) {
  // Only render filters for ENUM, NUMBER, and BOOLEAN types
  switch (attribute.type) {
    case 'NUMBER':
      return (
        <div className="text-sm">
          <RangeFilter 
            attribute={attribute} 
            min={attribute.minValue ?? 0} 
            max={attribute.maxValue ?? 100}
            onInteraction={onInteraction}
          />
        </div>
      );
    
    case 'BOOLEAN':
      return (
        <div className="text-sm">
          <ToggleFilter attribute={attribute} onInteraction={onInteraction} />
        </div>
      );
    
    case 'ENUM':
      return (
        <div className="text-sm">
          <SelectFilter attribute={attribute} onInteraction={onInteraction} />
        </div>
      );
    
    default:
      // Skip all other attribute types
      return null;
  }
} 