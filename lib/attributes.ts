import { supabase } from './supabase';
import { AttributeFilter, AttributeType, AttributeOptionType, FilterValue } from './database.types';

/**
 * Fetches all attribute definitions
 */
export async function getAttributes(): Promise<AttributeType[]> {
  const { data, error } = await supabase
    .from('attributes')
    .select('*')
    .order('attribute_name');

  if (error) {
    console.error('Error fetching attributes:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches options for a specific attribute
 */
export async function getAttributeOptions(attributeId: number): Promise<AttributeOptionType[]> {
  const { data, error } = await supabase
    .from('attribute_options')
    .select('*')
    .eq('attribute_id', attributeId);

  if (error) {
    console.error(`Error fetching options for attribute ${attributeId}:`, error);
    return [];
  }

  return data || [];
}

interface AttributeResult {
  id: number;
  attribute_code: string;
  attribute_name: string;
  data_type: 'NUMBER' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'ENUM';
  is_enumeration: boolean;
  is_multiple: boolean;
  options: any[] | null;
  min_value: number | null;
  max_value: number | null;
  available_values: any;
}

/**
 * Fetches all attribute definitions with their options and min/max values
 * Also provides available values based on currently applied filters
 */
export async function getAttributesWithOptions(
  currentFilters: FilterValue[] = [],
  currentAttributeCode?: string
): Promise<AttributeFilter[]> {
  // Prepare filter JSON for the database function
  const filterJson = currentFilters.map(filter => ({
    attributeCode: filter.attributeCode,
    value: filter.value,
    // Mark the current attribute we're getting options for
    isCurrentAttribute: filter.attributeCode === currentAttributeCode ? true : undefined
  }));

  // Call the database function
  const { data, error } = await supabase
    .rpc('get_filtered_attributes', {
      filter_json: filterJson.length > 0 ? filterJson : null
    });

  if (error) {
    console.error('Error fetching filtered attributes:', error);
    return [];
  }

  // Transform the data into the expected format
  const attributes: AttributeFilter[] = data.map((attr: AttributeResult) => {
    // Base attribute object
    const attribute: AttributeFilter = {
      code: attr.attribute_code,
      type: attr.data_type,
      name: attr.attribute_name,
      options: attr.options || [],
      isMultiple: attr.is_multiple,
    };

    // Add min/max for NUMBER types
    if (attr.data_type === 'NUMBER') {
      attribute.minValue = attr.min_value;
      attribute.maxValue = attr.max_value;

      // Add available min/max from filtered data
      if (attr.available_values) {
        attribute.availableMinValue = attr.available_values.min;
        attribute.availableMaxValue = attr.available_values.max;
      }
    }

    // Add available options for ENUM types
    if (attr.data_type === 'ENUM' && attr.available_values) {
      attribute.availableOptions = attr.available_values;
    }

    // Add available values for BOOLEAN types
    if (attr.data_type === 'BOOLEAN' && attr.available_values) {
      attribute.availableValues = attr.available_values;
    }

    return attribute;
  });
  
  return attributes;
} 