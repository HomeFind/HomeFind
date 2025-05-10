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
        <RangeFilter 
          attribute={attribute} 
          min={attribute.minValue ?? 0} 
          max={attribute.maxValue ?? 100}
          onInteraction={onInteraction}
        />
      );
    
    case 'BOOLEAN':
      return <ToggleFilter attribute={attribute} onInteraction={onInteraction} />;
    
    case 'ENUM':
      return <SelectFilter attribute={attribute} onInteraction={onInteraction} />;
    
    default:
      // Skip all other attribute types
      return null;
  }
} 