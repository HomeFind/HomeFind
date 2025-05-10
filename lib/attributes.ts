import { supabase } from './supabase';
import { AttributeFilter, AttributeType, AttributeOptionType } from './database.types';

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
}

/**
 * Fetches all attribute definitions with their options and min/max values using the database procedure
 */
export async function getAttributesWithOptions(): Promise<AttributeFilter[]> {
  const { data, error } = await supabase
    .rpc('get_attributes');

  if (error) {
    console.error('Error fetching attributes:', error);
    return [];
  }

  // Transform the data into the expected format
  const attributes: AttributeFilter[] = data.map((attr: AttributeResult) => ({
    code: attr.attribute_code,
    type: attr.data_type,
    name: attr.attribute_name,
    options: attr.options || [],
    isMultiple: attr.is_multiple,
    // Add min/max for NUMBER types
    ...(attr.data_type === 'NUMBER' && {
      minValue: attr.min_value,
      maxValue: attr.max_value
    })
  }));
  
  return attributes;
} 