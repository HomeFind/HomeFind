import React from 'react';
import { AttributeFilter as AttributeFilterType } from '@/lib/database.types';
import { SelectFilter } from './select-filter';
import { RangeFilter } from './range-filter';
import { ToggleFilter } from './toggle-filter';
import { DateRangeFilter } from './date-range-filter';

interface AttributeFilterProps {
  attribute: AttributeFilterType;
}

export function AttributeFilter({ attribute }: AttributeFilterProps) {
  // Determine which filter component to render based on the attribute type
  switch (attribute.type) {
    case 'NUMBER':
      return <RangeFilter attribute={attribute} />;
    
    case 'BOOLEAN':
      return <ToggleFilter attribute={attribute} />;
    
    case 'DATE':
      return <DateRangeFilter attribute={attribute} />;
    
    case 'ENUM':
      return <SelectFilter attribute={attribute} />;
    
    case 'VARCHAR':
      // For VARCHAR, we use SelectFilter if options are provided, otherwise we skip it
      if (attribute.options && attribute.options.length > 0) {
        return <SelectFilter attribute={attribute} />;
      }
      // We could add a text input filter here if needed
      return null;
    
    default:
      // Unknown attribute type
      return null;
  }
} 