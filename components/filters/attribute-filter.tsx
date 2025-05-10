import React from 'react';
import { AttributeFilter as AttributeFilterType } from '@/lib/database.types';
import { SelectFilter } from './select-filter';
import { RangeFilter } from './range-filter';
import { ToggleFilter } from './toggle-filter';

interface AttributeFilterProps {
  attribute: AttributeFilterType;
}

export function AttributeFilter({ attribute }: AttributeFilterProps) {
  // Only render filters for ENUM, NUMBER, and BOOLEAN types
  switch (attribute.type) {
    case 'NUMBER':
      return <RangeFilter attribute={attribute} />;
    
    case 'BOOLEAN':
      return <ToggleFilter attribute={attribute} />;
    
    case 'ENUM':
      return <SelectFilter attribute={attribute} />;
    
    default:
      // Skip all other attribute types
      return null;
  }
} 